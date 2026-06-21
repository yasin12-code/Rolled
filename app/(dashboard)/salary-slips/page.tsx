"use client"

import { useState } from "react"
import { getSalarySlips, getMonthName, formatCurrency, getCompany, getEmployees } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, FileText, Eye, Send, X, CheckCircle2, Printer } from "lucide-react"
import type { SalarySlip } from "@/lib/data"

export default function SalarySlipsPage() {
  const allSlips = getSalarySlips()
  const employees = getEmployees()
  const company = getCompany()
  const [searchQuery, setSearchQuery] = useState("")

  // Email & View state
  const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null)
  const [sendingSlip, setSendingSlip] = useState<SalarySlip | null>(null)
  const [emailInput, setEmailInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const filteredSlips = allSlips.filter(slip =>
    slip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getMonthName(slip.month).toLowerCase().includes(searchQuery.toLowerCase()) ||
    slip.year.toString().includes(searchQuery)
  )

  const openSendModal = (slip: SalarySlip) => {
    const emp = employees.find(e => e.id === slip.employeeId)
    setEmailInput(emp?.email || "")
    setSendingSlip(slip)
    setSentSuccess(false)
  }

  const handleSendSlip = async () => {
    if (!sendingSlip || !emailInput) return
    setIsSending(true)
    try {
      const res = await fetch('/api/send-salary-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slip: sendingSlip,
          recipientEmail: emailInput,
          companyName: company.name
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSentSuccess(true)
    } catch (err: any) {
      alert("Failed to send: " + err.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className={`space-y-6 animate-fade-in ${viewingSlip ? 'print:hidden' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl mb-1">Salary Slips</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View, email, and download generated employee slips.</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Download size={16} />
          Export (PDF)
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search by name or month..." className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Gross Pay</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlips.length > 0 ? (
                  filteredSlips.map((slip) => (
                    <tr key={slip.id}>
                      <td>
                        <div className="font-medium text-gray-900 dark:text-gray-100 ">{slip.employeeName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{slip.snapshot.designation}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900 dark:text-gray-100 ">{getMonthName(slip.month)} {slip.year}</div>
                      </td>
                      <td>
                        {formatCurrency(slip.grossPay)}
                      </td>
                      <td>
                        {formatCurrency(slip.totalDeductions + slip.taxDeduction)}
                      </td>
                      <td>
                        <span className="font-semibold text-green-700">{formatCurrency(slip.netPay)}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400" onClick={() => setViewingSlip(slip)}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-blue-600" onClick={() => { setViewingSlip(slip); setTimeout(() => window.print(), 500); }}>
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 px-3 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => openSendModal(slip)}
                          >
                            <Send size={13} />
                            Email
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="text-gray-300 mb-4" />
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No slips found</p>
                        <p className="text-sm">We couldn't find any salary slips matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Send Salary Slip Modal */}
      {sendingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSendingSlip(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <button
              onClick={() => setSendingSlip(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>

            {sentSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Salary Slip Sent!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <strong>{sendingSlip.employeeName}'s</strong> slip for <strong>{getMonthName(sendingSlip.month)} {sendingSlip.year}</strong> has been emailed to <strong>{emailInput}</strong>.
                </p>
                <Button onClick={() => setSendingSlip(null)} className="w-full">Done</Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Send size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Email Salary Slip</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
                    Send the salary slip directly to the employee.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Employee</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{sendingSlip.employeeName}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Period</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{getMonthName(sendingSlip.month)} {sendingSlip.year}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Net Pay</span>
                    <span className="font-semibold text-green-700">{formatCurrency(sendingSlip.netPay)}</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recipient Email</label>
                    <Input
                      type="email"
                      placeholder="employee@company.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="bg-gray-50 dark:bg-[#1a1a24] border-gray-200 dark:border-white/10 focus:bg-white dark:bg-gray-900"
                    />
                  </div>
                  <Button
                    onClick={handleSendSlip}
                    disabled={isSending || !emailInput}
                    className="w-full h-11"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={15} className="mr-2" />
                        Send Salary Slip
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}      {/* View/Print Slip Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0 print:block print:relative print:z-auto print:inset-auto">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm print:hidden" onClick={() => setViewingSlip(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:p-0 print:max-h-none print:overflow-visible">
            <button
              onClick={() => setViewingSlip(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors print:hidden"
            >
              <X size={18} />
            </button>
            
            {/* Slip Content */}
            <div className="border border-gray-150 p-5 rounded-xl print:border-none print:p-0">
               <div className="flex justify-between items-start border-b pb-4 mb-4">
                 <div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{company.name}</h2>
                   <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Salary Slip - {getMonthName(viewingSlip.month)} {viewingSlip.year}</p>
                 </div>
                 <div className="text-right">
                   <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100">{viewingSlip.snapshot.name}</h3>
                   <p className="text-[11px] text-gray-500 dark:text-gray-400">{viewingSlip.snapshot.designation}</p>
                   <p className="text-[11px] text-gray-500 dark:text-gray-400">{viewingSlip.snapshot.department}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6 mb-5">
                 <div>
                   <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 border-b pb-1.5 mb-2 uppercase tracking-wider">Earnings</h4>
                   <div className="flex justify-between text-xs py-0.5">
                     <span className="text-gray-500 dark:text-gray-400">Basic Salary</span>
                     <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(viewingSlip.snapshot.basic)}</span>
                   </div>
                   {viewingSlip.snapshot.allowances.map((a, i) => (
                     <div key={i} className="flex justify-between text-xs py-0.5">
                       <span className="text-gray-500 dark:text-gray-400">{a.label}</span>
                       <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(a.amount)}</span>
                     </div>
                   ))}
                   <div className="flex justify-between text-xs py-1.5 mt-1.5 border-t font-bold text-gray-900 dark:text-gray-100">
                     <span>Gross Earnings</span>
                     <span>{formatCurrency(viewingSlip.grossPay)}</span>
                   </div>
                 </div>

                 <div>
                   <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 border-b pb-1.5 mb-2 uppercase tracking-wider">Deductions</h4>
                   {viewingSlip.snapshot.deductions.map((d, i) => (
                     <div key={i} className="flex justify-between text-xs py-0.5">
                       <span className="text-gray-500 dark:text-gray-400">{d.label}</span>
                       <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(d.amount)}</span>
                     </div>
                   ))}
                   <div className="flex justify-between text-xs py-0.5">
                     <span className="text-gray-500 dark:text-gray-400">Income Tax</span>
                     <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(viewingSlip.taxDeduction)}</span>
                   </div>
                   <div className="flex justify-between text-xs py-1.5 mt-1.5 border-t font-bold text-red-600">
                     <span>Total Deductions</span>
                     <span>{formatCurrency(viewingSlip.totalDeductions + viewingSlip.taxDeduction)}</span>
                   </div>
                 </div>
               </div>

               <div className="bg-green-50 border border-green-100 rounded-xl p-3.5 flex justify-between items-center print:border-t-2 print:border-b-2 print:border-black print:rounded-none">
                 <span className="font-semibold text-xs text-green-800">Net Pay (Take Home)</span>
                 <span className="text-xl font-bold text-green-700">{formatCurrency(viewingSlip.netPay)}</span>
               </div>
            </div>

            <div className="mt-4 flex justify-end gap-2.5 print:hidden">
              <Button variant="secondary" className="h-8 text-xs px-3" onClick={() => setViewingSlip(null)}>Close</Button>
              <Button onClick={() => window.print()} className="h-8 text-xs px-3 gap-1.5"><Printer size={14}/> Print / Save PDF</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
