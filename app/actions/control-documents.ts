"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "../lib/db"
import { ObjectId, GridFSBucket} from "mongodb"
import { formatFileSize } from "../lib/utils"
import type { Control, ControlDocument } from "../types/database"

export async function uploadControlDocuments(
  controlId: string,
  files: {
    name: string
    type: string
    size: number
    base64: string
  }[],
  metadata: {
    name: string
    classification: string
    label: string
    notes: string
  },
  userId: string,
  userName: string,
) {
  try {
    const db = await getDb()

    // Conditional query for controlId
    const query = ObjectId.isValid(controlId)
      ? { _id: new ObjectId(controlId) }
      : { id: controlId }

    // GridFS bucket for file storage
    const bucket = new GridFSBucket(db, { bucketName: "documents" })

    const documentRecords: Array<{
      id: string
      originalFilename: string
      name: string
      classification: string
      label: string
      notes: string
      uploadDate: string
      uploadedBy: { id: string; name: string }
      fileType: string
      fileSize: string
      fileData: string
    }> = []

    for (const file of files) {
      const fileBuffer = Buffer.from(file.base64, "base64")

      // Upload to GridFS
      const fileInfo = await new Promise<{ _id: ObjectId }>((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.name, {
          contentType: file.type,
          metadata: {
            controlId,
            documentName: metadata.name,
            classification: metadata.classification,
            label: metadata.label,
            notes: metadata.notes,
            uploadedBy: { id: userId, name: userName },
            fileSize: formatFileSize(file.size),
            uploadDate: new Date(),
          },
        })

        uploadStream.on("finish", () => resolve({ _id: uploadStream.id as ObjectId }))
        uploadStream.on("error", reject)
        uploadStream.end(fileBuffer)
      })

      documentRecords.push({
        id: fileInfo._id.toString(),
        originalFilename: file.name,
        name: metadata.name,
        classification: metadata.classification,
        label: metadata.label,
        notes: metadata.notes,
        uploadDate: new Date().toISOString(),
        uploadedBy: { id: userId, name: userName },
        fileType: file.type,
        fileSize: formatFileSize(file.size),
        fileData: fileInfo._id.toString(),
      })
    }

    await db.collection<Control>("controls").updateOne(
      query,
      {
        $push: { documents: { $each: documentRecords } },
        $set: { hasDocument: true },
      }
    )

    revalidatePath("/dashboard/controls")
    return { success: true }
  } catch (error) {
    console.error("Error uploading control documents:", error)
    return { success: false, error: "Failed to upload documents" }
  }
}

export async function deleteControlDocument(controlId: string, documentId: string) {
  try {
    const db = await getDb()

    const query = ObjectId.isValid(controlId)
      ? { _id: new ObjectId(controlId) }
      : { id: controlId }

    // Pull the document from the array
    await db.collection<Control>("controls").updateOne(
      query,
      { $pull: { documents: { id: documentId } as Partial<ControlDocument> } }
    )

    // Check remaining documents
    const control = await db.collection<Control>("controls").findOne(
      query,
      { projection: { documents: 1 } }
    )

    if (control && (!control.documents || control.documents.length === 0)) {
      await db.collection<Control>("controls").updateOne(
        query,
        { $set: { hasDocument: false } }
      )
    }

    revalidatePath("/dashboard/controls")
    return { success: true }
  } catch (error) {
    console.error("Error deleting control document:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

export async function getControlWithDocuments(controlId: string) {
  try {
    const db = await getDb()

    const query = ObjectId.isValid(controlId)
      ? { _id: new ObjectId(controlId) }
      : { id: controlId }

    const control = await db.collection<Control>("controls").findOne(query)
    if (!control) {
      return { success: false, error: "Control not found" }
    }

    return {
      success: true,
      data: {
        ...control,
        _id: control._id.toString(),
        id: control.id.toString(),
        documents: control.documents || [],
      },
    }
  } catch (error) {
    console.error("Error fetching control with documents:", error)
    return { success: false, error: "Failed to fetch control" }
  }
}
