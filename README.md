# Rolled 🧾

> **Invoice & payroll, finally rolled into one.**

Rolled is a free, full-stack SaaS platform that lets small and medium businesses create branded invoices, run monthly payroll, generate salary slips, and track finances — all from one place, powered by Next.js 14 and Firebase.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-rolled--three.vercel.app-2E5BFF?style=flat-square)](https://rolled-three.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-Next.js%2014%20+%20Firebase-black?style=flat-square)](https://nextjs.org/)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![Cost](https://img.shields.io/badge/infra%20cost-%240-brightgreen?style=flat-square)](#free-tier-breakdown)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Role-Based Access Control](#role-based-access-control)
- [Core Modules](#core-modules)
- [Bonus Features](#bonus-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Flows](#key-flows)
- [Free Tier Breakdown](#free-tier-breakdown)
- [Roadmap](#roadmap)

---

## Overview

Most SMBs manage invoices in Word, payroll in Excel, and track clients over email. The result is errors, inconsistent branding, delayed payments, and zero financial visibility.

**Rolled fixes that.** It is a single, branded platform where you:

- Create and send professional invoices with custom templates
- Run monthly payroll with automated tax calculations
- Generate and distribute salary slips as downloadable PDFs
- Get a live financial dashboard with real-time charts and insights
- Manage team access through four distinct role-based dashboard shells

Rolled is built entirely on free-tier services — $0 infrastructure cost for development, demos, and early usage.

|              |                                           |
| ------------ | ----------------------------------------- |
| App name     | Rolled                                    |
| Version      | 1.0 — Hackathon build                     |
| Stack        | Next.js 14 (App Router) + Firebase        |
| Infra cost   | $0 — fully free tier                      |
| Core modules | 7                                         |
| Bonus features | 12                                      |
| User roles   | 4 (Super Admin, Accountant, HR, Employee) |
| Deployment   | Vercel                                    |

---

## Problem Statement

| Pain point | What happens today |
|---|---|
| **Manual invoicing** | Invoices built in Word or generic templates — no tracking, no history, no consistent branding |
| **Spreadsheet payroll** | Salary calculations done manually every month, prone to formula errors and version chaos |
| **No payment tracking** | No automated reminders — overdue invoices go unnoticed and cash flow suffers |
| **Disconnected tools** | Salary slips in one folder, invoices in another, clients in email — no single source of truth |

---

## Key Features

- **Custom invoice designer** — drag-and-drop template builder with 4 built-in themes, logo upload, color picker, and live split-screen PDF preview
- **Full invoice lifecycle** — Draft → Sent → Paid / Overdue, with automated overdue detection via Cloud Functions
- **One-click payroll** — fetches all active employees, applies configurable tax slabs, generates a PayrollRun document and one SalarySlip per employee in a single transaction
- **Salary slips as PDF** — client-side PDF generation via `@react-pdf/renderer`, uploaded to Firebase Storage and accessible to employees through self-service
- **Live financial dashboard** — revenue trends, invoice status breakdown, payroll expense charts, top clients, and outstanding payments — all powered by Firestore aggregate queries and Recharts
- **Four role-based dashboard shells** — Super Admin, Accountant, HR Manager, and Employee each get a completely separate sidebar, routes, and component set; a role never renders a menu item it doesn't have permission for
- **Rule-based "AI" features** — invoice smart-fill from natural language prompts and payroll insights computed from Firestore data, with no external API or API key required
- **Multi-company support** — all data namespaced under `/companies/{id}` from day one; users can switch between companies from the navbar
- **Audit logs** — every create, update, and delete writes a log entry with before/after state

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Client — Browser (Next.js 14)                  │
│          One login screen, shared by every role             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Firebase Authentication                        │
│          Email/password  ·  Google SSO                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Role Resolver                             │
│   Reads role from /companies/{id}/users/{uid}               │
│   → picks one of four dashboard shells                      │
└──────┬──────────────┬────────────────┬──────────────┬───────┘
       │              │                │              │
       ▼              ▼                ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Super   │   │Accountant│   │    HR    │   │ Employee │
│  Admin   │   │  Shell   │   │ Manager  │   │  Shell   │
│  Shell   │   │          │   │  Shell   │   │          │
│──────────│   │──────────│   │──────────│   │──────────│
│Dashboard │   │Dashboard │   │Dashboard │   │My Salary │
│Invoices  │   │Invoices  │   │Employees │   │  Slips   │
│Designer  │   │Designer  │   │Depts     │   │          │
│Clients   │   │Clients   │   │Payroll   │   │My Profile│
│Employees │   │Reports   │   │Slips     │   │          │
│Payroll   │   │          │   │Reports   │   │(2 routes │
│Reports   │   │          │   │          │   │ only)    │
│Settings  │   │          │   │          │   │          │
│Users     │   │          │   │          │   │          │
│Audit Log │   │          │   │          │   │          │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │               │
     └──────────────┴──────────────┴───────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│          Firestore Security Rules                           │
│   role + companyId checked on every read & write            │
└──────┬──────────────┬────────────────┬──────────────┬───────┘
       │              │                │              │
       ▼              ▼                ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────────┐ ┌──────────┐
│Firestore │   │  Cloud   │   │    Cloud     │ │  Email   │
│          │   │ Storage  │   │  Functions   │ │ Delivery │
│/companies│   │          │   │              │ │          │
│  /{id}/  │   │Logos     │   │Overdue check │ │  Resend  │
│invoices  │   │Invoice   │   │Pay reminders │ │   API    │
│clients   │   │  PDFs    │   │Payroll cron  │ │          │
│employees │   │Salary    │   │Insight calc  │ │3K emails │
│payroll   │   │  Slip    │   │              │ │ /month   │
│slips     │   │  PDFs    │   │              │ │  free    │
│templates │   │          │   │              │ │          │
│auditLogs │   │          │   │              │ │          │
└──────────┘   └──────────┘   └──────────────┘ └──────────┘
```

### Architecture Principles

**Security is enforced twice, never once.** Route guards in the Next.js layout pick the correct shell at render time, and Firebase Security Rules check the same `role` field on every Firestore read/write. A guessed URL or a tampered request still hits the rules layer and gets denied — the UI separation is a convenience, not the security boundary.

**All data is company-scoped.** Every collection lives under `/companies/{companyId}`. This single design decision enables multi-company support, proper data isolation, and RBAC from day one.

**No AI API keys needed.** The "AI-powered" invoice smart-fill and payroll insights features run entirely on rule-based logic over your own Firestore data — zero external API calls, zero cost, zero rate limits, zero hallucination risk on numbers that matter.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend framework** | Next.js 14 (App Router) | SSR + API routes; deployed free on Vercel |
| **UI** | React + Tailwind CSS | `dark:` variant for dark mode; responsive via `sm:` / `md:` / `lg:` prefixes |
| **Database** | Firebase Firestore | NoSQL; 1 GB storage, 50K reads/day free |
| **Auth** | Firebase Authentication | Email/password + Google SSO; unlimited users free |
| **File storage** | Firebase Storage | Logos, invoice PDFs, salary slip PDFs; 5 GB free |
| **Background jobs** | Firebase Cloud Functions | Overdue detection cron, email triggers, insight calculation; 2M invocations/month free |
| **PDF generation** | `@react-pdf/renderer` | Client-side, no server needed |
| **Charts** | Recharts | `ComposedChart` for revenue vs. payroll overlays |
| **Email** | Resend API | Invoice delivery + payment reminders; 3,000 emails/month free |
| **Excel/CSV export** | `xlsx` (npm) | Client-side spreadsheet generation |
| **QR codes** | `qrcode.react` | Shareable invoice links |
| **Insights engine** | Rule-based (pure JS) | Prompt parser + Firestore delta calc; no external API |
| **Icons** | Lucide Icons | Open source |

---

## Data Model

All data is scoped under `/companies/{companyId}`. Sub-collections hang off the company document, keeping reads cheap and security rules simple.

```
/companies/{companyId}
│  name, logo, currency, taxConfig, createdAt
│
├── /invoices/{id}
│     clientId, number, items[], subtotal, tax, total,
│     status (DRAFT|SENT|PAID|OVERDUE), dueDate,
│     sharedToken, paidAt, reminderCount
│
├── /clients/{id}
│     name, email, phone, address, invoiceCount, totalBilled
│
├── /employees/{id}
│     name, email, phone, photo, department, designation,
│     employeeId, joinDate, status (Active|On Leave|Terminated),
│     salaryStructure { basic, allowances[], deductions[] }
│
├── /payrollRuns/{id}
│     month, year, totalExpense, employeeCount,
│     status, processedAt
│
├── /salarySlips/{id}
│     employeeId, payrollRunId, month, year,
│     grossPay, taxDeduction, netPay, pdfUrl,
│     snapshot {}          ← salary data frozen at run time
│
├── /templates/{id}
│     name, layout, primaryColor, accentColor, font,
│     sections[], logoUrl, showSignature, showTaxBreakdown
│
└── /auditLogs/{id}
      action, entityType, entityId, userId,
      before {}, after {}, timestamp

/users/{uid}             ← top-level; supports multi-company
  name, email, companyIds[], activeCompanyId, role, preferences {}
```

**Why snapshotting matters** — If an employee's salary changes from PKR 80,000 to PKR 95,000 in July, their June slip must still show PKR 80,000. Rolled copies the entire `salaryStructure` object into `salarySlip.snapshot` at run time so historical accuracy is guaranteed regardless of future edits to the employee record.

---

## Role-Based Access Control

Rolled ships with four roles. The `role` field is stored on the user's Firestore document and checked by Firebase Security Rules on every read and write. Each role gets its own completely separate dashboard shell — not a filtered view, but a different build with different routes and components.

| Permission | Super Admin | Accountant | HR Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| Manage company settings | ✅ | ❌ | ❌ | ❌ |
| Create & send invoices | ✅ | ✅ | ❌ | ❌ |
| View all invoices | ✅ | ✅ | ❌ | ❌ |
| Manage employees | ✅ | ❌ | ✅ | ❌ |
| Run payroll | ✅ | ⚠️ | ✅ | ❌ |
| View all salary slips | ✅ | ⚠️ | ✅ | ❌ |
| View own salary slip | ✅ | ✅ | ✅ | ✅ |
| View dashboard & reports | ✅ | ✅ | ✅ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ |
| Invite team members | ✅ | ❌ | ⚠️ | ❌ |

⚠️ = partial access, configurable per company. Enforced at both the UI layer (route guards) and Firestore Security Rules layer.

---

## Core Modules

### Module 1 — Invoice Management `[Must have]`

Full invoice lifecycle from creation to payment collection. Status transitions are both manual and automatic.

**Invoice states:** `DRAFT` → `SENT` → `PAID` / `OVERDUE`

Key capabilities:
- Create invoices with line items, sub-total, tax, and grand total
- Assign to a client — auto-fills address and contact from the client record
- Select an invoice template from the designer library before generating
- Generate PDF client-side with `@react-pdf/renderer`, upload to Firebase Storage
- Send via email (Resend API) with PDF attached and a shareable link
- Track view history — log when client opens the share link
- One-click mark as paid with payment date recorded
- Duplicate any invoice as a starting point for a new one

**How overdue works:** A Cloud Function runs daily at midnight via PubSub. It queries all invoices where `status == "SENT"` and `dueDate < today`, flips each to `OVERDUE`, sends a reminder email, and writes an audit log entry.

---

### Module 2 — Custom Invoice Designer `[Must have]`

The standout feature. Templates are stored as JSON layout objects in Firestore and rendered dynamically in both the live preview and when generating PDFs — a new theme requires no code change.

Key capabilities:
- Drag-and-drop section reordering: logo, company details, client info, line items, totals, notes, signature
- Upload company logo to Firebase Storage — appears on all invoices and salary slips
- Customize primary color, secondary color, and font family
- Live split-screen preview — left: editor controls, right: rendered invoice with real data
- 4 built-in starter themes: Minimal, Corporate, Bold, Classic
- Save unlimited named templates per company; set any as the default

```json
// Template stored in Firestore
{
  "name": "Corporate Blue",
  "primaryColor": "#1D3557",
  "accentColor": "#457B9D",
  "font": "DM Sans",
  "layout": "header-wide",
  "sections": ["logo", "from", "to", "items", "totals", "notes"],
  "showSignature": true,
  "showTaxBreakdown": true
}
```

---

### Module 3 — Employee Management `[Must have]`

Employee profiles are the foundation of payroll. The salary structure is embedded per employee and snapshotted into every payroll run.

Key capabilities:
- Employee profiles: name, email, phone, photo, department, designation, employee ID, join date
- Department management — create departments, assign employees, view headcount
- Salary structure: basic salary + unlimited named allowances + unlimited named deductions
- Employment status: Active / On Leave / Terminated (only Active employees are included in payroll runs)
- Bulk import employees via CSV upload
- Salary history view per employee — shows every payroll slip ever generated

---

### Module 4 — Payroll Management `[Must have]`

One-click monthly payroll. The system fetches all active employees, applies the salary formula, calculates tax slabs, creates a `PayrollRun` document, and generates one `SalarySlip` per employee in a single transaction.

**Calculation formula:**

```
Basic salary
+ Allowances (house rent, medical, transport, ...)
= Gross pay
- Income tax (configurable slab from company settings)
- Deductions (EOBI, provident fund, ...)
= Net pay
```

Key capabilities:
- Preview payroll before confirming — shows all employees and their computed net pay
- Tax calculation using configurable slabs stored in `/companies/{id}/taxConfig`
- Guard against duplicate runs — prevents the same month being run twice
- Payroll history with total expense, headcount, and status
- Rollback a run (admin only) — deletes the run and all generated slips

---

### Module 5 — Salary Slip Generation `[Must have]`

Salary slips are generated automatically when a payroll run completes. Each slip is rendered as a PDF, uploaded to Firebase Storage, and the URL saved to the slip document. Employees access their own slips through their profile.

Key capabilities:
- Each slip shows: company header, employee name + ID + designation, month/year, earnings table, deductions table, gross pay, tax breakdown, net pay
- Company logo and branding pulled from company settings
- PDF generated client-side, uploaded to Firebase Storage
- Employee self-service at `/my-slips` — Firebase Rules ensure they can only read where `employeeId == request.auth.uid`
- Bulk download all slips for a payroll run as a ZIP (JSZip, client-side)
- Admin can regenerate a slip if data was corrected after the run

---

### Module 6 — Dashboard & Reporting `[Must have]`

The first thing admins and accountants see. Powered by Firestore aggregate queries (`count()` and `sum()`) and Recharts.

Key capabilities:
- Revenue overview: total invoiced, total collected, outstanding — all live from Firestore
- Invoice status donut chart: count of Draft / Sent / Paid / Overdue
- Revenue trend: 6-month bar chart of monthly invoice totals
- Payroll expense trend: 6-month line chart
- Outstanding payments table: sorted by most overdue
- Top clients by revenue: ranked with total billed and payment rate
- Department payroll breakdown: pie chart
- Quick actions panel: create invoice, run payroll, add employee — from the dashboard directly
- Date range filter: current month, last 3 months, last 6 months, custom range

---

### Module 7 — User & Access Management `[Must have]`

Authentication via Firebase Auth (email/password + Google SSO). Authorization enforced at two independent layers: React route guards and Firestore Security Rules.

Key capabilities:
- Sign up creates a new company and sets the user as Super Admin
- Invite team members by email — tokenized invite link stored in `/invites/{token}`
- Multi-company: users can belong to multiple companies and switch via navbar dropdown
- Role assignment by Super Admin within the company
- Audit log page (admin only): filterable by action type, entity type, and date range
- Password reset via Firebase Auth email flow

---

## Bonus Features

All 12 bonus features run on the free tier with no external AI API.

| Feature | Category | Implementation |
|---|---|---|
| Invoice smart-fill from natural language | AI | Regex/date parser + Firestore client lookup — no external API, no API key |
| Payroll insights (month-over-month) | AI | Firestore aggregation + rule-based summary templates — no external API |
| Configurable tax calculations | Finance | Tax slabs stored in Firestore; `calculateTax(grossPay)` pure JS util |
| QR code invoice sharing | Automation | `qrcode.react` + public Firestore query via `sharedToken` (UUID) |
| Automated email invoice delivery | Automation | Cloud Function triggers Resend API on invoice send |
| Automated payment reminders | Automation | Daily Cloud Function — first at due date, second at +3 days, third at +7 days; `reminderCount` prevents duplicates |
| Multi-company support | Finance | All data under `/companies/{id}`; React context re-scopes all queries on switch |
| Excel / CSV export | Finance | `xlsx` npm (open source, client-side) — works on invoices, employees, payroll, slips |
| Audit logs & activity tracking | Finance | `logAudit()` helper writes before/after state on every write |
| Dark mode | UX | Tailwind `dark:` variant; preference stored in Firestore user doc |
| Mobile responsive | UX | Tailwind `sm:` / `md:` / `lg:` prefixes; sidebar collapses to bottom nav on mobile |
| Advanced financial analytics | Finance | Revenue vs. payroll overlay chart, profit trend, client ranking, collection rate % |

**Why no external AI API** — Both "AI" features run on rule-based logic over your own Firestore data instead of an LLM call. That means $0 per-request cost, no API key to secure, no rate limit, and no hallucination risk on financial numbers.

---

## Project Structure

```
rolled/
├── app/
│   ├── (auth)/              # login · signup · reset password
│   ├── (dashboard)/         # main layout + sidebar
│   │   ├── dashboard/       # overview + charts
│   │   ├── invoices/        # list · create · [id]
│   │   ├── designer/        # template builder
│   │   ├── clients/         # client records
│   │   ├── employees/       # profiles · departments
│   │   ├── payroll/         # run payroll · history
│   │   ├── salary-slips/    # by employee or run
│   │   ├── reports/         # financial analytics
│   │   └── settings/        # company · users · audit log
│   └── share/[token]/       # public invoice view (no login)
├── components/
│   ├── invoice/             # InvoiceForm · InvoicePDF
│   ├── designer/            # TemplateEditor · ThemePicker
│   ├── payroll/             # PayrollPreview · SlipCard
│   ├── charts/              # RevenueChart · PayrollChart
│   └── ui/                  # Button · Badge · Table · Modal
├── lib/
│   ├── firebase.ts          # init, auth, db, storage
│   ├── firestore/           # service functions per collection
│   ├── pdf/                 # invoice + slip renderers
│   ├── smart-fill/          # prompt parser + client/line-item lookup
│   ├── insights/            # payroll delta calc + summary templates
│   ├── email/               # Resend templates
│   └── utils/               # taxCalc · formatCurrency
└── functions/               # Firebase Cloud Functions
    ├── overdueCheck.ts
    ├── paymentReminder.ts
    └── payrollComplete.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Firebase project (Blaze plan for Cloud Functions; Spark plan covers everything else)
- A [Resend](https://resend.com) account (free tier: 3,000 emails/month)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/muaazx/Rolled.git
cd Rolled

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Add your credentials (see Environment Variables below)
# Edit .env.local with your Firebase and Resend keys

# 5. Start the development server
npm run dev

# 6. Open http://localhost:3000
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google providers)
3. Enable **Firestore Database** (start in production mode)
4. Enable **Storage**
5. Enable **Cloud Functions** (requires Blaze plan)
6. Copy your Firebase config values into `.env.local`
7. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
8. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (server-side / Cloud Functions)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Resend (email delivery)
RESEND_API_KEY=re_your_resend_api_key
```

---

## Key Flows

### Invoice Lifecycle

```
1. Create     →  Fill items, select client & template
2. Preview    →  Check live PDF preview in designer
3. Save Draft →  Status = DRAFT stored in Firestore
4. Send       →  Email + PDF delivered via Resend API
5. Track      →  Client views share link; log recorded
6. Remind     →  Auto reminder emails if overdue (Cloud Function)
7. Mark Paid  →  Status = PAID, payment date recorded
```

### Payroll Run

```
1. Select month  →  Admin picks year + month
2. Preview       →  All active employees + computed net pay shown
3. Confirm run   →  PayrollRun document created in Firestore
4. Calculate     →  Gross pay, tax slab, deductions, net pay per employee
5. Generate slips→  PDF per employee generated client-side → uploaded to Storage
6. Insights      →  Month-over-month delta computed from Firestore (no external call)
7. Complete      →  Dashboard updated, audit log written
```

---

## Free Tier Breakdown

Rolled is designed to stay within free tiers for development, demos, and moderate real usage.

| Service | Free allowance | Used for |
|---|---|---|
| **Firebase Firestore** | 1 GB storage · 50K reads/day · 20K writes/day | All application data |
| **Firebase Auth** | Unlimited users · Unlimited sessions | Email/password + Google SSO |
| **Firebase Storage** | 5 GB storage · 1 GB/day download | Logos, invoice PDFs, salary slip PDFs |
| **Firebase Cloud Functions** | 2M invocations/month · 400K GB-seconds | Payroll cron, email triggers, overdue detection |
| **Vercel** | Unlimited deployments · Custom domain | Next.js frontend + API routes |
| **Resend** | 3,000 emails/month | Invoice delivery + payment reminders |
| **Smart-fill & insights engine** | $0 · No rate limit | Invoice smart-fill + payroll insights from Firestore |
| **@react-pdf/renderer** | Open source · No limits | Client-side PDF generation |
| **xlsx** | Open source · No limits | Client-side Excel/CSV export |

**Monthly infrastructure cost: $0**

---

## Roadmap

### Week 1 — Foundation
Firebase setup · Auth flows · Firestore security rules · Company onboarding · Employee CRUD · Department management · Role-based route guards

### Week 2 — Core invoice & payroll
Invoice CRUD + status machine · PDF generation · Basic invoice template · Payroll run engine with tax calculation · Salary slip generation · Slip PDF upload

### Week 3 — Designer, dashboard & automation
Invoice designer UI with 4 themes · Live preview panel · Dashboard with Recharts · Email delivery via Resend · Overdue detection Cloud Function · Automated reminders · QR code sharing

### Week 4 — Bonus features & polish
Rule-based invoice smart-fill · Rule-based payroll insights · Multi-company switcher · Excel/CSV export · Audit log viewer · Dark mode · Mobile responsive pass · Seed data · Deploy to Vercel

---

## Contributing

Contributions are welcome! Please open an issue to discuss what you'd like to change before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Rolled** — Invoice & payroll, finally rolled into one.

[Live Demo](https://rolled-three.vercel.app/) · [GitHub](https://github.com/muaazx/Rolled) · [Report a Bug](https://github.com/muaazx/Rolled/issues)

Built with Next.js 14 + Firebase · $0 infrastructure cost · All features on free tier

</div>