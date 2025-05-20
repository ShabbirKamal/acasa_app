// app/actions/plain-controls.ts
"use server";

import { fetchControls }           from "./controls";
import { getControlWithDocuments } from "./control-documents";
import type { Control, ControlDocument } from "@/app/types/database";

/**
 * Fetches all controls _and_ their documents, 
 * strips out any Buffer/Date instances, and returns
 * a plain‐JS array of Control objects safe to pass
 * directly to client components.
 */
export async function fetchPlainControls(): Promise<Control[]> {
  // 1️⃣ get the list of all controls (metadata only)
  const listRes = await fetchControls();
  if (!listRes.success || !listRes.data) {
    throw new Error("Failed to fetch controls list");
  }

  const plainControls: Control[] = [];

  // 2️⃣ for each control, fetch its documents & sanitize
  for (const meta of listRes.data) {
    // fetch raw control+docs
    const docsRes = await getControlWithDocuments(meta.id);
    if (!docsRes.success || !docsRes.data) {
      // if docs failed, we still push an empty‐docs control
      console.warn(`Could not load documents for ${meta.id}`);
    }
    const rawDocs = docsRes.success && docsRes.data
      ? (docsRes.data.documents as ControlDocument[])
      : [];

    // 3️⃣ strip each document to primitives only
    const plainDocs = rawDocs.map((d) => ({
      id:             d.id,
      name:           d.name,
      classification: d.classification,
      label:          d.label,
      fileType:       d.fileType,
      fileSize:       d.fileSize,
      notes:          d.notes,
      uploadDate:     d.uploadDate,   // already a string
      fileData:       d.fileData,
    }));

    // 4️⃣ build a sanitized Control
    plainControls.push({
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
      // (we leave out createdAt/updatedAt here; add them as ISO strings if you need)
    } as Control);
  }

  return plainControls;
}
