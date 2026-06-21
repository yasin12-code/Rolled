"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Palette, Users, Building2, Calculator, Receipt,
 PieChart,
 Settings,
 Menu,
 X
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { ThemeToggle } from "@/components/ThemeToggle"

export function Sidebar() {
 const pathname = usePathname()
 const [isOpen, setIsOpen] = useState(false)
 const { role } = useAuth()
 const activeRole = role || ""

 const getLinksForRole = () => {
  if (!activeRole) return []
  
  const allLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "accountant", "hr_manager"] },
    { name: "Invoices", href: "/invoices", icon: FileText, roles: ["super_admin", "accountant"] },
    { name: "Designer", href: "/designer", icon: Palette, roles: ["super_admin", "accountant"] },
    { name: "Clients", href: "/clients", icon: Building2, roles: ["super_admin", "accountant"] },
    { name: "Employees", href: "/employees", icon: Users, roles: ["super_admin", "hr_manager"] },
    { name: "Payroll", href: "/payroll", icon: Calculator, roles: ["super_admin", "hr_manager"] },
    { name: "My salary slips", href: "/salary-slips", icon: Receipt, roles: ["employee"] },
    { name: "Salary Slips", href: "/salary-slips", icon: Receipt, roles: ["super_admin", "hr_manager"] },
    { name: "My profile", href: "/profile", icon: Users, roles: ["employee"] },
    { name: "Reports", href: "/reports", icon: PieChart, roles: ["super_admin", "accountant", "hr_manager"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["super_admin"] },
  ]

  return allLinks.filter(link => link.roles.includes(activeRole))
 }

 const links = getLinksForRole()

 const toggleSidebar = () => setIsOpen(!isOpen)

 return (
 <>
 {/* Mobile toggle */}
 <button onClick={toggleSidebar}
 className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md"
 >
 {isOpen ? <X size={20} /> : <Menu size={20} />}
 </button>

 {/* Overlay */}
 {isOpen && (
 <div className="md:hidden fixed inset-0 bg-black/50 z-40"
 onClick={() => setIsOpen(false)}
 />
 )}

 {/* Sidebar */}
 <aside className={cn(
 "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 gradient-sidebar text-white flex flex-col shadow-xl",
 isOpen ? "translate-x-0" : "-translate-x-full"
 )}>
 <div className="p-6 pb-2 ">
 <div className="flex items-center gap-3 mb-8 px-2">
 <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
 <rect width="40" height="40" rx="12" fill="white" fillOpacity="0.2"/>
 <path d="M12 28C12 28 16 12 28 12" stroke="white" strokeWidth="4" strokeLinecap="round"/>
 <circle cx="28" cy="28" r="4" fill="white"/>
 <circle cx="12" cy="12" r="4" fill="white"/>
 </svg>
 <span className="text-2xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'var(--font-nunito)' }}>Rolled</span>
 </div>
 <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-4">
 Menu
 </div>
 </div>

 <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
 {links.map((link) => {
 const Icon = link.icon
 const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
 return (
 <Link key={link.name} href={link.href}
 onClick={() => setIsOpen(false)}
 className={cn(
 "sidebar-link",
 isActive && "active"
 )}
 >
 <Icon size={18} className={cn(isActive ? "text-primary-light" : "text-gray-400")} />
 {link.name}
 </Link>
 )
 })}
 </div>

 <div className="p-4 text-xs text-white/60 flex items-center justify-between">
  <div>
   <div className="flex items-center gap-2 mb-2 font-medium">
   <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
   <span className="text-white/90">System Online</span>
   </div>
   <p className="text-white/50">© 2026 Rolled Inc.</p>
  </div>
  <ThemeToggle />
 </div>
 </aside>
 </>
 )
}
