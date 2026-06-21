# Rolled — Invoice & Payroll Platform

A free, full-stack web platform for creating branded invoices, running monthly payroll, generating salary slips, and tracking finances — all from one place, powered by Next.js 14 + Firebase.

## User Review Required

> [!WARNING]
> **New Authentication Architecture**: Based on your latest request, we are completely overhauling the login system. 
> 1. **No Public Signups**: The `/signup` page will be deleted.
> 2. **Centralized Admin**: There is one master Admin. The Admin's credentials will be securely hardcoded via Environment Variables.
> 3. **Admin SDK Needed**: Because the Admin must be able to create new accounts for employees/managers *without* getting logged out, we MUST use the **Firebase Admin SDK** on our Next.js backend.
> 4. **Role-Based Login**: The login page will now have a role-selector (Admin vs Staff/Employee).

> [!IMPORTANT]
> **Action Required (Firebase Admin SDK)**: To allow the Admin to create users in the background, I need a **Service Account Key** from your Firebase project.
> 1. Go to your Firebase Console > Project Settings (Gear icon) > **Service Accounts**.
> 2. Click **"Generate new private key"**. This will download a `.json` file.
> 3. Open the file and paste the `client_email` and `private_key` here in the chat so I can configure the secure backend!

---

## Completed Phases
- **Phase 1**: Project Foundation (Next.js, Tailwind, Global styles)
- **Phase 2**: Dashboard Layouts
- **Phase 3**: Core Modules UI (Invoices, Employees, Payroll, Salary Slips, Dashboard)

---

## Proposed Changes: Phase 6 - Backend Integration & Admin Auth

### 1. Hardcoded Admin Authentication
#### [MODIFY] `app/(auth)/login/page.tsx`
- Redesign the Login page to include a **Role Selector** (e.g., tabs for "Admin Login" and "Employee Login").
- If logging in as Admin, the system will verify the credentials against hardcoded environment variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`).
- Upon successful validation, the system will sign the Admin into Firebase using a custom token or a pre-configured Firebase Admin account.
- **[DELETE]** `app/(auth)/signup/page.tsx` entirely.

### 2. User Provisioning (Admin creates accounts)
#### [MODIFY] `app/(dashboard)/settings/page.tsx`
- Add a "Create User Account" panel exclusively visible to the Admin.
- The Admin fills out the new user's Email, Password, and Role (Accountant, HR, Employee).
#### [NEW] `app/api/users/create/route.ts`
- A secure backend API route using `firebase-admin` that creates the requested user in Firebase Authentication without logging the Admin out.
- It will also create the corresponding role mapping document in the `users` Firestore collection.

### 3. Firestore Data Migration
- We will replace the mock data functions in `lib/data.ts` with real asynchronous Firestore calls (`lib/db.ts`).
- Ensure all dashboard pages fetch data safely from Firestore.

### 4. Email Integration (Resend)
- Implement Resend email API route to deliver invoices and salary slips, and optionally to email the generated credentials to the new employees when the Admin creates their accounts!

## Verification Plan
1. Ensure the public signup route no longer exists.
2. Verify the Admin can log in using the hardcoded credentials via the "Admin" role tab.
3. Verify the Admin can create an Employee account via the Settings dashboard.
4. Verify the new Employee can log in via the "Employee" role tab using the credentials provided by the Admin.
