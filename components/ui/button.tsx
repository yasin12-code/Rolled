import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "default" | "sm" | "lg" | "icon" | string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          `btn-${variant}`,
          size ? `btn-${size}` : "",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
