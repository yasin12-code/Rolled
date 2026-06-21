"use client"

import { useEffect, useState } from "react"
import { getInvoiceByToken, getCompany, getTemplates, getClients, formatCurrency } from "@/lib/data"
import type { Invoice, Company, InvoiceTemplate, Client } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { useParams } from "next/navigation"

export default function SharedInvoicePage() {
  const params = useParams()
  const token = params.token as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const inv = getInvoiceByToken(token)
    if (inv) {
      setInvoice(inv)
      setCompany(getCompany())
      
      const templates = getTemplates()
      setTemplate(templates.find(t => t.id === inv.templateId) || templates[0])
      
      const clients = getClients()
      setClient(clients.find(c => c.id === inv.clientId) || null)
    }
    setMounted(true)
  }, [token])

  if (!mounted) return null

  if (!invoice || !company || !template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Invoice Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            The invoice you are looking for does not exist or the link has expired.
          </p>
        </Card>
      </div>
    )
  }

  const { primaryColor, accentColor, logo } = template
  
  // Choose font family based on template settings
  let fontCSS = "sans-serif"
  if (template.font === "DM Sans") fontCSS = "var(--font-dm-sans), sans-serif"
  else if (template.font === "Inter") fontCSS = "Inter, sans-serif"
  else if (template.font === "Georgia") fontCSS = "Georgia, serif"
  else if (template.font === "Playfair Display") fontCSS = "'Playfair Display', serif"

  return (
    <div className="min-h-screen bg-gray-100/50 dark:bg-[#0a0a0a] py-8 sm:py-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invoice {invoice.number}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From {company.name}</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Print / Save PDF
          </button>
        </div>

        {/* The Paper Document */}
        <div 
          style={{ fontFamily: fontCSS }}
          className="bg-white text-gray-800 p-8 sm:p-12 shadow-lg rounded-xl min-h-[800px] print:shadow-none print:p-0"
        >
          {/* We use a Minimalist layout for the shared view fallback */}
          <div className="space-y-8">
            <div className="flex justify-between items-start border-b pb-6" style={{ borderColor: accentColor }}>
              <div>
                {logo && (
                  <div className="mb-3 max-h-16 flex items-center">
                    <img src={logo} alt="Company Logo" className="max-h-16 w-auto object-contain" />
                  </div>
                )}
                <h2 className="text-3xl font-extrabold" style={{ color: primaryColor }}>{company.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{company.address}</p>
                <p className="text-xs text-gray-400 mt-0.5">{company.phone} • {company.email}</p>
              </div>
              <div className="text-right">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    backgroundColor: invoice.status === 'PAID' ? '#dcfce7' : `${accentColor}15`, 
                    color: invoice.status === 'PAID' ? '#166534' : accentColor 
                  }}
                >
                  {invoice.status}
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-4">{invoice.number}</p>
                <p className="text-xs text-gray-500 mt-1">Issue Date: {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="text-xs text-gray-500 mt-0.5">Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Billed To</span>
                <h4 className="font-bold text-gray-900 mt-1">{invoice.clientName}</h4>
                <p className="text-gray-500 mt-0.5">{client?.address || "Address not provided"}</p>
                <p className="text-gray-500 text-xs mt-0.5">{client?.email}</p>
              </div>
            </div>

            <table className="w-full text-sm mt-8 border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: primaryColor }}>
                  <th className="text-left py-2 font-bold text-gray-400">Item Description</th>
                  <th className="text-right py-2 font-bold text-gray-400">Qty</th>
                  <th className="text-right py-2 font-bold text-gray-400">Rate</th>
                  <th className="text-right py-2 font-bold text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 font-semibold text-gray-800">{item.description}</td>
                    <td className="text-right py-3 text-gray-600">{item.quantity}</td>
                    <td className="text-right py-3 text-gray-600">{formatCurrency(item.rate)}</td>
                    <td className="text-right py-3 font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between pt-6 border-t border-gray-100">
              <div className="w-1/2">
                {invoice.notes && (
                  <>
                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</h5>
                    <p className="text-sm text-gray-600 italic">{invoice.notes}</p>
                  </>
                )}
              </div>
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-bold text-base" style={{ color: primaryColor, borderColor: accentColor }}>
                  <span>Total Due</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
