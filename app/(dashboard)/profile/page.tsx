"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { getEmployees, formatCurrency } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building, Briefcase, Calendar, Banknote, CreditCard, Shield } from "lucide-react"
import type { Employee } from "@/lib/data"

export default function ProfilePage() {
  const { user, role } = useAuth()
  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user?.email) {
      const list = getEmployees()
      const found = list.find(emp => emp.email.toLowerCase() === user.email?.toLowerCase())
      if (found) {
        setEmployeeProfile(found)
      }
    }
  }, [user])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  // Fallback profile details if user is not in employee local directory
  const name = employeeProfile?.name || user.displayName || "User Profile"
  const email = employeeProfile?.email || user.email || ""
  const phone = employeeProfile?.phone || "-"
  const department = employeeProfile?.department || "Administration"
  const designation = employeeProfile?.designation || (role === 'super_admin' ? 'Super Admin' : 'Staff Member')
  const status = employeeProfile?.status || "Active"
  const joinDate = employeeProfile?.joinDate || "-"

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-bold text-2xl mb-1">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">View your personal directory records, role credentials, and payroll parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 overflow-hidden h-fit">
          <div className="h-16 bg-gradient-to-r from-primary to-blue-600"></div>
          <CardContent className="p-6 text-center relative -mt-8">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-900 p-1 shadow-lg mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white text-2xl font-black">
                {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">{name}</h3>
            <p className="text-xs text-primary font-semibold mt-1">{designation}</p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{employeeProfile?.employeeId || "System Profile"}</p>

            <div className="mt-4 pt-2 flex justify-center">
              <Badge variant={status === 'Active' ? 'paid' : status === 'On Leave' ? 'sent' : 'default'} className="px-2.5 py-0.5">
                {status}
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-left space-y-3.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-gray-400" />
                <span className="truncate text-gray-900 dark:text-gray-100 font-medium">{email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield size={14} className="text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100 capitalize font-medium">{role?.replace('_', ' ') || 'employee'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <div className="md:col-span-2 space-y-6">
          {/* Work details */}
          <Card>
            <CardHeader className="bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Briefcase size={14} className="text-primary" /> Employment Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Department</span>
                <span className="text-gray-800 font-bold flex items-center gap-1"><Building size={12} className="text-gray-400" /> {department}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Designation</span>
                <span className="text-gray-800 font-bold flex items-center gap-1"><Briefcase size={12} className="text-gray-400" /> {designation}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Join Date</span>
                <span className="text-gray-800 font-bold flex items-center gap-1"><Calendar size={12} className="text-gray-400" /> {joinDate}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Workspace Access</span>
                <span className="text-gray-800 font-bold flex items-center gap-1 capitalize"><Shield size={12} className="text-gray-400" /> {role?.replace('_', ' ') || 'Employee'} Portal</span>
              </div>
            </CardContent>
          </Card>

          {/* Salary Structure (only visible if configured) */}
          {employeeProfile && (
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Banknote size={14} className="text-primary" /> Compensation Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-[#1a1a24] border border-gray-150 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Basic Salary</span>
                    <span className="text-[10px] text-gray-400">Regular base take-home wage</span>
                  </div>
                  <span className="text-lg font-extrabold text-primary">{formatCurrency(employeeProfile.salaryStructure.basic)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Allowances */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Allowances</span>
                    <div className="space-y-1.5">
                      {employeeProfile.salaryStructure.allowances.map((allow, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-green-50/30 border border-green-100 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{allow.label}</span>
                          <span className="font-bold text-green-700">+{formatCurrency(allow.amount)}</span>
                        </div>
                      ))}
                      {employeeProfile.salaryStructure.allowances.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No custom allowances configured.</p>
                      )}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Deductions</span>
                    <div className="space-y-1.5">
                      {employeeProfile.salaryStructure.deductions.map((ded, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-red-50/30 border border-red-100 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{ded.label}</span>
                          <span className="font-bold text-red-700">-{formatCurrency(ded.amount)}</span>
                        </div>
                      ))}
                      {employeeProfile.salaryStructure.deductions.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No custom deductions configured.</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {employeeProfile && (
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-primary" /> Bank Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Bank Name</span>
                  <span className="text-gray-800 font-bold">{employeeProfile.bankDetails.bankName || "-"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">Account Number</span>
                  <span className="text-gray-850 font-mono font-bold">{employeeProfile.bankDetails.accountNumber || "-"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[9px]">IBAN Reference</span>
                  <span className="text-gray-850 font-mono font-bold">{employeeProfile.bankDetails.iban || "-"}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
