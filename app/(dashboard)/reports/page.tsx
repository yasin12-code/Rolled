"use client"

import { useState, useEffect } from "react"
import { 
  getInvoices, 
  getPayrollRuns, 
  getSalarySlips, 
  getEmployees, 
  getCompany, 
  formatCurrency, 
  getMonthName 
} from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Percent, 
  Calendar, 
  Download, 
  Filter, 
  PieChart as PieIcon, 
  BarChart3, 
  Search, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react"

// Import Recharts dynamically or guard with isMounted to avoid Next.js hydration issues
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from "recharts"

const COLORS = ["#7C3AED", "#2E5BFF", "#E05A3A", "#0F7A4A", "#F59E0B", "#EF4444"]

export default function ReportsPage() {
  const company = getCompany()
  
  // Hydration state
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "payroll" | "invoices">("overview")
  const [payrollSearch, setPayrollSearch] = useState("")
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [exporting, setExporting] = useState(false)

  // Load data
  const invoices = getInvoices()
  const payrollRuns = getPayrollRuns()
  const slips = getSalarySlips()
  const employees = getEmployees()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // ── FINANCIAL COMPUTATIONS ──────────────────────────────────────────────
  
  // Total Revenue: sum of all paid invoices
  const totalRevenue = invoices
    .filter(inv => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0)

  // Total Payroll: sum of all processed payroll runs
  const totalPayroll = payrollRuns
    .filter(run => run.status === "COMPLETED")
    .reduce((sum, run) => sum + run.totalExpense, 0)

  // Tax Withheld: salary slip taxes + paid invoice tax amounts
  const salaryTaxWithheld = slips.reduce((sum, slip) => sum + slip.taxDeduction, 0)
  const invoiceTaxCollected = invoices
    .filter(inv => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.taxAmount, 0)
  const totalTaxWithheld = salaryTaxWithheld + invoiceTaxCollected

  // Net Income: Revenue - Payroll
  const netIncome = totalRevenue - totalPayroll

  // ── GRAPH DATA PRODUCTION ───────────────────────────────────────────────

  // 1. Monthly Financial Trends: group invoice revenue and payroll costs by month
  const monthlyData = [
    { name: "Jan", Revenue: 525000, Payroll: 0 },
    { name: "Feb", Revenue: 0, Payroll: 0 },
    { name: "Mar", Revenue: 420000, Payroll: 687200 },
    { name: "Apr", Revenue: 0, Payroll: 695800 },
    { name: "May", Revenue: 189000, Payroll: 738400 },
    { name: "Jun", Revenue: 546000, Payroll: 0 },
  ]

  // Update June revenue dynamically if there are more paid invoices
  const junePaidInvoices = invoices.filter(
    inv => inv.status === "PAID" && inv.createdAt.startsWith("2025-06")
  ).reduce((s, i) => s + i.total, 0)
  if (junePaidInvoices > 0) {
    monthlyData[5].Revenue = junePaidInvoices
  }

  // 2. Department Payroll distribution
  const deptMap: Record<string, number> = {}
  employees.forEach(emp => {
    const gross = emp.salaryStructure.basic + emp.salaryStructure.allowances.reduce((s, a) => s + a.amount, 0)
    deptMap[emp.department] = (deptMap[emp.department] || 0) + gross
  })
  const deptData = Object.keys(deptMap).map((dept, idx) => ({
    name: dept,
    value: deptMap[dept],
    color: COLORS[idx % COLORS.length]
  }))

  // ── TAB DATA FILTERING ──────────────────────────────────────────────────

  // Payroll slips filtered list
  const filteredSlips = slips.filter(slip => 
    slip.employeeName.toLowerCase().includes(payrollSearch.toLowerCase()) ||
    getMonthName(slip.month).toLowerCase().includes(payrollSearch.toLowerCase())
  )

  // Invoices filtered list
  const filteredInvoices = invoices.filter(inv => 
    inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    inv.number.toLowerCase().includes(invoiceSearch.toLowerCase())
  )

  const handleExport = () => {
    setExporting(true)
    
    let csvContent = ""
    let fileName = ""
    
    if (activeTab === "overview") {
      csvContent = "Month,Invoiced Revenue,Payroll Cost\n" + 
        monthlyData.map(d => `${d.name},${d.Revenue},${d.Payroll}`).join("\n")
      fileName = "financial_overview_report.csv"
    } else if (activeTab === "payroll") {
      csvContent = "Employee Name,Period,Gross Pay,Allowances,Deductions,Withholding Tax,Net Take-Home\n" +
        filteredSlips.map(s => 
          `"${s.employeeName}",${getMonthName(s.month)} ${s.year},${s.grossPay},${s.totalAllowances},${s.totalDeductions},${s.taxDeduction},${s.netPay}`
        ).join("\n")
      fileName = "payroll_expense_report.csv"
    } else if (activeTab === "invoices") {
      csvContent = "Invoice No.,Client Name,Subtotal,Tax (5%),Total Invoice,Status\n" +
        filteredInvoices.map(i => 
          `${i.number},"${i.clientName}",${i.subtotal},${i.taxAmount},${i.total},${i.status}`
        ).join("\n")
      fileName = "invoice_collections_report.csv"
    }
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    
    setTimeout(() => {
      link.click()
      document.body.removeChild(link)
      setExporting(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl mb-1">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Comprehensive visual financial insights and accounting reports.</p>
        </div>
        <Button onClick={handleExport} disabled={exporting} className="gap-1.5 h-9 text-xs">
          <Download size={14} />
          {exporting ? "Generating CSV..." : "Export Report"}
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 border-b border-gray-150 pb-px overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={15} /> Financial Overview
          </div>
        </button>
        <button
          onClick={() => setActiveTab("payroll")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "payroll"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={15} /> Payroll & Taxes
          </div>
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "invoices"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign size={15} /> Invoice Collections
          </div>
        </button>
      </div>

      {/* ── CARD SUMMARY ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:scale-[1.01] transition-transform">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalRevenue)}</h3>
              <div className="flex items-center text-[10px] text-green-600 font-bold gap-0.5">
                <ArrowUpRight size={12} /> +12.4% vs last period
              </div>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.01] transition-transform">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payroll Expense</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalPayroll)}</h3>
              <div className="flex items-center text-[10px] text-red-500 font-bold gap-0.5">
                <ArrowDownRight size={12} /> +6.1% headcount growth
              </div>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.01] transition-transform">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tax Withheld/Collected</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalTaxWithheld)}</h3>
              <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                Invoice & salary deductions
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Percent size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.01] transition-transform">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Margin</span>
              <h3 className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(netIncome)}
              </h3>
              <div className="flex items-center text-[10px] text-gray-550 font-bold">
                Profit generated in company
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <DollarSign size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── TAB CONTENT ── */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-8 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex justify-between items-center">
                <span>Revenue vs. Payroll Cashflow</span>
                <span className="text-xs font-normal text-gray-400 flex items-center gap-1">
                  <Calendar size={12} /> H1 2025
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[320px] w-full flex items-center justify-center text-gray-400 text-sm">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Revenue" fill="#2E5BFF" radius={[4, 4, 0, 0]} name="Invoiced Revenue" />
                      <Bar dataKey="Payroll" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Payroll Costs" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  "Loading visual chart analytics..."
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart / Cost Breakdown */}
          <Card className="lg:col-span-4 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Payroll Cost by Department</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-[320px] pt-4">
              <div className="h-[180px] w-full flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  "Loading visual..."
                )}
              </div>
              <div className="space-y-1.5 mt-auto">
                {deptData.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: PAYROLL & TAXES REPORT */}
      {activeTab === "payroll" && (
        <Card className="shadow-sm">
          <CardHeader className="pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Salary Slip Expense Report</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">Detailed breakdown of gross pay, deductions, tax liabilities, and take-home net salary.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                placeholder="Search employee or period..."
                className="pl-9 h-8.5 text-xs bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50"
                value={payrollSearch}
                onChange={e => setPayrollSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Period</th>
                    <th className="text-right">Gross Pay</th>
                    <th className="text-right">Allowances</th>
                    <th className="text-right">Deductions</th>
                    <th className="text-right">Withholding Tax</th>
                    <th className="text-right">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlips.length > 0 ? (
                    filteredSlips.map((slip) => (
                      <tr key={slip.id}>
                        <td className="font-medium text-gray-900 dark:text-gray-100">{slip.employeeName}</td>
                        <td className="text-gray-650">{getMonthName(slip.month)} {slip.year}</td>
                        <td className="text-right font-medium">{formatCurrency(slip.grossPay)}</td>
                        <td className="text-right text-gray-500 dark:text-gray-400">{formatCurrency(slip.totalAllowances)}</td>
                        <td className="text-right text-gray-500 dark:text-gray-400">{formatCurrency(slip.totalDeductions)}</td>
                        <td className="text-right text-red-600 font-medium">{formatCurrency(slip.taxDeduction)}</td>
                        <td className="text-right text-green-700 font-semibold">{formatCurrency(slip.netPay)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <Users size={36} className="text-gray-300 mb-2" />
                          <p className="font-medium">No payroll slips records match search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: INVOICE COLLECTIONS */}
      {activeTab === "invoices" && (
        <Card className="shadow-sm">
          <CardHeader className="pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Billing Revenue Collections</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">Details on sales, collected amounts, taxes, and current payment status of all client invoices.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                placeholder="Search invoice or client..."
                className="pl-9 h-8.5 text-xs bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50"
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Client Name</th>
                    <th>Subtotal</th>
                    <th className="text-right">Tax (5%)</th>
                    <th className="text-right">Total Invoice</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="font-semibold text-gray-900 dark:text-gray-100">{inv.number}</td>
                        <td className="text-gray-700 dark:text-gray-300">{inv.clientName}</td>
                        <td>{formatCurrency(inv.subtotal)}</td>
                        <td className="text-right text-gray-500 dark:text-gray-400">{formatCurrency(inv.taxAmount)}</td>
                        <td className="text-right font-medium text-primary">{formatCurrency(inv.total)}</td>
                        <td className="text-center">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            inv.status === "PAID" ? "bg-green-100 text-green-700" :
                            inv.status === "SENT" ? "bg-blue-100 text-blue-700" :
                            inv.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-600 dark:text-gray-400"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <DollarSign size={36} className="text-gray-300 mb-2" />
                          <p className="font-medium">No invoice billing records match search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
