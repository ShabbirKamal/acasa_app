# ACASA

**Automated Compliance Auditing Software with AI**

---

## Overview

ACASA is an open-source, AI-powered compliance auditing platform that helps you:

- **Track compliance progress** against any regulatory or internal standard (e.g., ISO 27001).
- **Upload and manage your own controls** (via CSV or UI).
- **Write and run custom scripts** to automate evidence gathering and status updates.
- **Visualize compliance status** in real time and generate audit-ready reports.

Whether you need to prove adherence to ISO 27001, SOC 2, GDPR, or your own internal policies, ACASA makes it easy to automate checks, gather evidence, and see where you stand.

---

## Key Features

- **Standards-agnostic controls library**  
  Start with our built-in ISO 27001 control set, or upload any CSV of controls you need to track.

- **Custom script integration**  
  Connect your own scripts to ACASA to:
  1. Parse uploaded documents (PDFs, Word, CSV)  
  2. Inspect local system configurations  
  3. Query databases or APIs  
  4. …and any other automation you can code  
  ACASA will run these scripts, parse their output, and update each control’s status automatically.

- **Compliance dashboard**  
  See an at-a-glance view of overall compliance, drill into individual domains or controls, and track progress over time.

- **Audit trails & reporting**  
  Every change—manual or automated—is logged. Export audit reports in PDF or CSV format for stakeholders.

- **Extensible & open source**  
  Built to be community-driven. Contribute new control sets, scripts, UIs, or integrations.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm, Yarn, pnpm or Bun

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ShabbirKamal/ACASA-pentesting.git

# 2. Install dependencies
npm install (at root directory)

# 3. Run the development server
npm run dev

```
