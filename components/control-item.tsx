// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Pencil, Upload, Trash, Play } from "lucide-react"
// import { ControlDocumentsDialog } from "./control-documents-dialog"
// import { ControlAutomationModal } from "./control-automation-modal"

// export type Control = {
//   _id: string
//   name: string
//   description: string
//   status: string
//   framework: string
//   category: string
//   owner: string
//   dueDate?: string
//   documents?: string[]
//   automationStatus?: string
//   lastAutomationRun?: Date
// }

// interface ControlItemProps {
//   control: Control
//   onEdit?: (control: Control) => void
//   onDelete?: (controlId: string) => void
// }

// export function ControlItem({ control, onEdit, onDelete }: ControlItemProps) {
//   const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
//   const [automationModalOpen, setAutomationModalOpen] = useState(false)

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "implemented":
//         return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//       case "in progress":
//         return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
//       case "not implemented":
//         return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
//       case "not applicable":
//         return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
//       default:
//         return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
//     }
//   }

//   const getAutomationStatusColor = (status?: string) => {
//     if (!status) return ""

//     switch (status.toLowerCase()) {
//       case "compliant":
//         return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//       case "non-compliant":
//         return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
//       default:
//         return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
//     }
//   }

//   const documentCount = control.documents?.length || 0

//   return (
//     <>
//       <Card className="w-full">
//         <CardHeader className="pb-2">
//           <div className="flex justify-between items-start">
//             <div>
//               <CardTitle className="text-lg">{control.name}</CardTitle>
//               <CardDescription className="mt-1">
//                 {control.framework} • {control.category}
//               </CardDescription>
//             </div>
//             <div className="flex flex-col gap-2 items-end">
//               <Badge className={getStatusColor(control.status)}>{control.status}</Badge>
//               {control.automationStatus && (
//                 <Badge className={getAutomationStatusColor(control.automationStatus)}>
//                   Auto: {control.automationStatus}
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="pb-2">
//           <p className="text-sm text-gray-600 dark:text-gray-400">{control.description}</p>

//           {control.owner && (
//             <div className="mt-2 flex items-center">
//               <span className="text-xs text-gray-500 dark:text-gray-400">Owner: {control.owner}</span>
//             </div>
//           )}

//           {control.dueDate && (
//             <div className="mt-1 flex items-center">
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 Due: {new Date(control.dueDate).toLocaleDateString()}
//               </span>
//             </div>
//           )}

//           {control.lastAutomationRun && (
//             <div className="mt-1 flex items-center">
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 Last automated: {new Date(control.lastAutomationRun).toLocaleDateString()}
//               </span>
//             </div>
//           )}
//         </CardContent>
//         <CardFooter className="flex justify-between pt-2">
//           <div className="flex space-x-2">
//             <Button variant="outline" size="sm" onClick={() => setDocumentsDialogOpen(true)}>
//               <Upload className="h-4 w-4 mr-1" />
//               {documentCount > 0 ? `Documents (${documentCount})` : "Upload/Notes"}
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               className="bg-acasa-blue text-white hover:bg-acasa-darkBlue"
//               onClick={() => setAutomationModalOpen(true)}
//             >
//               <Play className="h-4 w-4 mr-1" />
//               Automate
//             </Button>
//           </div>
//           <div className="flex space-x-2">
//             {onEdit && (
//               <Button variant="ghost" size="sm" onClick={() => onEdit(control)}>
//                 <Pencil className="h-4 w-4" />
//               </Button>
//             )}
//             {onDelete && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-red-500 hover:text-red-700"
//                 onClick={() => onDelete(control._id)}
//               >
//                 <Trash className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </CardFooter>
//       </Card>

//       <ControlDocumentsDialog
//         open={documentsDialogOpen}
//         onOpenChange={setDocumentsDialogOpen}
//         controlId={control._id}
//         controlName={control.name}
//       />

//       <ControlAutomationModal
//         open={automationModalOpen}
//         onOpenChange={setAutomationModalOpen}
//         controlId={control._id}
//         controlName={control.name}
//       />
//     </>
//   )
// }

