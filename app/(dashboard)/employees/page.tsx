"use client"

import { useState, useEffect } from "react"
import { getEmployees, getDepartments, saveEmployees, formatCurrency } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreHorizontal, User, Filter, Building, Mail, Phone, X, Pencil, Trash2, Banknote } from "lucide-react"
import { CustomSelect } from "@/components/ui/custom-select"
import type { Employee } from "@/lib/data"

export default function EmployeesPage() {
  const [employeesList, setEmployeesList] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [deptFilter, setDeptFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Modals visibility state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  const [formTab, setFormTab] = useState<'general' | 'salary' | 'bank'>('general')

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "",
    employeeId: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "Active" as 'Active' | 'On Leave' | 'Terminated',
    basicSalary: 50000,
    allowances: [
      { label: "House Rent", amount: 15000 },
      { label: "Medical", amount: 5000 }
    ] as { label: string; amount: number }[],
    deductions: [
      { label: "EOBI", amount: 1600 }
    ] as { label: string; amount: number }[],
    bankName: "",
    accountNumber: "",
    iban: ""
  })

  // Load employees from localStorage on hydration
  useEffect(() => {
    setEmployeesList(getEmployees())
  }, [])

  // Departments list recalculates based on active employees list
  const departments = getDepartments()

  const filteredEmployees = employeesList.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = deptFilter === "ALL" || emp.department === deptFilter
    return matchesSearch && matchesDept
  })

  // ── FORM FIELD HANDLERS ──────────────────────────────────────────────────

  const openAddModal = () => {
    // Determine next employee ID prefix
    const nextIdNum = employeesList.length + 1
    const nextId = `VTX-${nextIdNum.toString().padStart(3, '0')}`

    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "Engineering",
      designation: "",
      employeeId: nextId,
      joinDate: new Date().toISOString().split("T")[0],
      status: "Active",
      basicSalary: 60000,
      allowances: [
        { label: "House Rent", amount: 15000 },
        { label: "Medical", amount: 5000 }
      ],
      deductions: [
        { label: "EOBI", amount: 1600 }
      ],
      bankName: "HBL",
      accountNumber: "",
      iban: ""
    })
    setEditingEmployee(null)
    setFormTab("general")
    setIsEmployeeModalOpen(true)
  }

  const openEditModal = (emp: Employee) => {
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      employeeId: emp.employeeId,
      joinDate: emp.joinDate,
      status: emp.status,
      basicSalary: emp.salaryStructure.basic,
      allowances: [...emp.salaryStructure.allowances],
      deductions: [...emp.salaryStructure.deductions],
      bankName: emp.bankDetails.bankName,
      accountNumber: emp.bankDetails.accountNumber,
      iban: emp.bankDetails.iban
    })
    setEditingEmployee(emp)
    setFormTab("general")
    setIsEmployeeModalOpen(true)
  }

  const handleAddAllowance = () => {
    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { label: "", amount: 0 }]
    }))
  }

  const handleRemoveAllowance = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== idx)
    }))
  }

  const handleUpdateAllowance = (idx: number, field: 'label' | 'amount', val: string | number) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.map((a, i) => i === idx ? { ...a, [field]: val } : a)
    }))
  }

  const handleAddDeduction = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { label: "", amount: 0 }]
    }))
  }

  const handleRemoveDeduction = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== idx)
    }))
  }

  const handleUpdateDeduction = (idx: number, field: 'label' | 'amount', val: string | number) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.map((d, i) => i === idx ? { ...d, [field]: val } : d)
    }))
  }

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.employeeId) return

    let updatedList: Employee[] = []
    
    const salaryStructure = {
      basic: Number(formData.basicSalary),
      allowances: formData.allowances.map(a => ({ label: a.label, amount: Number(a.amount) })),
      deductions: formData.deductions.map(d => ({ label: d.label, amount: Number(d.amount) }))
    }

    const bankDetails = {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      iban: formData.iban
    }

    if (editingEmployee) {
      // Editing mode
      updatedList = employeesList.map(emp => 
        emp.id === editingEmployee.id
          ? {
              ...emp,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              department: formData.department,
              designation: formData.designation,
              employeeId: formData.employeeId,
              joinDate: formData.joinDate,
              status: formData.status,
              salaryStructure,
              bankDetails
            }
          : emp
      )
    } else {
      // Adding new mode
      const newEmployee: Employee = {
        id: `emp_${Math.floor(Math.random() * 9000 + 1000)}`,
        companyId: "comp_001",
        avatar: "",
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "-",
        department: formData.department,
        designation: formData.designation || "Staff Member",
        employeeId: formData.employeeId,
        joinDate: formData.joinDate,
        status: formData.status,
        salaryStructure,
        bankDetails
      }
      updatedList = [...employeesList, newEmployee]
    }

    setEmployeesList(updatedList)
    saveEmployees(updatedList)
    setIsEmployeeModalOpen(false)
    setEditingEmployee(null)
  }

  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return
    const updatedList = employeesList.filter(e => e.id !== employeeToDelete)
    setEmployeesList(updatedList)
    saveEmployees(updatedList)
    setEmployeeToDelete(null)
  }

  // ── DEPT HEADCOUNTS CALCULATIONS ─────────────────────────────────────────
  const deptStats = departments.map(d => {
    const matching = employeesList.filter(e => e.department === d)
    const headcount = matching.length
    const activeCount = matching.filter(e => e.status === "Active").length
    const totalPayroll = matching.reduce((sum, e) => {
      const gross = e.salaryStructure.basic + e.salaryStructure.allowances.reduce((s, a) => s + a.amount, 0)
      return sum + (e.status === "Active" ? gross : 0)
    }, 0)
    return { name: d, headcount, activeCount, totalPayroll }
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl mb-1">Employees</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your team profiles, department roles, and salary structures.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsDeptModalOpen(true)}>
            <Building size={16} className="mr-1.5 text-gray-500 dark:text-gray-400" />
            Departments
          </Button>
          <Button className="w-full sm:w-auto" onClick={openAddModal}>
            <Plus size={16} />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          
          {/* Controls Bar */}
          <div className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pb-2 sm:pb-0">
              <CustomSelect 
                className="min-w-[160px]"
                value={deptFilter}
                onChange={setDeptFilter}
                options={[
                  { value: 'ALL', label: 'All Departments' },
                  ...departments.map(d => ({ value: d, label: d }))
                ]}
              />
              <div className="flex items-center rounded-md overflow-hidden shrink-0 border border-gray-150 bg-gray-50 dark:bg-[#1a1a24]/50 dark:bg-gray-800/50">
                <button 
                  className={`p-2 hover:bg-gray-100 transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button 
                  className={`p-2 hover:bg-gray-100 transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEmployees.map(emp => (
                <Card key={emp.id} className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group relative">
                  <div className="h-14 bg-gradient-to-r from-primary/80 to-blue-600/80"></div>
                  
                  {/* Card Dropdown Menu Action */}
                  <div className="absolute top-2 right-2 z-10">
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white dark:bg-gray-900/20 bg-black/10 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === emp.id ? null : emp.id)
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </Button>
                    {openMenuId === emp.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} />
                        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 py-1 text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                              openEditModal(emp)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-[#1a1a24] transition-colors"
                          >
                            <Pencil size={12} className="text-gray-400" /> Edit Profile
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(null)
                              setEmployeeToDelete(emp.id)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={12} className="text-red-400" /> Delete Team
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <CardContent className="p-5 pt-4 relative" onClick={() => openEditModal(emp)}>
                    <div className="absolute top-4 right-4">
                      <Badge variant={emp.status === 'Active' ? 'paid' : emp.status === 'On Leave' ? 'sent' : 'default'} className="px-2 py-0.5 text-[10px]">
                        {emp.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors text-gray-900 dark:text-gray-100">{emp.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emp.designation}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{emp.employeeId}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Building size={13} className="text-gray-400" />
                        {emp.department}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Mail size={13} className="text-gray-400" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            
            /* List View */
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID / Department</th>
                    <th>Contact Info</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 ">{emp.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{emp.designation}</div>
                          </div>
                        </td>
                        <td>
                          <div className="text-gray-900 dark:text-gray-100 font-mono text-sm">{emp.employeeId}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{emp.department}</div>
                        </td>
                        <td>
                          <div className="text-gray-900 dark:text-gray-100 text-sm flex items-center gap-1"><Mail size={11} className="text-gray-400" /> {emp.email}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5"><Phone size={11} className="text-gray-400" /> {emp.phone}</div>
                        </td>
                        <td>
                          {emp.joinDate}
                        </td>
                        <td>
                          <Badge variant={emp.status === 'Active' ? 'paid' : emp.status === 'On Leave' ? 'sent' : 'default'} className="px-2 py-0.5 text-xs">
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <div className="relative inline-block text-left">
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)}
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                            {openMenuId === emp.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 py-1 text-left">
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null)
                                      openEditModal(emp)
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-[#1a1a24] transition-colors"
                                  >
                                    <Pencil size={12} className="text-gray-400" /> Edit Profile
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null)
                                      setEmployeeToDelete(emp.id)
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                  >
                                    <Trash2 size={12} className="text-red-400" /> Delete Profile
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <User size={48} className="text-gray-300 mb-4" />
                          <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No employees found</p>
                          <p className="text-sm">We couldn't find any employees matching your search.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── MODAL: DEPARTMENTS BREAKDOWN ── */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeptModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsDeptModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Building size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Departments Directory</h3>
                <p className="text-[10px] text-gray-400">Headcount allocation and payroll expenses breakdown.</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {deptStats.map((d, i) => {
                const totalHeadcount = employeesList.length || 1
                const pct = Math.round((d.headcount / totalHeadcount) * 100)
                
                return (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-150 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-805 text-xs">{d.name}</h4>
                        <div className="text-[9px] text-gray-400">
                          {d.headcount} Total • {d.activeCount} Active
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-450 block font-semibold">Active Monthly cost</span>
                        <span className="text-xs font-bold text-primary">{formatCurrency(d.totalPayroll)}</span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>Staff Share</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="secondary" className="h-8.5 text-xs" onClick={() => setIsDeptModalOpen(false)}>Close Directory</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT EMPLOYEE ── */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEmployeeModalOpen(false)} />
          <form 
            onSubmit={handleSaveEmployee} 
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-4 animate-fade-in max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsEmployeeModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="mb-3 flex items-center gap-2 border-b border-gray-105 pb-2">
              <div className="w-7.5 h-7.5 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                <User size={14} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{editingEmployee ? "Edit Employee Profile" : "Add New Employee"}</h3>
                <p className="text-[9px] text-gray-400">Specify identity, payroll structure, and bank credentials.</p>
              </div>
            </div>

            {/* Stepped Tab Buttons */}
            <div className="flex border-b border-gray-105 mb-3.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
              <button
                type="button"
                onClick={() => setFormTab("general")}
                className={`pb-1.5 flex-1 border-b-2 text-center transition-colors ${formTab === "general" ? "border-primary text-primary" : "border-transparent hover:text-gray-700 dark:text-gray-300"}`}
              >
                1. General
              </button>
              <button
                type="button"
                onClick={() => setFormTab("salary")}
                className={`pb-1.5 flex-1 border-b-2 text-center transition-colors ${formTab === "salary" ? "border-primary text-primary" : "border-transparent hover:text-gray-700 dark:text-gray-300"}`}
              >
                2. Salary
              </button>
              <button
                type="button"
                onClick={() => setFormTab("bank")}
                className={`pb-1.5 flex-1 border-b-2 text-center transition-colors ${formTab === "bank" ? "border-primary text-primary" : "border-transparent hover:text-gray-700 dark:text-gray-300"}`}
              >
                3. Bank
              </button>
            </div>

            <div className="space-y-3.5">
              
              {/* Section 1: General Info */}
              {formTab === "general" && (
                <div className="space-y-2">
                  <h4 className="font-bold text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={9} /> General Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5 col-span-2">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                      <Input 
                        required
                        placeholder="e.g., Jane Doe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                      <Input 
                        required
                        type="email"
                        placeholder="e.g., jane@company.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee ID</label>
                      <Input 
                        required
                        placeholder="e.g., VTX-009"
                        value={formData.employeeId}
                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs font-mono py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                      <select
                        className="flex h-8 w-full rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a24] px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</label>
                      <Input 
                        required
                        placeholder="e.g., Engineering"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Designation</label>
                      <Input 
                        required
                        placeholder="e.g., Full Stack Engineer"
                        value={formData.designation}
                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                      <Input 
                        placeholder="e.g., +92 300 9876543"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Join Date</label>
                      <Input 
                        type="date"
                        value={formData.joinDate}
                        onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs py-1 px-2.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Salary Structure */}
              {formTab === "salary" && (
                <div className="space-y-2">
                  <h4 className="font-bold text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Banknote size={9} /> Salary Structure (Monthly)
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="space-y-0.5 w-full sm:w-1/2">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basic Salary</label>
                      <Input 
                        type="number"
                        required
                        min={0}
                        placeholder="Basic pay amount"
                        value={formData.basicSalary || ""}
                        onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs font-semibold py-1 px-2.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Allowances List */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase">Allowances</span>
                          <Button type="button" variant="ghost" className="h-5 px-1 text-[9px] text-primary hover:bg-primary/5" onClick={handleAddAllowance}>
                            <Plus size={8} className="mr-0.5" /> Add
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                          {formData.allowances.map((allow, idx) => (
                            <div key={idx} className="flex gap-1 items-center">
                              <Input 
                                placeholder="Label"
                                value={allow.label}
                                onChange={e => handleUpdateAllowance(idx, 'label', e.target.value)}
                                className="h-7 text-[11px] bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 px-1.5 py-0.5"
                              />
                              <Input 
                                type="number"
                                placeholder="Amount"
                                value={allow.amount || ""}
                                onChange={e => handleUpdateAllowance(idx, 'amount', Number(e.target.value))}
                                className="h-7 text-[11px] bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 w-14 px-1 py-0.5"
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 shrink-0"
                                onClick={() => handleRemoveAllowance(idx)}
                              >
                                <X size={10} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deductions List */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase">Deductions</span>
                          <Button type="button" variant="ghost" className="h-5 px-1 text-[9px] text-primary hover:bg-primary/5" onClick={handleAddDeduction}>
                            <Plus size={8} className="mr-0.5" /> Add
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                          {formData.deductions.map((ded, idx) => (
                            <div key={idx} className="flex gap-1 items-center">
                              <Input 
                                placeholder="Label"
                                value={ded.label}
                                onChange={e => handleUpdateDeduction(idx, 'label', e.target.value)}
                                className="h-7 text-[11px] bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 px-1.5 py-0.5"
                              />
                              <Input 
                                type="number"
                                placeholder="Amount"
                                value={ded.amount || ""}
                                onChange={e => handleUpdateDeduction(idx, 'amount', Number(e.target.value))}
                                className="h-7 text-[11px] bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 w-14 px-1 py-0.5"
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 shrink-0"
                                onClick={() => handleRemoveDeduction(idx)}
                              >
                                <X size={10} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Bank Details */}
              {formTab === "bank" && (
                <div className="space-y-2">
                  <h4 className="font-bold text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Building size={9} /> Bank Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bank Name</label>
                      <Input 
                        placeholder="e.g. HBL"
                        value={formData.bankName}
                        onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account No.</label>
                      <Input 
                        placeholder="e.g., 12345678"
                        value={formData.accountNumber}
                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs font-mono py-1 px-2.5"
                      />
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <label className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IBAN</label>
                      <Input 
                        placeholder="e.g., PK36..."
                        value={formData.iban}
                        onChange={e => setFormData({ ...formData, iban: e.target.value })}
                        className="bg-gray-50 dark:bg-[#1a1a24] focus:bg-white dark:bg-gray-900 h-8 text-xs font-mono py-1 px-2.5"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="mt-4.5 flex justify-between gap-3 border-t border-gray-105 pt-2.5">
              <Button type="button" variant="secondary" className="h-8 text-xs px-3" onClick={() => setIsEmployeeModalOpen(false)}>Cancel</Button>
              <div className="flex gap-1.5">
                {formTab !== "general" && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="h-8 text-xs px-3" 
                    onClick={() => setFormTab(formTab === "bank" ? "salary" : "general")}
                  >
                    Back
                  </Button>
                )}
                {formTab !== "bank" ? (
                  <Button 
                    type="button" 
                    className="h-8 text-xs font-semibold px-3.5" 
                    onClick={() => setFormTab(formTab === "general" ? "salary" : "bank")}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="h-8 text-xs px-3.5">
                    {editingEmployee ? "Save Details" : "Add Employee"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEmployeeToDelete(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in text-center">
            <button
              onClick={() => setEmployeeToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Remove Employee?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this employee profile? Their record and custom salary parameters will be permanently deleted.
            </p>

            <div className="mt-6 flex justify-stretch gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setEmployeeToDelete(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={confirmDeleteEmployee}>Delete</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
