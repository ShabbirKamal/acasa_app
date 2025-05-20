import type { ObjectId } from "mongodb"

// Control Document schema
export interface ControlDocument {
  _id?: string
  id: string
  name: string
  originalFilename: string
  classification: string
  label: string
  notes: string
  uploadDate: string
  uploadedBy: {
    id: string
    name: string
  }
  fileType: string
  fileSize: string
  fileData: string
}

// User schema
export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string // This would be hashed
  jobTitle?: string
  department?: string
  phone?: string
  bio?: string
  profilePicture?: string
  role: "admin" | "auditor" | "user"
  status: "active" | "inactive" | "pending"
  emailVerified?: boolean
  createdAt: Date
  updatedAt: Date
}

// User schema
export interface UserWithoutPswd {
  _id: string
  name: string
  email: string
  jobTitle?: string
  department?: string
  phone?: string
  bio?: string
  profilePicture?: string
  role: "admin" | "auditor" | "user"
  status: "active" | "inactive" | "pending"
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

// Control schema (ISO27001 controls)
export interface Control {
  _id?: ObjectId | string
  id: string // Control ID (e.g., "6.1")
  name: string
  description?: string
  compliant: boolean
  hasDocument: boolean
  canAutomate: boolean
  category: string // e.g., "Information Security Policies"
  documentIds?: ObjectId[] // References to supporting documents
  documents?: ControlDocument[] // Actual document data
  assignedTo?: ObjectId // User responsible
  lastReviewDate?: Date
  nextReviewDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Policy document schema
export interface Policy {
  _id?: ObjectId | string
  name: string
  status: "Draft" | "Review" | "Published"
  content: string
  version: string
  createdBy: ObjectId | string // Reference to user
  lastUpdated: Date | string
  relatedControls?: string[] // Control IDs related to this policy
  createdAt: Date | string
  updatedAt: Date | string
}

// Report schema
export interface Report {
  _id?: ObjectId
  id: string // Report ID (e.g., "REP-2024-001")
  name: string
  type: "Compliance" | "Assessment" | "Audit" | "Security"
  date: Date
  status: "Draft" | "Completed"
  content: string // Could be JSON or HTML content
  generatedBy: ObjectId // Reference to user
  createdAt: Date
  updatedAt: Date
}

// Activity log schema
export interface Activity {
  _id?: ObjectId
  userId: ObjectId
  userName: string
  action: string
  target: string
  targetType: "control" | "policy" | "report" | "user" | "system"
  timestamp: Date;
  details?: unknown
}

// Dashboard statistics schema
export interface ComplianceStats {
  _id?: ObjectId | string
  totalControls: number
  compliantControls: number
  nonCompliantControls: number
  criticalFindings: number
  lastUpdated: Date
  categoryStats: {
    category: string
    compliant: number
    total: number
    percentage: number
    criticalFindings: number
  }[]
}

export interface AutomationResult {
  _id?: string | ObjectId
  controlId: string
  scriptId: string
  scriptName: string
  status: "success" | "failure" | "error"
  compliant: boolean
  report: string
  runAt: Date | string
}

export interface Script {
  _id: string | ObjectId
  controlId: string
  scriptName: string
  description: string
  language: string
  code: string
  fileName: string
  fileSize: number
  uploadDate: Date
  lastRun: Date | null
  status: "ready" | "running" | "completed" | "failed"
  getInput: ScriptInputParam[] // Optional input parameters
  addDocuments: boolean 
  inputSource?: "user" | "database" | "documents" | "none"
}

export interface ScriptInputParam {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "select" | "data"
  required: boolean
  default: string | number | boolean
  description: string
  options?: string[]
  dataItems?: string[]
  inputSource?: "user" | "database" | "documents" | "none"
}

export interface DataItem {
  _id: string
  header: string
  value: string | number | boolean
  datatype: "string" | "number" | "bool"
  createdAt?: Date
  updatedAt?: Date
}

export interface AppSetting {
  _id?: string | ObjectId
  key: "general"
  value: {
    companyName: string
    industry: string
    website: string
    contactEmail: string
  }
  updatedAt: Date
}

export interface AwsCredentialsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingCredentials?: {
    accessKeyId:   string
    accountId?:    string
    isValid:       boolean
    lastValidated?: Date
  } | null
}

export interface MetaData {
  name: string;
  classification: string;
  label: string;
  notes: string;
}
