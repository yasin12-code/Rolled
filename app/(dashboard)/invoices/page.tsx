"use client"

import { useState, useEffect } from "react"
import { getInvoices, formatCurrency, formatDate, getClients } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileText, Filter, Send, X, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import QRCode from "react-qr-code"
import { createPortal } from "react-dom"
import type { Invoice } from "@/lib/data"

export default function InvoicesPage() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [mounted, setMounted] = useState(false)

  // Email sending state
  const [sendingInvoice, setSendingInvoice] = useState<Invoice | null>(null)
  const [emailInput, setEmailInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sentId, setSentId] = useState<string | null>(null)

  useEffect(() => {
    setAllInvoices(getInvoices())
    setClients(getClients())
    setMounted(true)
  }, [])

  const filteredInvoices = allInvoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || inv.number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openSendModal = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId)
    setEmailInput(client?.email || "")
    setSendingInvoice(inv)
    setSentId(null)
  }

  const handleSendInvoice = async () => {
    if (!sendingInvoice || !emailInput) return
    setIsSending(true)
    try {
      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice: sendingInvoice, recipientEmail: emailInput })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSentId(data.id)
    } catch (err: any) {
      alert("Failed to send: " + err.message)
    } finally {
      setIsSending(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl mb-1">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your billing and collections.</p>
        </div>
        <Link href="/invoices/create">
          <Button className="w-full sm:w-auto">
            <Plus size={16} />
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search invoices..." className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <Button variant={statusFilter === "ALL" ? "secondary" : "ghost"} onClick={() => setStatusFilter("ALL")}
                className="text-xs px-3 h-8"
              >
                All
              </Button>
              <Button variant={statusFilter === "DRAFT" ? "secondary" : "ghost"} onClick={() => setStatusFilter("DRAFT")}
                className="text-xs px-3 h-8 text-gray-500 dark:text-gray-400"
              >
                Draft
              </Button>
              <Button variant={statusFilter === "SENT" ? "secondary" : "ghost"} onClick={() => setStatusFilter("SENT")}
                className="text-xs px-3 h-8 text-blue-600 "
              >
                Sent
              </Button>
              <Button variant={statusFilter === "PAID" ? "secondary" : "ghost"} onClick={() => setStatusFilter("PAID")}
                className="text-xs px-3 h-8 text-green-600 "
              >
                Paid
              </Button>
              <Button variant={statusFilter === "OVERDUE" ? "secondary" : "ghost"} onClick={() => setStatusFilter("OVERDUE")}
                className="text-xs px-3 h-8 text-red-600 "
              >
                Overdue
              </Button>
              <Button variant="ghost" className="h-8 w-8 p-0 border border-dashed ">
                <Filter size={14} />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        {inv.number}
                      </td>
                      <td>
                        {inv.clientName}
                      </td>
                      <td>
                        {formatCurrency(inv.total)}
                      </td>
                      <td>
                        {formatDate(inv.createdAt)}
                      </td>
                      <td>
                        <Badge variant={inv.status.toLowerCase() as any}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            className="h-8 px-3 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => openSendModal(inv)}
                          >
                            <Send size={13} />
                            Send
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
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No invoices found</p>
                        <p className="text-sm">We couldn't find any invoices matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Send Invoice Modal */}
      {sendingInvoice && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSendingInvoice(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-y-auto hide-scrollbar">
            <button
              onClick={() => setSendingInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>

            {sentId ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Invoice Sent!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <strong>{sendingInvoice.number}</strong> has been emailed to <strong>{emailInput}</strong>.
                </p>
                <Button onClick={() => setSendingInvoice(null)} className="w-full">Done</Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Send size={18} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Send Invoice</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
                    Email <strong>{sendingInvoice.number}</strong> to your client.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Invoice</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{sendingInvoice.number}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                    <span className="font-semibold text-primary">{formatCurrency(sendingInvoice.total)}</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recipient Email</label>
                    <Input
                      type="email"
                      placeholder="client@company.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="bg-gray-50 dark:bg-[#1a1a24] border-gray-200 dark:border-white/10 focus:bg-white dark:bg-gray-900"
                    />
                  </div>
                  <Button
                    onClick={handleSendInvoice}
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
                        Send Invoice
                      </>
                    )}
                  </Button>

                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col items-center">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Scan to view and pay</h4>
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                        <QRCode value={typeof window !== 'undefined' ? `${window.location.origin}/share/${sendingInvoice.sharedToken}` : `https://rolled-three.vercel.app/share/${sendingInvoice.sharedToken}`} size={120} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center max-w-[250px]">
                        Point your camera at the QR code to instantly open this invoice on your mobile device.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
