"use client"

import { useEffect, useState } from "react"
import { ControlDetailModal }   from "@/components/control-detail-modal"
import { fetchPlainControl }    from "@/app/actions/serialized-control-documents"
import type { Control }         from "@/app/types/database"

export default function TestControlDetailPage() {
  const [control, setControl] = useState<Control | null>(null)
  const [loading, setLoading] = useState(true)
  const CONTROL_ID = "A.6.3"  // your control’s ID

  useEffect(() => {
    fetchPlainControl(CONTROL_ID)
      .then((c) => setControl(c))
      .catch((err) => {
        console.error("❌", err.message)
        setControl(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading…</div>
  if (!control) return <div className="p-8 text-red-600">Failed to load control</div>

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl">ControlDetailModal Test</h1>
      <ControlDetailModal
        control={control}
        open={true}
        onOpenChange={() => {}}
        onDocumentUpload={async () => alert("Upload clicked")}
        onDocumentDelete={async () => alert("Delete clicked")}
      />
    </div>
  )
}
