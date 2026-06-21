import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { AuthProvider } from "@/components/providers/AuthProvider"
import "./globals.css"

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Rolled | Invoice & Payroll Platform",
  description: "Invoice & payroll, finally rolled into one. A complete SaaS for SMBs.",
}

import { ThemeProvider } from "@/components/providers/ThemeProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} font-sans antialiased bg-[#F8F9FB] text-[#1A1A24] dark:bg-[#0a0a0a] dark:text-[#ededed] min-h-screen selection:bg-primary/30 selection:text-primary transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
