// "use client"

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { useDropzone } from "react-dropzone"
// import Papa from "papaparse"
// import { FileText, X } from "lucide-react"
// import { useState, useEffect } from "react"
// import { fetchUserProfile } from "@/app/actions/user"
// import { importControls } from "@/app/actions/import"
// import { useToast } from "@/hooks/use-toast"

// interface ControlsModalProps {
//   open: boolean
//   onClose: () => void
//   onBack: () => void
//   onImport: (data: any[], warning?: string) => void
// }

// export function ControlsModal({ open, onClose, onBack, onImport }: ControlsModalProps) {
//   const [file, setFile] = useState<File|null>(null)
//   const [rows, setRows] = useState<any[]>([])
//   const [error, setError] = useState<string|null>(null)
//   const { toast } = useToast()

//   const dropzone = useDropzone({
//     onDrop: ([f]) => {
//       setFile(f)
//       Papa.parse(f, {
//         header: true,
//         skipEmptyLines: true,
//         complete: ({ data, errors }) => {
//           if (errors.length) {
//             setError(errors[0].message)
//             setRows([])
//           } else {
//             setError(null)
//             setRows(data as any[])
//           }
//         }
//       })
//     },
//     accept: { "text/csv": [".csv"] },
//     multiple: false,
//   })

//   const handleImport = async () => {
//     if (!file) return
//     const text = await file.text()
//     const { data, warning, success, error: srvError } = await importControls(text, (await fetchUserProfile()).data._id, (await fetchUserProfile()).data.name)
//     if (success) {
//       onImport(data, warning)
//       onClose()
//     } else {
//       toast({ title: "Import Failed", description: srvError, variant: "destructive" })
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <div className="flex items-center">
//             <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
//               <X className="rotate-45" /> {/* or use a left arrow */}
//             </Button>
//             <DialogTitle>Import Controls</DialogTitle>
//           </div>
//         </DialogHeader>

//         <div {...dropzone.getRootProps()} className="border-2 border-dashed p-6 text-center">
//           <input {...dropzone.getInputProps()} />
//           <FileText className="mx-auto mb-2" />
//           <p>Drag & drop CSV, or click to browse</p>
//         </div>

//         {error && <p className="text-red-600 mt-2">{error}</p>}
//         {rows.length > 0 && <p className="mt-2">Parsed {rows.length} rows.</p>}

//         <DialogFooter className="justify-between">
//           <Button variant="outline" onClick={onBack}>Back</Button>
//           <Button onClick={handleImport} disabled={!file || !rows.length}>
//             Import
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
