# Rolled SaaS Application Walkthrough

I've completed the implementation of the core front-end for the Rolled platform according to your PRD (`rolled.html`) and the UI reference screenshot.

The app uses a premium dark/light mode adaptable design system with a purple/blue gradient aesthetic. 

## Features Implemented

### 1. Global Design System
- **Fonts**: `DM Serif Display` for headings and `DM Sans` for body text, creating a modern, editorial feel.
- **Colors**: Deep dark backgrounds (`gray-950`) with vibrant primary (`#7C3AED` purple) and accent (`#2E5BFF` blue) gradients.
- **Glassmorphism**: Custom utilities (`.glass-card`, `.glass-panel`) for translucent UI elements.

### 2. Authentication UI
- Built the `Login` and `Signup` pages featuring a split-layout hero design.
- You can view them at `http://localhost:3000/login`

### 3. Dashboard Shell & Navigation
- **Sidebar**: Role-based navigation that adapts based on the active user (super admin, accountant, HR manager).
- **Navbar**: Sticky top navigation with global search and user profile context.

### 4. Core Modules
- **Dashboard**: High-level metrics, revenue vs. payroll charts, and quick stats.
- **Invoices**: 
  - List view with status badges and filters.
  - Create Invoice interface with dynamic line items, real-time total calculations, and template selection.
- **Employees**: Directory with toggleable Grid/List views, department filtering, interactive card/table row actions (edit/delete), a visual **Departments Headcount Directory**, and a full **Add/Edit Employee Modal** featuring dynamic salary structures (allowances and deductions) and banking credentials.
- **Payroll**: Interface for processing monthly payroll with projected summaries and history tracking.
- **Salary Slips**: List view of generated slips for employees. Added high-fidelity printing and PDF export features specifically targeting individual slips using clean CSS print utilities (`print:hidden` and `print:block`), ensuring page layouts are preserved when printing/downloading single slips.
- **Clients**: Client directory and billing history, now with fully interactive profile details, editing, deletion, and quick invoice creation.
- **Settings**: Company profile, tax configuration, and audit logs.
- **Invoice Designer**: Custom theme builder offering layout selector presets (Minimal, Corporate, Bold, Classic), font selection, and primary/accent brand colors. Features a high-fidelity **Live Invoice Preview** that updates instantly as styles are selected. Settings can be saved to persist locally.
- **Reports & Analytics**: A multi-tab dashboard (Financial Overview, Payroll & Taxes, Invoice Collections) featuring real-time financial KPI cards (Revenue, Payroll, Taxes, Profit Margin), interactive data charts (Revenue vs. Payroll Bar Chart, Department Cost Breakdown Pie Chart) powered by Recharts, and detailed accounting report lists with interactive search.

## Testing the Application

The development server is currently running.

You can preview the application in your browser:
👉 **[http://localhost:3000](http://localhost:3000)**

*(It will automatically redirect you to the `/dashboard` route).*

## Next Steps for the Future
1. **Firebase Integration**: Replace the mock data store (`lib/data.ts`) with Firebase Auth and Firestore.
2. **Resend Email API**: Connect the "Send Invoice" actions to actual email delivery.
3. **PDF Generation**: Implement `react-pdf` or `jspdf` for exporting invoices and salary slips.
