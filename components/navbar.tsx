"use client"

import { getCompany } from "@/lib/data"
import { Bell, Search, User as UserIcon, LogOut, FileText, Users, Calculator, Calendar } from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { getAuditLogs } from "@/lib/data"

export function Navbar() {
 const { user } = useAuth()
 const company = getCompany()
 const router = useRouter()

 // Notification dropdown state
 const [isOpen, setIsOpen] = useState(false)
 const [unreadCount, setUnreadCount] = useState(3)
 const [notifications, setNotifications] = useState<any[]>([])
 const dropdownRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
   // Populate notifications from audit logs
   const logs = getAuditLogs().slice(0, 5).map((log, index) => {
     let iconType = 'general'
     if (log.entityType === 'invoice') iconType = 'invoice'
     else if (log.entityType === 'employee') iconType = 'employee'
     else if (log.entityType === 'payroll') iconType = 'payroll'

     return {
       id: log.id,
       text: log.description,
       timestamp: new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
       unread: index < 3,
       type: iconType
     }
   })
   setNotifications(logs)
 }, [])

 // Close dropdown on outside click
 useEffect(() => {
   function handleClickOutside(event: MouseEvent) {
     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
       setIsOpen(false)
     }
   }
   document.addEventListener("mousedown", handleClickOutside)
   return () => document.removeEventListener("mousedown", handleClickOutside)
 }, [])

 const handleMarkAllRead = () => {
   setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
   setUnreadCount(0)
 }

 const handleMarkItemRead = (id: string) => {
   setNotifications(prev => prev.map(n => {
     if (n.id === id && n.unread) {
       setUnreadCount(c => Math.max(0, c - 1))
       return { ...n, unread: false }
     }
     return n
   }))
 }

 const handleLogout = async () => {
   await signOut(auth)
   router.push('/login')
 }

 if (!user) return null;

 return (
 <header className="h-20 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
 <div className="flex items-center gap-4 hidden md:flex">
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="Search invoices, employees..." className="pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-transparent text-gray-900 dark:text-gray-100 w-72 transition-all" />
      </div>
 </div>
 {/* Mobile placeholder to push things right */}
 <div className="md:hidden"></div>

 <div className="flex items-center gap-6">
 {/* Company switch indicator */}
 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
   <Calendar size={16} />
   {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </div>

 <div className="relative" ref={dropdownRef}>
    <button 
      onClick={() => setIsOpen(!isOpen)}
      className="relative text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors p-1.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
      )}
    </button>

    {isOpen && (
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in text-left">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-gray-900 dark:text-gray-100">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-[9px] font-bold text-primary hover:underline transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              let NotifIcon = Bell
              let iconBg = 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              if (notif.type === 'invoice') {
                NotifIcon = FileText
                iconBg = 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
              } else if (notif.type === 'employee') {
                NotifIcon = Users
                iconBg = 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
              } else if (notif.type === 'payroll') {
                NotifIcon = Calculator
                iconBg = 'bg-green-50 text-green-600 dark:bg-green-900/20'
              }

              return (
                <div 
                  key={notif.id}
                  onClick={() => {
                    handleMarkItemRead(notif.id)
                  }}
                  className={`px-4 py-3 flex gap-3 items-start transition-colors cursor-pointer ${notif.unread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                    <NotifIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={`text-xs leading-normal ${notif.unread ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notif.text}
                    </p>
                    <span className="text-[9px] text-gray-400 block">{notif.timestamp}</span>
                  </div>
                  {notif.unread && (
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></span>
                  )}
                </div>
              )
            })
          ) : (
            <div className="p-6 text-center text-gray-500 text-xs">
              No new notifications.
            </div>
          )}
        </div>
      </div>
    )}
  </div>

 <div className="flex items-center gap-3 border-l border-[#F0F0F5] pl-6">
 <div className="text-right hidden sm:block">
 <div className="text-sm font-semibold">{user.displayName || user.email}</div>
 </div>
 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-medium shadow-sm">
 {user.displayName ? user.displayName[0] : (user.email ? user.email[0].toUpperCase() : 'U')}
 </div>
 <button onClick={handleLogout} className="ml-4 text-gray-500 hover:text-red-500 transition-colors p-2">
  <LogOut size={18} />
 </button>
 </div>
 </div>
 </header>
 )
}

function BuildingIcon() {
 return (
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
 <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
 <path d="M9 22v-4h6v4"></path>
 <path d="M8 6h.01"></path>
 <path d="M16 6h.01"></path>
 <path d="M12 6h.01"></path>
 <path d="M12 10h.01"></path>
 <path d="M12 14h.01"></path>
 <path d="M16 10h.01"></path>
 <path d="M16 14h.01"></path>
 <path d="M8 10h.01"></path>
 <path d="M8 14h.01"></path>
 </svg>
 )
}
