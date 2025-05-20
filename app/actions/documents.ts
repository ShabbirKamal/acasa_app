// "use server"

// import { getDb } from "../lib/db"
// import type { ControlDocument } from "../types/database"

// export async function fetchControlDocuments(controlId: string) {
//   try {
//     const db = await getDb()

//     console.log(`Fetching documents for controlId: ${controlId}`)

//     // First, check if the control exists
//     const control = await db.collection("controls").findOne({ id: controlId })

//     if (!control) {
//       console.error(`Control not found with id: ${controlId}`)
//       return {
//         success: false,
//         error: "Control not found",
//       }
//     }

//     // Fetch documents from the controlDocuments collection
//     const documents = await db.collection("controlDocuments").find({ controlId }).toArray()

//     console.log(`Found ${documents.length} documents for controlId: ${controlId}`)

//     // Transform the documents to match the ControlDocument interface
//     const formattedDocuments = documents.map((doc) => ({
//       ...doc,
//       id: doc._id.toString(), // Ensure id is a string
//     }))

//     return {
//       success: true,
//       documents: formattedDocuments as ControlDocument[],
//     }
//   } catch (error) {
//     console.error("Error fetching control documents:", error)
//     return {
//       success: false,
//       error: "Failed to fetch control documents",
//     }
//   }
// }
