import clientPromise from "./mongodb"
import { ObjectId, UpdateFilter } from "mongodb"
import type { User, Control, Policy, Report, Activity, ComplianceStats } from "../types/database"


// Database and collection names
const DB_NAME = "acasa"
const COLLECTIONS = {
  USERS: "users",
  CONTROLS: "controls",
  POLICIES: "policies",
  REPORTS: "reports",
  ACTIVITIES: "activities",
  STATS: "stats",
}

// Get database connection
export async function getDb() {
  const client = await clientPromise
  return client.db(DB_NAME)
}

// User operations
export async function getUsers() {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).find({}).toArray()
}

export async function getUserById(id: string) {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) })
}

export async function getUserByEmail(email: string) {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).findOne({ email })
}

export async function createUser(user: Omit<User, "_id">) {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTIONS.USERS).insertOne({
    ...user,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User)
  return result.insertedId
}

export async function updateUser(id: string, userData: Partial<User>) {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTIONS.USERS).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...userData,
        updatedAt: new Date(),
      },
    },
  )
  return result.modifiedCount > 0
}

// Control operations
export async function getControls() {
  const db = await getDb()
  return db.collection<Control>(COLLECTIONS.CONTROLS).find({}).toArray()
}

export async function getControlById(id: string) {
  const db = await getDb()
  return db.collection<Control>(COLLECTIONS.CONTROLS).findOne({ id })
}

export async function updateControlCompliance(id: string, compliant: boolean) {
  const db = await getDb()
  const result = await db.collection<Control>(COLLECTIONS.CONTROLS).updateOne(
    { id },
    {
      $set: {
        compliant,
        updatedAt: new Date(),
      },
    },
  )
  return result.modifiedCount > 0
}

export async function updateControlDocument(
  id: string,
  hasDocument: boolean,
  documentId?: ObjectId
) {
  const db = await getDb()

  // Use UpdateFilter<Control> instead of `any`
  const update: UpdateFilter<Control> = {
    // always set these two fields
    $set: {
      hasDocument,
      updatedAt: new Date(),
    },
    // conditionally push into the array
    ...(documentId
      ? { $push: { documentIds: documentId } }
      : {}),
  }

  const result = await db
    .collection<Control>(COLLECTIONS.CONTROLS)
    .updateOne({ id }, update)

  return result.modifiedCount > 0
}


// Policy operations
export async function getPolicies() {
  const db = await getDb()
  return db.collection<Policy>(COLLECTIONS.POLICIES).find({}).toArray()
}

export async function getPolicyById(id: string) {
  const db = await getDb()
  return db.collection<Policy>(COLLECTIONS.POLICIES).findOne({ _id: new ObjectId(id) })
}

export async function getPoliciesByUser(id: string) {
  const db = await getDb()
  return db.collection<Policy>(COLLECTIONS.POLICIES).find({ createdBy: new ObjectId(id) }).toArray()
}

export async function getPolicyByUserAndName(userId: string, name: string) {
    const db = await getDb()
    return db.collection<Policy>(COLLECTIONS.POLICIES).findOne({
      createdBy: new ObjectId(userId),
      name: name,
    })
}

export async function createPolicy(policy: Omit<Policy, "_id">) {
  const db = await getDb()
  const result = await db.collection<Policy>(COLLECTIONS.POLICIES).insertOne({
    ...policy,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Policy)
  return result.insertedId
}

export async function updatePolicy(id: string, policyData: Partial<Policy>) {
  const db = await getDb()
  const result = await db.collection<Policy>(COLLECTIONS.POLICIES).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...policyData,
        updatedAt: new Date(),
      },
    },
  )
  return result.modifiedCount > 0
}

// Report operations
export async function getReports() {
  const db = await getDb()
  return db.collection<Report>(COLLECTIONS.REPORTS).find({}).sort({ date: -1 }).toArray()
}

export async function getReportById(id: string) {
  const db = await getDb()
  return db.collection<Report>(COLLECTIONS.REPORTS).findOne({ _id: new ObjectId(id) })
}

export async function createReport(report: Omit<Report, "_id">) {
  const db = await getDb()
  const result = await db.collection<Report>(COLLECTIONS.REPORTS).insertOne({
    ...report,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Report)
  return result.insertedId
}

// Activity log operations
export async function logActivity(activity: Omit<Activity, "_id">) {
  const db = await getDb()
  const result = await db.collection<Activity>(COLLECTIONS.ACTIVITIES).insertOne({
    ...activity,
    timestamp: new Date(),
  } as Activity)
  return result.insertedId
}

export async function getRecentActivities(limit = 5) {
  const db = await getDb()
  return db.collection<Activity>(COLLECTIONS.ACTIVITIES).find({}).sort({ timestamp: -1 }).limit(limit).toArray()
}

// Compliance statistics operations
export async function getComplianceStats() {
  const db = await getDb()
  return db.collection<ComplianceStats>(COLLECTIONS.STATS).findOne({})
}

export async function updateComplianceStats(stats: ComplianceStats) {
  const db = await getDb()
  const result = await db.collection<ComplianceStats>(COLLECTIONS.STATS).updateOne(
    {}, // Update the single document
    {
      $set: {
        ...stats,
        lastUpdated: new Date(),
      },
    },
    { upsert: true }, // Create if it doesn't exist
  )
  return result.modifiedCount > 0 || result.upsertedCount > 0
}

// Initialize database with sample data
export async function initializeDatabase() {
  const db = await getDb()

  // Check if controls collection is empty
  const controlsCount = await db.collection(COLLECTIONS.CONTROLS).countDocuments()

  if (controlsCount === 0) {
    // Insert sample controls
    await db.collection<Control>(COLLECTIONS.CONTROLS).insertMany(getSampleControls())
  }

  // Check if users collection is empty
  const usersCount = await db.collection(COLLECTIONS.USERS).countDocuments()

  if (usersCount === 0) {
    // Insert sample user
    await db.collection<User>(COLLECTIONS.USERS).insertOne({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "$2a$10$GQf3MUXmGYnkKQvJ8vQp7.4XCwAVJXfAP5q9oeYJ.oEHK9YHFcP4y", // hashed 'password123'
      jobTitle: "Security Administrator",
      department: "Information Security",
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User)
  }

  // Initialize compliance stats if empty
  const statsCount = await db.collection(COLLECTIONS.STATS).countDocuments()

  if (statsCount === 0) {
    await updateComplianceStats(getInitialComplianceStats())
  }
}

// Sample data functions
function getSampleControls(): Control[] {
  const categories = [
    "Information Security Policies",
    "Organization of Information Security",
    "Human Resource Security",
    "Asset Management",
    "Access Control",
    "Cryptography",
    "Physical Security",
    "Operations Security",
  ]

  const controls: Control[] = [
    {
      id: "6.1",
      name: "Screening",
      description: "Background verification checks on all candidates for employment should be carried out.",
      compliant: false,
      hasDocument: false,
      canAutomate: false,
      category: "Human Resource Security",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "6.2",
      name: "Terms and Conditions of Employment",
      description: "Employment agreements should state employees' responsibilities for information security.",
      compliant: false,
      hasDocument: false,
      canAutomate: false,
      category: "Human Resource Security",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add more sample controls here...
  ]

  // Generate more sample controls
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    const baseId = (i + 5).toString()

    for (let j = 3; j <= 8; j++) {
      const id = `${baseId}.${j}`
      if (!controls.find((c) => c.id === id)) {
        controls.push({
          id,
          name: `Sample Control ${id}`,
          description: `This is a sample control for ${category}`,
          compliant: Math.random() > 0.5,
          hasDocument: Math.random() > 0.7,
          canAutomate: Math.random() > 0.6,
          category,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }

  return controls
}

function getInitialComplianceStats(): ComplianceStats {
  const categories = [
    "Information Security Policies",
    "Organization of Information Security",
    "Human Resource Security",
    "Asset Management",
    "Access Control",
    "Cryptography",
    "Physical Security",
    "Operations Security",
  ]

  const categoryStats = categories.map((category) => {
    const total = Math.floor(Math.random() * 10) + 5
    const compliant = Math.floor(Math.random() * total)
    return {
      category,
      compliant,
      total,
      percentage: Math.round((compliant / total) * 100),
      criticalFindings: Math.floor(Math.random() * 3),
    }
  })

  const totalControls = categoryStats.reduce((sum, stat) => sum + stat.total, 0)
  const compliantControls = categoryStats.reduce((sum, stat) => sum + stat.compliant, 0)
  const criticalFindings = categoryStats.reduce((sum, stat) => sum + stat.criticalFindings, 0)

  return {
    totalControls,
    compliantControls,
    nonCompliantControls: totalControls - compliantControls,
    criticalFindings,
    lastUpdated: new Date(),
    categoryStats,
  }
}

