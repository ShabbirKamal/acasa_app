"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Terminal,
  Clock,
  FileText,
  Database,
  Upload,
  UserPlus,
  MoreVertical,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  fetchScripts as fetchScriptsFromDb,
  fetchScriptDetails,
  runAutomationScript,
  getAutomationHistory,
  deleteScript,
} from "../app/actions/automation"
import { ScriptInputModal } from "./script-input-modal"
import { DatabaseInputModal } from "./database-input-modal"
import { DocumentInputModal } from "./document-input-modal"
import type { ScriptInputParam } from "../app/types/database"

export type AutomationScript = {
  id: string
  name: string
  description: string
  path: string
  inputSource?: "user" | "database" | "documents" | "none"
}

export type AutomationResult = {
  _id?: string
  controlId: string | undefined
  scriptId: string | undefined
  scriptName: string | undefined
  status: "success" | "failure" | "error" | undefined
  compliant: boolean | undefined
  report: string | undefined
  runAt: Date
}

interface ControlAutomationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  controlId: string
  controlName: string
}

export function ControlAutomationModal({ open, onOpenChange, controlId, controlName }: ControlAutomationModalProps) {
  const [scripts, setScripts] = useState<AutomationScript[]>([])
  const [history, setHistory] = useState<AutomationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [runningScriptId, setRunningScriptId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scriptToDelete, setScriptToDelete] = useState<AutomationScript | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [latestResult, setLatestResult] = useState<AutomationResult | null>(null)

  // Modals for different input types
  const [scriptInputModalOpen, setScriptInputModalOpen] = useState(false)
  const [databaseInputModalOpen, setDatabaseInputModalOpen] = useState(false)
  const [documentInputModalOpen, setDocumentInputModalOpen] = useState(false)

  const [selectedScript, setSelectedScript] = useState<{
    id: string
    name: string
    inputParams: ScriptInputParam[]
    inputSource?: "user" | "database" | "documents" | "none"
  } | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (!open) return

    loadScriptsAndHistory()
  }, [open, controlId, scripts, history, latestResult, toast])

  const loadScriptsAndHistory = async () => {
    try {
      // Fetch scripts
      const scriptsResult = await fetchScriptsFromDb(controlId)

      if (!scriptsResult.success) {
        toast({ title: "Error", description: scriptsResult.error || "Failed to load scripts", variant: "destructive" })
        return
      }

      setScripts(scriptsResult.scripts ?? [])

      // Fetch history
      const historyResult = await getAutomationHistory(controlId)

      if (!historyResult.success) {
        toast({ title: "Error", description: historyResult.error || "Failed to load history", variant: "destructive" })
        return
      }

      // Format history items
      const formattedHistory = (historyResult.history ?? []).map((item) => ({
        ...item,
        _id: item._id?.toString(),
        runAt: new Date(item.runAt),
      }))

      setHistory(formattedHistory)

      // Find the latest result for this control
      if (formattedHistory.length > 0) {
        const latest = formattedHistory.reduce((latest, current) => (latest.runAt > current.runAt ? latest : current))
        setLatestResult(latest)
      } else {
        setLatestResult(null)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading data",
        variant: "destructive",
      })
    }
  }

  // Update the runScript function to properly handle the inputSource
  const runScript = async (scriptId: string) => {
    setRunningScriptId(scriptId)
    setLoading(true)

    const scriptMeta = scripts.find((s) => s.id === scriptId)
    if (!scriptMeta) {
      toast({ title: "Error", description: "Script not found", variant: "destructive" })
      setLoading(false)
      return
    }

    // Fetch script details including input parameters
    const details = await fetchScriptDetails(scriptId)
    if (!details.success) {
      toast({ title: "Error", description: details.error || "Failed to fetch script details", variant: "destructive" })
      setLoading(false)
      setRunningScriptId(null)
      return
    }

    // Determine input source and open appropriate modal
    const inputParams = details.getInput ?? []

    // Use the inputSource from the script details directly
    const inputSource = details.inputSource || "none"

    setSelectedScript({
      id: scriptId,
      name: scriptMeta.name,
      inputParams: inputParams,
      inputSource: inputSource,
    })

    if (inputSource === "database") {
      setDatabaseInputModalOpen(true)
      setLoading(false)
      setRunningScriptId(null)
      return
    } else if (inputSource === "documents") {
      setDocumentInputModalOpen(true)
      setLoading(false)
      setRunningScriptId(null)
      return
    } else if (inputSource === "user" && inputParams.length > 0) {
      setScriptInputModalOpen(true)
      setLoading(false)
      setRunningScriptId(null)
      return
    }

    // If no input or input source is "none", run directly
    const { success, result, error } = await runAutomationScript(controlId, scriptId, scriptMeta.name)
    if (success && result) {
      const formatted: AutomationResult = {
        _id: result._id,
        controlId: result.controlId ,
        scriptId: result.scriptId,
        scriptName: result.scriptName,
        status: result.status,
        compliant: result.compliant,
        report: result.report,
        runAt: new Date(result.runAt!),
      }

      // Set as the latest result for the control
      setLatestResult(formatted)

      toast({
        title: "Automation complete",
        description: formatted.compliant ? "Control is compliant" : "Control is non‑compliant",
        variant: formatted.compliant ? "default" : "destructive",
      })

      // Refresh history
      await loadScriptsAndHistory()
    } else {
      toast({ title: "Automation failed", description: error || "Failed to run automation", variant: "destructive" })
    }

    setLoading(false)
    setRunningScriptId(null)
  }

  const handleDeleteScript = async () => {
    if (!scriptToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteScript(scriptToDelete.id, controlId)
      if (result.success) {
        // Remove the script from the local state
        setScripts(scripts.filter((s) => s.id !== scriptToDelete.id))

        toast({
          title: "Script deleted",
          description: `"${scriptToDelete.name}" has been deleted successfully.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete script",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting script:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the script",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setScriptToDelete(null)
    }
  }

  const handleScriptExecutionComplete = (result: AutomationResult) => {
    // Close all modals
    setScriptInputModalOpen(false)
    setDatabaseInputModalOpen(false)
    setDocumentInputModalOpen(false)

    const formatted = { ...result, runAt: new Date(result.runAt) }

    // Set as the latest result for the control
    setLatestResult(formatted)

    toast({
      title: "Automation complete",
      description: formatted.compliant ? "Control is compliant" : "Control is non‑compliant",
      variant: formatted.compliant ? "default" : "destructive",
    })

    // Refresh history
    loadScriptsAndHistory()
  }

  const formatDate = (d: Date) => d.toLocaleString()

  // Helper function to render input source badge
  const renderInputSourceBadge = (inputSource?: string) => {
    switch (inputSource) {
      case "user":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            <UserPlus className="h-3 w-3" />
            User Input
          </Badge>
        )
      case "database":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
          >
            <Database className="h-3 w-3" />
            Database
          </Badge>
        )
      case "documents":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
          >
            <Upload className="h-3 w-3" />
            Documents
          </Badge>
        )
      case "none":
      default:
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <Terminal className="h-3 w-3" />
            No Input
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Automation for {controlName}</DialogTitle>
        </DialogHeader>

        {/* Main content with scrolling */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-1">
            <Tabs defaultValue="scripts" className="w-full">
              <TabsList className="mb-2 sticky top-0 z-10 bg-background">
                <TabsTrigger value="scripts">
                  <Terminal className="h-4 w-4 mr-2" /> Scripts
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" /> History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scripts" className="mt-0">
                <div className="space-y-4">
                  {scripts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <Terminal className="h-12 w-12 mb-4" />
                      <p>No automation scripts available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scripts.map((script) => (
                        <Card key={script.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle>{script.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                {renderInputSourceBadge(script.inputSource)}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive flex items-center"
                                      onClick={() => {
                                        setScriptToDelete(script)
                                        setDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Script
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <CardDescription>{script.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">Path: {script.path}</p>
                          </CardContent>
                          <CardFooter>
                            <Button
                              onClick={() => runScript(script.id)}
                              disabled={loading}
                              className="bg-acasa-blue hover:bg-acasa-darkBlue"
                            >
                              {loading && runningScriptId === script.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                "Run Automation"
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Latest result for the control */}
                  {latestResult && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-medium">Latest Result</h3>
                      <Alert variant={latestResult.compliant ? "default" : "destructive"}>
                        <div className="flex items-center">
                          {latestResult.compliant ? (
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 mr-2 text-red-500" />
                          )}
                          <AlertTitle>{latestResult.compliant ? "Compliant" : "Non‑Compliant"}</AlertTitle>
                        </div>
                        <AlertDescription className="mt-2">
                          Script: {latestResult.scriptName}
                          <br />
                          Run at: {formatDate(latestResult.runAt)}
                        </AlertDescription>
                      </Alert>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Detailed Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            <pre className="font-mono text-sm whitespace-pre-wrap">{latestResult.report}</pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <FileText className="h-12 w-12 mb-4" />
                      <p>No automation history available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((r, i) => (
                        <Card key={r._id || i}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">{r.scriptName}</CardTitle>
                              <Badge
                                className={
                                  r.compliant
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }
                              >
                                {r.compliant ? "Compliant" : "Non‑Compliant"}
                              </Badge>
                            </div>
                            <CardDescription>Run at: {formatDate(r.runAt)}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                              <pre className="font-mono text-sm whitespace-pre-wrap">{r.report}</pre>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Script</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the script &quot;{scriptToDelete?.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteScript()
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* User Input Modal */}
        <ScriptInputModal
          open={scriptInputModalOpen}
          onOpenChange={setScriptInputModalOpen}
          scriptId={selectedScript?.id || ""}
          scriptName={selectedScript?.name || ""}
          controlId={controlId}
          inputParams={selectedScript?.inputParams || []}
          onExecutionComplete={handleScriptExecutionComplete}
        />

        {/* Database Input Modal */}
        <DatabaseInputModal
          open={databaseInputModalOpen}
          onOpenChange={setDatabaseInputModalOpen}
          scriptId={selectedScript?.id || ""}
          scriptName={selectedScript?.name || ""}
          controlId={controlId}
          inputParams={selectedScript?.inputParams || []}
          onExecutionComplete={handleScriptExecutionComplete}
        />

        {/* Document Input Modal */}
        <DocumentInputModal
          open={documentInputModalOpen}
          onOpenChange={setDocumentInputModalOpen}
          scriptId={selectedScript?.id || ""}
          scriptName={selectedScript?.name || ""}
          controlId={controlId}
          inputParams={selectedScript?.inputParams || []}
          onExecutionComplete={handleScriptExecutionComplete}
        />
      </DialogContent>
    </Dialog>
  )
}
