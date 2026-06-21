import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?: "default" | "draft" | "sent" | "paid" | "overdue"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
 return (
 <div
 className={cn(
 "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
 {
 "bg-gray-100 text-gray-800 ": variant === "default",
 "badge-draft": variant === "draft",
 "badge-sent": variant === "sent",
 "badge-paid": variant === "paid",
 "badge-overdue": variant === "overdue",
 },
 className
 )}
 {...props}
 />
 )
}

function BadgeDot({ className }: React.HTMLAttributes<HTMLSpanElement>) {
 return (
 <span className={cn("h-1.5 w-1.5 rounded-full", className)} />
 )
}

export { Badge, BadgeDot }
