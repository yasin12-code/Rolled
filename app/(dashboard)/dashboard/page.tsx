"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats, formatCurrency } from "@/lib/data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ArrowUpRight, Clock, FileText, Users, CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = getDashboardStats()

  return (
 <div className="space-y-8 animate-fade-in">
 <div>
 <h1 className="font-bold text-2xl mb-2">Welcome back</h1>
 <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your finances today.</p>
 </div>

 {/* Metrics Row */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Card className="card-hover">
 <CardContent className="p-6">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Invoiced</p>
 <h3 className="text-2xl font-bold">{formatCurrency(stats.totalInvoiced)}</h3>
 </div>
 <div className="p-3 bg-primary/10 rounded-lg text-primary">
 <FileText size={20} />
 </div>
 </div>
 <div className="mt-4 flex items-center text-sm">
 <span className="text-green-500 flex items-center"><ArrowUpRight size={16} className="mr-1"/> +12.5%</span>
 <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
 </div>
 </CardContent>
 </Card>

 <Card className="glass-card card-hover">
 <CardContent className="p-6">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Collected</p>
 <h3 className="text-2xl font-bold">{formatCurrency(stats.totalCollected)}</h3>
 </div>
 <div className="p-3 bg-green-500/10 rounded-lg text-green-600">
 <CheckCircle2 size={20} />
 </div>
 </div>
 <div className="mt-4 flex items-center text-sm">
 <span className="text-green-500 flex items-center"><ArrowUpRight size={16} className="mr-1"/> +8.2%</span>
 <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
 </div>
 </CardContent>
 </Card>

 <Card className="card-hover">
 <CardContent className="p-6">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Outstanding</p>
 <h3 className="text-2xl font-bold">{formatCurrency(stats.outstanding)}</h3>
 </div>
 <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600">
 <Clock size={20} />
 </div>
 </div>
 <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
 {stats.overdueCount} overdue invoices
 </div>
 </CardContent>
 </Card>

 <Card className="card-hover">
 <CardContent className="p-6">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Employees</p>
 <h3 className="text-2xl font-bold">{stats.activeEmployees}</h3>
 </div>
 <div className="p-3 bg-primary/10 rounded-lg text-primary">
 <Users size={20} />
 </div>
 </div>
 <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
 Total headcount: {stats.totalHeadcount}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {mounted && (
 <Card className="glass-card">
 <CardHeader className=" pb-4">
 <CardTitle className="text-lg text-white">Revenue vs Payroll Expense</CardTitle>
 <CardDescription className="text-gray-400">Last 6 months comparison</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="h-[300px] w-full">
 <ResponsiveContainer width="100%" height="100%" minWidth={0}>
 <BarChart data={stats.revenueByMonth} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}}
 tickFormatter={(value) => `${value / 1000}k`}
 />
 <Tooltip cursor={{fill: '#f3f4f6'}}
 contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
 formatter={(value) => [formatCurrency(Number(value ?? 0)), '']}
 />
 <Bar dataKey="revenue" name="Revenue" fill="#2E5BFF" radius={[4, 4, 0, 0]} maxBarSize={40} />
 <Bar dataKey="payroll" name="Payroll" fill="#E05A3A" radius={[4, 4, 0, 0]} maxBarSize={40} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 )}

 {mounted && (
 <Card className="glass-card">
 <CardHeader className=" pb-4">
 <CardTitle className="text-lg text-white">Payroll Cost Trend</CardTitle>
 <CardDescription className="text-gray-400">Monthly expense track</CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <div className="h-[300px] w-full">
 <ResponsiveContainer width="100%" height="100%" minWidth={0}>
 <LineChart data={stats.revenueByMonth} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}}
 tickFormatter={(value) => `${value / 1000}k`}
 />
 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
 formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Cost']}
 />
 <Line type="monotone" dataKey="payroll" stroke="#7C3AED" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 )}
 </div>

 </div>
 )
}
