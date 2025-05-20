"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, CheckCircle, AlertTriangle } from "lucide-react"
import { AwsCredentialsModal } from "./aws-credentials-modal"
import { getAwsCredentials } from "../app/actions/aws-integration"

import { useToast } from "@/hooks/use-toast"

export function AwsIntegrationCard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [credentials, setCredentials] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCredentials()
  }, [credentials, loading])

  const fetchCredentials = async () => {
    setLoading(true)
    try {
      const result = await getAwsCredentials()
      if (result.success) {
        setCredentials(result.credentials)
      } else {
        setCredentials(null)
      }
    } catch (error) {
      console.error("Error fetching AWS credentials:", error)
      toast({
        title: "Error",
        description: "Failed to fetch AWS integration status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      // Refresh credentials after modal is closed
      fetchCredentials()
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">AWS</CardTitle>
            <CardDescription>Amazon Web Services Integration</CardDescription>
          </div>
          <Cloud className="h-8 w-8 text-acasa-blue" />
        </CardHeader>
        <CardContent className="text-muted-foreground">
          {loading ? (
            <p>Loading integration status...</p>
          ) : credentials ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p>Access Key:</p>
                <Badge variant="outline">{credentials.accessKeyId}</Badge>
              </div>
              {credentials.accountId && (
                <div className="flex justify-between items-center">
                  <p>Account ID:</p>
                  <Badge variant="outline">{credentials.accountId}</Badge>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p>Status:</p>
                {credentials.isValid ? (
                  <Badge className="bg-green-100 text-green-800 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Invalid
                  </Badge>
                )}
              </div>
              {credentials.lastValidated && (
                <p className="text-xs text-muted-foreground">
                  Last validated: {new Date(credentials.lastValidated).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p>Connect your AWS account to enable cloud resource scanning and automation.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsModalOpen(true)} className="w-full bg-acasa-blue hover:bg-acasa-darkBlue">
            {credentials ? "Manage Credentials" : "Connect AWS"}
          </Button>
        </CardFooter>
      </Card>

      <AwsCredentialsModal open={isModalOpen} onOpenChange={handleModalClose} existingCredentials={credentials} />
    </>
  )
}

