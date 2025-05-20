import { NextRequest, NextResponse } from 'next/server'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    // 1. Parse incoming form JSON
    const data = await req.json()

    // 3. Load the DOCX template from your policy_templates folder
    const templatePath = path.join(
      process.cwd(),
      'policy_templates',
      'ISMS_template.docx'
    )
    const content = await fs.readFile(templatePath)

    // 4. Build the object matching all placeholders in your .docx
    const templateVars = {
      company: data.companyName,
      companyServices: data.companyServices,
      locations: Array.isArray(data.locations)
        ? data.locations.join(', ')
        : data.locations,
      assets: Array.isArray(data.assets)
        ? data.assets.join(', ')
        : data.assets,
      departments: Array.isArray(data.departments)
        ? data.departments.join(', ')
        : data.departments,
      objectives: Array.isArray(data.objectives) ? data.objectives : [],
      policyOwner: data.policyOwner,
      companyManagers: data.companyManagers,
      locationName: data.locationName,
      supportType: data.supportType,
      companySystems: data.companySystems,
      owner: data.owner,
    }

    // 5. Instantiate Docxtemplater with new API (no deprecated methods)
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    // 6. Render the document with your data
    try {
      doc.render(templateVars)
    } catch (err) {
      console.error('Docxtemplater render error:', err)
      throw err
    }

    // 7. Generate the output .docx buffer
    const buffer = doc.getZip().generate({ type: 'nodebuffer' })

    // 8. Return it as a downloadable Word file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="ISMS_Policy.docx"',
      },
    })
  } catch (error) {
    console.error('Error in /api/policy-gen/isms:', error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Failed to generate ISMS policy document.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
