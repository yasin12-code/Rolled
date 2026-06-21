"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  className?: string
}

export function CustomSelect({ value, onChange, options, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={`relative z-40 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="w-full h-9 px-3 py-1 text-sm rounded-xl border border-[#F0F0F5] bg-white text-[#1C1C2E] focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-between gap-2 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={14} className={`text-[#A1A1B5] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[140px] bg-white rounded-xl shadow-lg border border-[#F0F0F5] overflow-hidden py-1 animate-fade-in">
          <ul className="max-h-60 overflow-y-auto hide-scrollbar">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    value === option.value 
                      ? "bg-[#F0EDFE] text-primary font-semibold" 
                      : "text-[#1C1C2E] hover:bg-[#F8F9FB]"
                  }`}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
