"use client"

import { useState } from "react"
import { getAuditLogs, getCompany, saveCompany, formatDateTime, getClients, getInvoices, getEmployees, getPayrollRuns, getSalarySlips } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Save, Building, Users, Shield, Sliders, Database, UploadCloud } from "lucide-react"
import { setDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function SettingsPage() {
 const company = getCompany()
 const auditLogs = getAuditLogs()
 const [activeTab, setActiveTab] = useState("company")
 const [isSeeding, setIsSeeding] = useState(false)

 const handleSeedDatabase = async () => {
   if (!db) return alert("Firebase not initialized")
   setIsSeeding(true)
   try {
     console.log("Seeding companies...");
     await setDoc(doc(db, "companies", company.id), company);
     
     console.log("Seeding clients...");
     const clients = getClients();
     for (const c of clients) await setDoc(doc(db, "clients", c.id), c);

     console.log("Seeding invoices...");
     const invoices = getInvoices();
     for (const i of invoices) await setDoc(doc(db, "invoices", i.id), i);

     console.log("Seeding employees...");
     const employees = getEmployees();
     for (const e of employees) await setDoc(doc(db, "employees", e.id), e);

     console.log("Seeding payroll...");
     const payrolls = getPayrollRuns();
     for (const p of payrolls) await setDoc(doc(db, "payroll_runs", p.id), p);

     console.log("Seeding slips...");
     const slips = getSalarySlips();
     for (const s of slips) await setDoc(doc(db, "salary_slips", s.id), s);

     alert("Database Seeded Successfully!")
   } catch (e: any) {
     alert("Error seeding database: " + e.message)
   } finally {
     setIsSeeding(false)
   }
 }

 return (
 <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
 <div>
 <h1 className="font-bold text-2xl mb-1">Settings</h1>
 <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your company workspace and preferences.</p>
 </div>

 <div className="flex flex-col md:flex-row gap-6">
 {/* Settings Navigation */}
 <div className="w-full md:w-64 shrink-0">
 <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
 <button onClick={() => setActiveTab("company")}
 className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "company" ? "bg-white dark:bg-gray-900 dark:bg-white/10 text-primary shadow-sm " : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
 >
 <Building size={18} /> Company Profile
 </button>
 <button onClick={() => setActiveTab("tax")}
 className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "tax" ? "bg-white dark:bg-gray-900 dark:bg-white/10 text-primary shadow-sm " : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
 >
 <Sliders size={18} /> Tax Configuration
 </button>
 <button onClick={() => setActiveTab("users")}
 className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "users" ? "bg-white dark:bg-gray-900 dark:bg-white/10 text-primary shadow-sm " : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
 >
 <Users size={18} /> Users & Roles
 </button>
 <button onClick={() => setActiveTab("audit")}
 className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "audit" ? "bg-white dark:bg-gray-900 dark:bg-white/10 text-primary shadow-sm " : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
 >
 <Shield size={18} /> Audit Log
 </button>
 </nav>
 </div>

 {/* Settings Content */}
 <div className="flex-1 space-y-6">
 {activeTab === "company" && (
 <>
 <Card>
 <CardHeader className=" ">
 <CardTitle className="text-lg">Company Profile</CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-6">
 <form onSubmit={(e) => {
   e.preventDefault();
   const target = e.target as any;
   const updatedCompany = {
     ...company,
     name: target.companyName.value,
     currency: target.currency.value,
     email: target.email.value,
     phone: target.phone.value,
     address: target.address.value,
   };
   saveCompany(updatedCompany);
   alert("Company profile updated successfully!");
   // Refresh the page to update the company name across the dashboard
   window.location.reload();
 }}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
 <Input name="companyName" defaultValue={company.name} required />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Currency</label>
 <select name="currency" defaultValue={company.currency} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 dark:bg-[#1a1a24] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-gray-100 transition-colors">
 <option value="PKR" className="dark:bg-[#1a1a24]">PKR - Pakistani Rupee</option>
 <option value="USD" className="dark:bg-[#1a1a24]">USD - US Dollar</option>
 <option value="EUR" className="dark:bg-[#1a1a24]">EUR - Euro</option>
 <option value="GBP" className="dark:bg-[#1a1a24]">GBP - British Pound</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
 <Input name="email" defaultValue={company.email} type="email" required />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
 <Input name="phone" defaultValue={company.phone} />
 </div>
 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Address</label>
 <Input name="address" defaultValue={company.address} />
 </div>
 </div>

 <div className="pt-4 flex justify-end">
 <Button type="submit">
 <Save size={16} className="mr-2" /> Save Changes
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>

  <Card>
    <CardHeader className="bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50 dark:bg-white/5">
      <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
      <CardDescription>Irreversible destructive actions</CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Delete Company</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Permanently remove your company and all data.</p>
        </div>
        <Button variant="danger">Delete Account</Button>
      </div>
    </CardContent>
  </Card>
  
  <Card className="mt-6 border-dashed border-primary">
    <CardHeader className="bg-primary/5">
      <CardTitle className="text-lg text-primary flex items-center gap-2">
        <Database size={18} />
        Developer Tools
      </CardTitle>
      <CardDescription>Push the local mock data up to your new Firebase Firestore instance.</CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      <Button onClick={handleSeedDatabase} disabled={isSeeding} className="w-full">
        <UploadCloud size={16} className="mr-2" />
        {isSeeding ? "Uploading to Firestore..." : "Seed Firebase Database"}
      </Button>
    </CardContent>
  </Card>
  </>
 )}

 {activeTab === "audit" && (
 <Card>
 <CardHeader className=" ">
 <CardTitle className="text-lg">Audit Log</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="data-table">
 <thead>
 <tr>
 <th>Timestamp</th>
 <th>User</th>
 <th>Action</th>
 <th>Description</th>
 </tr>
 </thead>
 <tbody>
 {auditLogs.map((log) => (
 <tr key={log.id}>
 <td>
 {formatDateTime(log.timestamp)}
 </td>
 <td>
 {log.userName}
 </td>
 <td>
 <Badge variant={log.action === 'created' ? 'paid' : log.action === 'deleted' ? 'overdue' : 'sent'} className="px-2 py-0.5 text-xs">
 {log.action} {log.entityType}
 </Badge>
 </td>
 <td>
 {log.description}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 )}

  {activeTab === "users" && (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">User Management</CardTitle>
        <CardDescription>Create credentials for new employees and managers.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          try {
            const res = await fetch('/api/users/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: target.name.value,
                email: target.email.value,
                password: target.password.value,
                role: target.role.value,
                companyId: company.id
              })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert("User created successfully! You can now securely hand over these credentials.");
            target.reset();
          } catch(err: any) {
            alert("Error creating user: " + err.message);
          }
        }} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <Input name="name" required placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <Input name="email" type="email" required placeholder="john@company.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temporary Password</label>
            <Input name="password" required placeholder="Enter a secure password" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select name="role" required className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 dark:bg-[#1a1a24] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-gray-100 transition-colors">
              <option value="employee" className="dark:bg-[#1a1a24]">Employee</option>
              <option value="hr_manager" className="dark:bg-[#1a1a24]">HR Manager</option>
              <option value="accountant" className="dark:bg-[#1a1a24]">Accountant</option>
              <option value="super_admin" className="dark:bg-[#1a1a24]">Admin</option>
            </select>
          </div>
          <Button type="submit" className="mt-4">Generate Credentials</Button>
        </form>
      </CardContent>
    </Card>
  )}

  {/* Placeholders for other tabs */}
  {activeTab === "tax" && (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tax Configuration</CardTitle>
        <CardDescription>Manage global tax settings for your invoices and payroll.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          alert("Tax settings saved successfully!");
        }} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax Agency Name</label>
              <Input defaultValue="Federal Board of Revenue (FBR)" placeholder="e.g. IRS, HMRC, FBR" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax Registration Number</label>
              <Input defaultValue="TX-9821004" placeholder="e.g. VAT or NTN number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Tax Rate (%)</label>
              <Input defaultValue="18" type="number" step="0.01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tax Calculation Method</label>
              <select className="flex h-10 w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 dark:bg-[#1a1a24] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-gray-100 transition-colors">
                <option value="exclusive" className="dark:bg-[#1a1a24]">Exclusive (Added to Subtotal)</option>
                <option value="inclusive" className="dark:bg-[#1a1a24]">Inclusive (Included in Price)</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-medium mb-3">Payroll Tax Settings</h4>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1a1a24] dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-gray-800 dark:border-white/10">
              <input type="checkbox" id="auto-deduct" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <div>
                <label htmlFor="auto-deduct" className="text-sm font-medium text-gray-900 dark:text-gray-100">Automatically calculate employee income tax</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rolled will estimate income tax based on annual salary brackets.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">
              <Save size={16} className="mr-2" /> Save Tax Configuration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )}
 </div>
 </div>
 </div>
 )
}
