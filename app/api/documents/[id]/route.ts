import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { ObjectId, GridFSBucket } from "mongodb";

// Extend GridFSDownloadStream to include toWeb method
interface GridFSDownloadStreamWithWeb {
  toWeb(): ReadableStream<Uint8Array>;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const { id } = params;
    const fileId = new ObjectId(id);
    const bucket = new GridFSBucket(db, { bucketName: "documents" });

    // Retrieve file info for headers
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const fileInfo = files[0];

    // Open a download stream
    const downloadStream = bucket.openDownloadStream(fileId);

    // Convert to web ReadableStream if possible
    const webStreamCandidate = downloadStream as unknown as GridFSDownloadStreamWithWeb;
    let body: ReadableStream<Uint8Array>;
    if (typeof webStreamCandidate.toWeb === "function") {
      body = webStreamCandidate.toWeb();
    } else {
      body = new ReadableStream<Uint8Array>({
        start(controller) {
          downloadStream.on("data", (chunk: Uint8Array) => {
            controller.enqueue(chunk);
          });
          downloadStream.on("end", () => {
            controller.close();
          });
          downloadStream.on("error", (err: Error) => {
            console.error("Download stream error", err);
            controller.error(err);
          });
        }
      });
    }

    return new NextResponse(body, {
      headers: {
        "Content-Type": fileInfo.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileInfo.filename || "download"}"`,
      }
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/documents/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
