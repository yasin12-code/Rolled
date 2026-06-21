import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
      </div>
      
      {/* Abstract Background Shapes */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="fixed bottom-0 left-[20%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none translate-y-1/3"></div>
    </div>
  )
}
