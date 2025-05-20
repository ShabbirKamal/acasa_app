// // app/dashboard/tests/control-detail/client.tsx
// "use client"

// import { useState } from "react"
// import { ControlDetailModal } from "@/components/control-detail-modal"

// export default function ClientWrapper({
//   control,
// }: {
//   control: Parameters<typeof ControlDetailModal>[0]["control"]
// }) {
//   const [open, setOpen] = useState(true)

//   return (
//     <div className="p-8">
//       <h1 className="mb-4 text-2xl">ControlDetailModal Test</h1>
//       <ControlDetailModal
//         control={control}
//         open={open}
//         onOpenChange={setOpen}
//         onDocumentUpload={async () => alert("upload clicked")}
//         onDocumentDelete={async () => alert("delete clicked")}
//       />
//     </div>
//   )
// }
