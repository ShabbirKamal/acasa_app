import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a CSV template for controls
    const headers = ["Control ID", "Name", "Description", "Category", "Compliant", "Has Document", "Can Automate"]

    // Add a few example rows
    const rows = [
      [
        "A.5.1",
        "Information security policies",
        "To provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.",
        "Policies",
        "No",
        "No",
        "No",
      ],
      [
        "A.8.2",
        "Information classification",
        "To ensure that information receives an appropriate level of protection in accordance with its importance to the organization.",
        "Asset Management",
        "No",
        "No",
        "Yes",
      ],
    ]

    // Convert to CSV
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Return the CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="controls-template.csv"',
      },
    })
  } catch (error) {
    console.error("Error generating template:", error)
    return NextResponse.json({ success: false, error: "Failed to generate template" }, { status: 500 })
  }
}

