"use client"

import { useState, useEffect } from "react"
import { getClients, formatCurrency, formatDate, saveClients } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreHorizontal, Building2, Mail, Phone, MapPin, X, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import type { Client } from "@/lib/data"

export default function ClientsPage() {
  const [clientsList, setClientsList] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  
  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  // Load clients on hydration
  useEffect(() => {
    setClientsList(getClients())
  }, [])

  const filteredClients = clientsList.filter(cli => 
    cli.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cli.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddModal = () => {
    setFormData({ name: "", email: "", phone: "", address: "" })
    setEditingClient(null)
    setIsModalOpen(true)
  }

  const openEditModal = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone === "-" ? "" : client.phone,
      address: client.address === "-" ? "" : client.address
    })
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    let updatedList: Client[] = []
    if (editingClient) {
      // Edit existing client
      updatedList = clientsList.map(c => 
        c.id === editingClient.id 
          ? { 
              ...c, 
              name: formData.name,
              email: formData.email,
              phone: formData.phone || "-",
              address: formData.address || "-"
            } 
          : c
      )
    } else {
      // Add new client
      const newClient: Client = {
        id: `cli_${Math.floor(Math.random() * 9000 + 1000)}`,
        companyId: "comp_001",
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "-",
        address: formData.address || "-",
        invoiceCount: 0,
        totalBilled: 0,
        createdAt: new Date().toISOString().split("T")[0]
      }
      updatedList = [...clientsList, newClient]
    }

    setClientsList(updatedList)
    saveClients(updatedList)
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const confirmDeleteClient = () => {
    if (!clientToDelete) return
    const updatedList = clientsList.filter(c => c.id !== clientToDelete)
    setClientsList(updatedList)
    saveClients(updatedList)
    setClientToDelete(null)
  }

  const getClientInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getShortAddress = (address: string) => {
    if (address === "-") return "-"
    return address.split(',')[0]
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl mb-1">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your client directory and billing history.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} />
          Add Client
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search clients..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Added</th>
                  <th className="text-right">Invoices</th>
                  <th className="text-right">Total Billed</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-medium select-none">
                            {getClientInitials(client.name)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100 ">{client.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {getShortAddress(client.address)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-gray-900 dark:text-gray-100 text-sm flex items-center gap-1.5 mb-0.5">
                          <Mail size={12} className="text-gray-400" /> {client.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" /> {client.phone}
                        </div>
                      </td>
                      <td>
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center justify-center min-w-6 px-2 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium">
                          {client.invoiceCount}
                        </div>
                      </td>
                      <td className="text-right">
                        {formatCurrency(client.totalBilled)}
                      </td>
                      <td className="text-right">
                        <div className="relative inline-block text-left">
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                          >
                            <MoreHorizontal size={16} />
                          </Button>
                          {openMenuId === client.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 py-1.5 animate-fade-in text-left">
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    setViewingClient(client)
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-[#1a1a24] transition-colors"
                                >
                                  <Eye size={14} className="text-gray-400" /> View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    openEditModal(client)
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-[#1a1a24] transition-colors"
                                >
                                  <Pencil size={14} className="text-gray-400" /> Edit Client
                                </button>
                                <Link
                                  href={`/invoices/create?clientId=${client.id}`}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-[#1a1a24] transition-colors"
                                >
                                  <Plus size={14} className="text-gray-400" /> Create Invoice
                                </Link>
                                <div className="border-t my-1 border-gray-100 dark:border-gray-800" />
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    setClientToDelete(client.id)
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={14} className="text-red-400" /> Delete Client
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
                        <Building2 size={48} className="text-gray-300 mb-4" />
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No clients found</p>
                        <p className="text-sm">We couldn't find any clients matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingClient(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
            <button
              onClick={() => setViewingClient(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-semibold select-none">
                  {getClientInitials(viewingClient.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{viewingClient.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Client Profile</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Email Address</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 select-all">
                  <Mail size={14} className="text-gray-400" /> {viewingClient.email}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Phone Number</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 select-all">
                  <Phone size={14} className="text-gray-400" /> {viewingClient.phone}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Billing Address</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 select-all">
                  <MapPin size={14} className="text-gray-400" /> {viewingClient.address}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Billed</div>
                  <div className="text-sm font-semibold text-primary">{formatCurrency(viewingClient.totalBilled)}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Invoices</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{viewingClient.invoiceCount}</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Date Added</span>
                <span>{formatDate(viewingClient.createdAt)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setViewingClient(null)}>Close</Button>
              <Button onClick={() => { setViewingClient(null); openEditModal(viewingClient); }}>Edit Profile</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSaveClient} className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{editingClient ? "Edit Client Profile" : "Add New Client"}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {editingClient ? "Modify the client's information below." : "Enter the details of the new client."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Client / Company Name</label>
                <Input
                  required
                  placeholder="e.g., Acme Corporation"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-50 dark:bg-[#1a1a24] border-gray-200 dark:border-white/10 focus:bg-white dark:bg-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g., billing@acme.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-50 dark:bg-[#1a1a24] border-gray-200 dark:border-white/10 focus:bg-white dark:bg-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                <Input
                  placeholder="e.g., +92 300 1234567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-gray-50 dark:bg-[#1a1a24] border-gray-200 dark:border-white/10 focus:bg-white dark:bg-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Billing Address</label>
                <Input
                  placeholder="e.g., 15 Main Boulevard, Lahore"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="bg-gray-50 dark:bg-[#1a1a24] border-gray-200 dark:border-white/10 focus:bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingClient ? "Save Changes" : "Add Client"}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setClientToDelete(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <button
              onClick={() => setClientToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Client?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this client? This action cannot be undone, and this client's profile will be removed from your directory.
              </p>
            </div>

            <div className="mt-6 flex justify-stretch gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setClientToDelete(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={confirmDeleteClient}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
