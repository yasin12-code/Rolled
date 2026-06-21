"use client"

import { useState, useMemo } from "react"
import { getPayrollRuns, getEmployees, formatCurrency, getMonthName } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import Link from "next/link"
import { Play, RotateCcw, Download, Info, X, CheckCircle2,
  ChevronRight, AlertTriangle, Users, Banknote, Loader2
} from "lucide-react"

// ── Tax calculation (mirrors data.ts logic) ────────────────────────────────
function calcTax(annualGross: number): number {
  if (annualGross > 1200000) return Math.round((annualGross * 0.125) / 12)
  if (annualGross > 600000)  return Math.round((annualGross * 0.025) / 12)
  return 0
}

type RunStatus = 'idle' | 'reviewing' | 'running' | 'done'

export default function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState(getPayrollRuns())
  const allEmployees = getEmployees()
  const activeEmployees = allEmployees.filter(e => e.status === "Active")

  const [selectedMonth, setSelectedMonth] = useState(6)
  const [selectedYear, setSelectedYear]   = useState(2025)
  const [runStatus, setRunStatus]         = useState<RunStatus>('idle')
  const [rollbackId, setRollbackId]       = useState<string | null>(null)

  // ── Per-employee payroll preview ──────────────────────────────────────
  const preview = useMemo(() => activeEmployees.map(emp => {
    const allowances   = emp.salaryStructure.allowances.reduce((s, a) => s + a.amount, 0)
    const deductions   = emp.salaryStructure.deductions.reduce((s, d) => s + d.amount, 0)
    const gross        = emp.salaryStructure.basic + allowances
    const tax          = calcTax(gross * 12)
    const net          = gross - deductions - tax
    return { emp, gross, deductions, tax, net }
  }), [selectedMonth, selectedYear])

  const totals = useMemo(() => ({
    gross:      preview.reduce((s, r) => s + r.gross, 0),
    deductions: preview.reduce((s, r) => s + r.deductions, 0),
    tax:        preview.reduce((s, r) => s + r.tax, 0),
    net:        preview.reduce((s, r) => s + r.net, 0),
  }), [preview])

  // Check if already run for selected period
  const alreadyRun = payrollRuns.some(
    r => r.month === selectedMonth && r.year === selectedYear
  )

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleReviewAndRun = () => setRunStatus('reviewing')

  const handleConfirmRun = async () => {
    setRunStatus('running')
    // Simulate processing delay for UX
    await new Promise(r => setTimeout(r, 1800))

    const newRun = {
      id: `pr_${Date.now()}`,
      companyId: 'comp_001',
      month: selectedMonth,
      year: selectedYear,
      totalExpense: totals.net,
      employeeCount: activeEmployees.length,
      status: 'COMPLETED' as const,
      processedAt: new Date().toISOString().split('T')[0],
      insights: `Payroll for ${getMonthName(selectedMonth)} ${selectedYear} processed successfully. Total net pay: ${formatCurrency(totals.net)} for ${activeEmployees.length} employees.`,
    }
    setPayrollRuns(prev => [newRun, ...prev])
    setRunStatus('done')
  }

  const handleRollback = (id: string) => setRollbackId(id)

  const confirmRollback = () => {
    if (rollbackId) {
      setPayrollRuns(prev => prev.filter(r => r.id !== rollbackId))
      setRollbackId(null)
    }
  }

  const resetModal = () => setRunStatus('idle')

  return (
    <>
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl mb-1">Payroll Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Run monthly payroll and manage history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Run Payroll Card */}
          <Card>
            <CardHeader className=" bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50 ">
              <CardTitle className="text-lg">Run Payroll</CardTitle>
              <CardDescription>Process salaries for active employees</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Month</label>
                    <CustomSelect
                      value={selectedMonth.toString()}
                      onChange={(val) => setSelectedMonth(parseInt(val))}
                      options={[1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({
                        value: m.toString(), label: getMonthName(m)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Year</label>
                    <CustomSelect
                      value={selectedYear.toString()}
                      onChange={(val) => setSelectedYear(parseInt(val))}
                      options={[2024, 2025, 2026].map(y => ({
                        value: y.toString(), label: y.toString()
                      }))}
                    />
                  </div>

                  {alreadyRun ? (
                    <div className="w-full mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                      <AlertTriangle size={15} className="shrink-0" />
                      Payroll already processed for this period.
                    </div>
                  ) : (
                    <Button
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white border-none gap-2"
                      onClick={handleReviewAndRun}
                    >
                      <Play size={15} />
                      Review &amp; Run
                      <ChevronRight size={14} className="ml-auto opacity-70" />
                    </Button>
                  )}
                </div>

                <div className="w-full sm:w-2/3 bg-gray-50 dark:bg-[#1a1a24] rounded-lg p-5 flex flex-col justify-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium uppercase tracking-wider">Projected Summary</div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Active Employees</div>
                      <div className="text-xl font-semibold mt-1">{activeEmployees.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Projected Net Pay</div>
                      <div className="text-xl font-semibold mt-1 text-green-700">{formatCurrency(totals.net)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Gross Pay</div>
                      <div className="text-base font-medium mt-1">{formatCurrency(totals.gross)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Deductions</div>
                      <div className="text-base font-medium mt-1 text-red-600">{formatCurrency(totals.deductions + totals.tax)}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                    <Info size={14} className="shrink-0 text-blue-500 mt-0.5" />
                    <p>Tax deductions are calculated per Pakistan FBR slabs. Click Review &amp; Run to see a full employee breakdown before processing.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll History */}
          <Card>
            <CardHeader className=" bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50 ">
              <CardTitle className="text-lg">Payroll History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Processed Date</th>
                      <th>Employees</th>
                      <th className="text-right">Net Expense</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRuns.sort((a, b) => {
                      if (b.year !== a.year) return b.year - a.year
                      return b.month - a.month
                    }).map((run) => (
                      <tr key={run.id}>
                        <td className="font-medium">{getMonthName(run.month)} {run.year}</td>
                        <td className="text-gray-500 dark:text-gray-400">{run.processedAt}</td>
                        <td>{run.employeeCount}</td>
                        <td className="text-right font-medium">{formatCurrency(run.totalExpense)}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href="/salary-slips">
                              <Button variant="ghost" className="h-8 px-2 text-xs text-blue-600 gap-1">
                                <Download size={13} /> Slips
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleRollback(run.id)}
                              title="Rollback this payroll run"
                            >
                              <RotateCcw size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary-dark/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary font-medium mb-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                AI Insight
              </div>
              <CardTitle className="text-lg">Last Run Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {payrollRuns.sort((a,b) => b.month - a.month)[0]?.insights}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=" bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50 ">
              <CardTitle className="text-lg">Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { label: 'Engineering', pct: 43, color: 'bg-purple-600' },
                  { label: 'Marketing',   pct: 25, color: 'bg-blue-500' },
                  { label: 'Design',      pct: 20, color: 'bg-orange-500' },
                  { label: 'HR',          pct: 12, color: 'bg-green-500' },
                ].map(d => (
                  <div key={d.label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${d.color}`}></div>
                      <span className="text-sm">{d.label}</span>
                    </div>
                    <span className="text-sm font-medium">{d.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-purple-600" style={{width: '43%'}}></div>
                <div className="h-full bg-blue-500"   style={{width: '25%'}}></div>
                <div className="h-full bg-orange-500" style={{width: '20%'}}></div>
                <div className="h-full bg-green-500"  style={{width: '12%'}}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    {/* ── Review Modal ─────────────────────────────────────────────────── */}
    {(runStatus === 'reviewing' || runStatus === 'running' || runStatus === 'done') && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={runStatus === 'reviewing' ? resetModal : undefined} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl my-4 overflow-hidden animate-fade-in">

          {/* ── Done state ── */}
          {runStatus === 'done' ? (
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Payroll Processed!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                <strong>{getMonthName(selectedMonth)} {selectedYear}</strong> payroll has been run successfully.
              </p>
              <p className="text-3xl font-extrabold text-green-700 mb-6">{formatCurrency(totals.net)}</p>
              <div className="flex justify-center gap-3">
                <Button onClick={resetModal} className="px-8">Done</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Review Payroll — {getMonthName(selectedMonth)} {selectedYear}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{activeEmployees.length} active employees</p>
                </div>
                {runStatus === 'reviewing' && (
                  <button onClick={resetModal} className="text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100">
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Totals banner */}
              <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 dark:border-gray-800">
                {[
                  { label: 'Gross Pay',   value: formatCurrency(totals.gross),              color: 'text-gray-900 dark:text-gray-100' },
                  { label: 'Deductions',  value: formatCurrency(totals.deductions),          color: 'text-orange-600' },
                  { label: 'Income Tax',  value: formatCurrency(totals.tax),                 color: 'text-red-600' },
                  { label: 'Net Pay',     value: formatCurrency(totals.net),                 color: 'text-green-700 font-extrabold' },
                ].map(col => (
                  <div key={col.label} className="px-5 py-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{col.label}</p>
                    <p className={`text-base font-semibold ${col.color}`}>{col.value}</p>
                  </div>
                ))}
              </div>

              {/* Per-employee table */}
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-[#1a1a24] border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gross</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deductions</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tax</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preview.map(({ emp, gross, deductions, tax, net }) => (
                      <tr key={emp.id} className="hover:bg-gray-50 dark:bg-[#1a1a24]/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {emp.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</p>
                              <p className="text-xs text-gray-400">{emp.designation} · {emp.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right text-gray-700 dark:text-gray-300">{formatCurrency(gross)}</td>
                        <td className="px-4 py-3.5 text-right text-orange-600">−{formatCurrency(deductions)}</td>
                        <td className="px-4 py-3.5 text-right text-red-600">−{formatCurrency(tax)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-green-700">{formatCurrency(net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Info size={13} className="text-blue-500 shrink-0" />
                  This action will record a payroll run and generate salary slips.
                </p>
                <div className="flex gap-3">
                  {runStatus === 'reviewing' && (
                    <Button variant="secondary" onClick={resetModal}>Cancel</Button>
                  )}
                  <Button
                    onClick={handleConfirmRun}
                    disabled={runStatus === 'running'}
                    className="bg-green-600 hover:bg-green-700 text-white border-none gap-2 min-w-[140px]"
                  >
                    {runStatus === 'running' ? (
                      <><Loader2 size={15} className="animate-spin" /> Processing…</>
                    ) : (
                      <><Play size={15} /> Confirm &amp; Run</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    {/* ── Rollback Confirmation ─────────────────────────────────────────── */}
    {rollbackId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRollbackId(null)} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-center text-gray-900 dark:text-gray-100 mb-2">Rollback Payroll?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            This will remove this payroll run from history. Salary slips generated for this period will also be voided. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setRollbackId(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none" onClick={confirmRollback}>
              Yes, Rollback
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
