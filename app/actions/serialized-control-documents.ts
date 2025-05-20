"use server"

import { fetchControls }            from "./controls"
import { getControlWithDocuments }  from "./control-documents"
import type { Control, ControlDocument } from "@/app/types/database"

/**
 * Returns a “plain JS” Control (no Buffers, no Dates) ready for client props.
 */
export async function fetchPlainControl(controlId: string): Promise<Control> {
  // 1️⃣ fetch all controls
  const listRes = await fetchControls()
  if (!listRes.success || !listRes.data) {
    throw new Error("Failed to fetch controls")
  }

  // 2️⃣ pick the one you want
  const meta = listRes.data.find((c) => c.id === controlId)
  if (!meta) {
    throw new Error(`Control ${controlId} not found`)
  }

  // 3️⃣ fetch its documents
  const docsRes = await getControlWithDocuments(controlId)
  if (!docsRes.success || !docsRes.data) {
    throw new Error(`Failed to fetch documents for ${controlId}`)
  }

  // 4️⃣ strip each doc to primitives
  const plainDocs = (docsRes.data.documents as ControlDocument[]).map((d) => ({
    id:             d.id,
    name:           d.name,
    classification: d.classification,
    label:          d.label,
    fileType:       d.fileType,
    fileSize:       d.fileSize,
    notes:          d.notes,
    uploadDate:     d.uploadDate,    // already a string
    fileData:       d.fileData,
  }))

  // 5️⃣ build and return only the fields ControlDetailModal needs
  return {
    id:              meta.id,
    name:            meta.name,
    description:     meta.description ?? "",
    category:        meta.category,
    compliant:       meta.compliant,
    hasDocument:     meta.hasDocument,
    canAutomate:     meta.canAutomate,
    lastReviewDate:  meta.lastReviewDate?.toISOString() || undefined,
    nextReviewDate:  meta.nextReviewDate?.toISOString() || undefined,
    documents:       plainDocs,
    // you can omit createdAt/updatedAt if the modal doesn’t use them
  } as Control
}
