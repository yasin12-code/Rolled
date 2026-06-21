"use client"

import { useState, useEffect } from "react"
import { getTemplates, saveTemplates, getCompany, formatCurrency } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paintbrush, Check, RotateCcw, Save, Plus, FileText, Sparkles, CheckCircle2, Upload, Trash2 } from "lucide-react"
import type { InvoiceTemplate } from "@/lib/data"

const FONT_OPTIONS = [
  { name: "DM Sans", value: "var(--font-dm-sans), sans-serif" },
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "System Sans", value: "system-ui, sans-serif" }
]

const LAYOUT_OPTIONS = [
  { name: "Minimalist", value: "minimal", desc: "Clean spacing, simple lines, and elegant layout." },
  { name: "Corporate", value: "corporate", desc: "Top header block, white titles, structured tables." },
  { name: "Modern Bold", value: "bold", desc: "Thick colorful borders, visual indicators, side-by-side details." },
  { name: "Classic Serif", value: "classic", desc: "Traditional headers, double border lines, serif aesthetics." }
]

const COLOR_PRESETS = [
  { name: "Ink Black", primary: "#0F0E0C", accent: "#6B6860" },
  { name: "Corporate Blue", primary: "#1D3557", accent: "#457B9D" },
  { name: "Bold Purple", primary: "#7C3AED", accent: "#A78BFA" },
  { name: "Emerald Forest", primary: "#0F7A4A", accent: "#34D399" },
  { name: "Crimson Red", primary: "#991B1B", accent: "#F87171" },
  { name: "Midnight Navy", primary: "#1E293B", accent: "#38BDF8" }
]

export default function DesignerPage() {
  const company = getCompany()
  const [templatesList, setTemplatesList] = useState<InvoiceTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  
  // Custom template form state
  const [templateName, setTemplateName] = useState("")
  const [selectedFont, setSelectedFont] = useState("DM Sans")
  const [selectedLayout, setSelectedLayout] = useState<'minimal' | 'corporate' | 'bold' | 'classic'>("minimal")
  const [primaryColor, setPrimaryColor] = useState("#000000")
  const [accentColor, setAccentColor] = useState("#666666")
  const [isDefault, setIsDefault] = useState(false)
  const [logo, setLogo] = useState<string>("")

  // Feedback notifications
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const list = getTemplates()
    setTemplatesList(list)
    
    // Default to the template configured as default or the first item
    const def = list.find(t => t.isDefault) || list[0]
    if (def) {
      loadTemplate(def)
    }
  }, [])

  const loadTemplate = (tpl: InvoiceTemplate) => {
    setSelectedTemplateId(tpl.id)
    setTemplateName(tpl.name)
    setSelectedFont(tpl.font)
    setSelectedLayout(tpl.layout)
    setPrimaryColor(tpl.primaryColor)
    setAccentColor(tpl.accentColor)
    setIsDefault(tpl.isDefault)
    setLogo(tpl.logo || "")
  }

  const handleApplyPresetColors = (prim: string, acc: string) => {
    setPrimaryColor(prim)
    setAccentColor(acc)
  }

  const handleCreateNew = () => {
    setSelectedTemplateId("") // Represents creating a new template
    setTemplateName("My Custom Template")
    setSelectedFont("DM Sans")
    setSelectedLayout("minimal")
    setPrimaryColor("#7C3AED")
    setAccentColor("#A78BFA")
    setIsDefault(false)
    setLogo("")
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Logo file size should be less than 1.5MB to fit local template storage.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name.")
      return
    }

    let updatedList: InvoiceTemplate[] = []
    
    // If setting this one to default, toggle all others off
    const prepareList = (list: InvoiceTemplate[]) => {
      if (isDefault) {
        return list.map(t => ({ ...t, isDefault: false }))
      }
      return list
    }

    if (selectedTemplateId) {
      // Edit existing
      const cleaned = prepareList(templatesList)
      updatedList = cleaned.map(t => 
        t.id === selectedTemplateId 
          ? {
              ...t,
              name: templateName,
              font: selectedFont,
              layout: selectedLayout,
              primaryColor,
              accentColor,
              isDefault,
              logo: logo || undefined
            }
          : t
      )
    } else {
      // Add new
      const cleaned = prepareList(templatesList)
      const newTemplate: InvoiceTemplate = {
        id: `tpl_${Math.floor(Math.random() * 9000 + 1000)}`,
        companyId: "comp_001",
        name: templateName,
        font: selectedFont,
        layout: selectedLayout,
        primaryColor,
        accentColor,
        isDefault,
        logo: logo || undefined
      }
      updatedList = [...cleaned, newTemplate]
      setSelectedTemplateId(newTemplate.id)
    }

    setTemplatesList(updatedList)
    saveTemplates(updatedList)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const getFontFamilyCSS = (fontName: string) => {
    const opt = FONT_OPTIONS.find(o => o.name === fontName)
    return opt ? opt.value : "sans-serif"
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl mb-1">Invoice Designer</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Customize visual style presets, layouts, and colors for invoices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleCreateNew} className="gap-1.5 text-xs h-9">
            <Plus size={14} /> Create Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Editor Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-5">
              
              {/* Presets dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Base Template</label>
                <select 
                  className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-gray-200 dark:border-white/10"
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const found = templatesList.find(t => t.id === e.target.value)
                    if (found) loadTemplate(found)
                  }}
                >
                  <option value="" disabled>-- Create Custom Template or Select Preset --</option>
                  {templatesList.map(t => (
                    <option key={t.id} value={t.id}>{t.name} {t.isDefault ? "(Default)" : ""}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

              {/* Template Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Template Preset Name</label>
                <Input 
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="e.g., Modern Tech Theme"
                />
              </div>

              {/* Layout Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Layout Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {LAYOUT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedLayout(opt.value as any)}
                      className={`p-3 text-left border rounded-xl transition-all ${
                        selectedLayout === opt.value 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-gray-150 hover:bg-gray-50 dark:bg-[#1a1a24] text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-sm">{opt.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Document Font</label>
                <select 
                  className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-gray-200 dark:border-white/10"
                  value={selectedFont}
                  onChange={e => setSelectedFont(e.target.value)}
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Brand Palette</label>
                
                {/* Preset Palettes */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {COLOR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPresetColors(p.primary, p.accent)}
                      title={p.name}
                      className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 overflow-hidden flex transform hover:scale-105 transition-transform"
                    >
                      <span className="w-1/2 h-full block" style={{ backgroundColor: p.primary }} />
                      <span className="w-1/2 h-full block" style={{ backgroundColor: p.accent }} />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Primary Color</span>
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 p-0 cursor-pointer"
                      />
                      <Input 
                        value={primaryColor} 
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="h-8 text-xs font-mono px-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Accent Color</span>
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="color" 
                        value={accentColor} 
                        onChange={e => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 p-0 cursor-pointer"
                      />
                      <Input 
                        value={accentColor} 
                        onChange={e => setAccentColor(e.target.value)}
                        className="h-8 text-xs font-mono px-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">Company Logo (Optional)</label>
                {logo ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-150">
                    <div className="h-12 w-12 rounded border bg-white dark:bg-gray-900 flex items-center justify-center p-1 overflow-hidden shadow-sm">
                      <img src={logo} alt="Uploaded logo" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">Logo Uploaded</div>
                      <button 
                        type="button" 
                        onClick={() => setLogo("")}
                        className="text-[10px] text-red-500 font-bold hover:underline mt-0.5 flex items-center gap-0.5"
                      >
                        <Trash2 size={10} /> Remove Logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-gray-50 dark:bg-[#1a1a24] hover:border-primary/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Click to upload logo</p>
                      <p className="text-[9px] text-gray-450 mt-0.5">PNG, JPG or SVG (Max 1.5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Default template toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a24] rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Set as default template</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Use this styling for all newly created invoices.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isDefault}
                  onChange={e => setIsDefault(e.target.checked)}
                  className="w-4.5 h-4.5 accent-primary rounded border-gray-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleSaveTemplate} 
                  className="flex-1 gap-1.5"
                  disabled={saveSuccess}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 size={16} /> Saved!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Theme
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Live Invoice Preview Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            <span>Live Document Preview</span>
 <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary animate-pulse" /> Interactive</span>
 </div>

 <Card className="overflow-hidden border-2 border-gray-150/80 shadow-lg bg-gray-100/50 p-6 md:p-8">
 {/* The paper wrapper */}
 <div 
 style={{ fontFamily: getFontFamilyCSS(selectedFont) }}
 className="bg-white text-gray-800 p-8 shadow-md rounded-xl transition-all duration-300 min-h-[600px] border border-gray-200 "
 >
 
 {/* Minimal Layout */}
 {selectedLayout === "minimal" && (
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
 style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
 >
 PAID
 </span>
 <p className="text-sm font-semibold text-gray-900 mt-4">INV-2025-042</p>
 <p className="text-xs text-gray-400 mt-1">Due Date: 14 July 2025</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-8 text-sm">
 <div>
 <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Billed To</span>
 <h4 className="font-bold text-gray-900 mt-1">Acme Corporation</h4>
 <p className="text-gray-500 mt-0.5">15 Main Boulevard, Lahore</p>
 </div>
 <div className="text-right">
 <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Issue Date</span>
 <p className="font-medium text-gray-900 mt-1">20 June 2026</p>
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
 <tr>
 <td className="py-3 font-semibold text-gray-800">UI/UX Design Services</td>
 <td className="text-right py-3 text-gray-600 ">1</td>
 <td className="text-right py-3 text-gray-600 ">{formatCurrency(150000)}</td>
 <td className="text-right py-3 font-semibold text-gray-900 ">{formatCurrency(150000)}</td>
 </tr>
 <tr>
 <td className="py-3 font-semibold text-gray-800">Web Development - Phase 1</td>
 <td className="text-right py-3 text-gray-600 ">1</td>
 <td className="text-right py-3 text-gray-600 ">{formatCurrency(450000)}</td>
 <td className="text-right py-3 font-semibold text-gray-900 ">{formatCurrency(450000)}</td>
 </tr>
 </tbody>
 </table>

 <div className="flex justify-end pt-6 border-t border-gray-100 ">
 <div className="w-64 space-y-2 text-sm">
 <div className="flex justify-between text-gray-500 ">
 <span>Subtotal</span>
 <span>{formatCurrency(600000)}</span>
 </div>
 <div className="flex justify-between text-gray-500 ">
 <span>Tax (5%)</span>
 <span>{formatCurrency(300000)}</span>
 </div>
 <div className="flex justify-between pt-2 border-t font-bold text-base" style={{ color: primaryColor, borderColor: accentColor }}>
 <span>Total Due</span>
 <span>{formatCurrency(630000)}</span>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Corporate Layout */}
 {selectedLayout === "corporate" && (
 <div className="space-y-6">
 {/* Banner block top */}
 <div className="-mx-8 -mt-8 p-8 flex justify-between items-center text-white" style={{ backgroundColor: primaryColor }}>
 <div className="flex items-center gap-4">
 {logo && (
 <div className="bg-white p-1 rounded-lg flex items-center justify-center h-14 w-14 shadow-sm">
 <img src={logo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
 </div>
 )}
 <div>
 <h2 className="text-3xl font-bold">{company.name}</h2>
 <p className="text-xs opacity-80 mt-1">{company.address}</p>
 </div>
 </div>
 <div className="text-right">
 <h3 className="text-xl font-semibold tracking-wider">INVOICE</h3>
 <p className="text-xs opacity-80 mt-1">INV-2025-042</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-8 text-sm pt-4">
 <div>
 <h5 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Prepared For</h5>
 <h4 className="font-bold text-gray-900 mt-2 text-base">Acme Corporation</h4>
 <p className="text-gray-500 mt-0.5">15 Main Boulevard, Lahore</p>
 <p className="text-gray-500 text-xs mt-1">billing@acme.com</p>
 </div>
 <div className="text-right space-y-1">
 <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Details</div>
 <p className="text-sm"><span className="text-gray-400">Date:</span> 20 June 2026</p>
 <p className="text-sm"><span className="text-gray-400">Due:</span> 14 July 2025</p>
 <div className="pt-2">
 <span 
 className="px-3 py-1 font-bold text-xs rounded border"
 style={{ borderColor: accentColor, color: accentColor }}
 >
 PAID
 </span>
 </div>
 </div>
 </div>

 <table className="w-full text-sm mt-8 border-collapse">
 <thead>
 <tr className="text-white text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: accentColor }}>
 <th className="text-left p-2.5">Description</th>
 <th className="text-right p-2.5">Qty</th>
 <th className="text-right p-2.5">Rate</th>
 <th className="text-right p-2.5">Total</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200 border-b border-gray-200 ">
 <tr>
 <td className="p-3 font-medium text-gray-800">UI/UX Design Services</td>
 <td className="text-right p-3 text-gray-600 ">1</td>
 <td className="text-right p-3 text-gray-600 ">{formatCurrency(150000)}</td>
 <td className="text-right p-3 font-semibold text-gray-900 ">{formatCurrency(150000)}</td>
 </tr>
 <tr>
 <td className="p-3 font-medium text-gray-800">Web Development - Phase 1</td>
 <td className="text-right p-3 text-gray-600 ">1</td>
 <td className="text-right p-3 text-gray-600 ">{formatCurrency(450000)}</td>
 <td className="text-right p-3 font-semibold text-gray-900 ">{formatCurrency(450000)}</td>
 </tr>
 </tbody>
 </table>

 <div className="flex justify-end pt-4">
 <div className="w-64 space-y-2 text-sm bg-gray-50 p-4 rounded-lg border border-gray-150">
 <div className="flex justify-between text-gray-500 text-xs">
 <span>Subtotal</span>
 <span>{formatCurrency(600000)}</span>
 </div>
 <div className="flex justify-between text-gray-500 text-xs">
 <span>Tax (5%)</span>
 <span>{formatCurrency(30000)}</span>
 </div>
 <div className="flex justify-between font-bold text-sm pt-2 border-t text-gray-850" style={{ borderColor: primaryColor }}>
 <span>Grand Total</span>
 <span style={{ color: primaryColor }}>{formatCurrency(630000)}</span>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Bold Layout */}
 {selectedLayout === "bold" && (
 <div className="space-y-6">
 {/* Accent Line top */}
 <div className="h-2 -mx-8 -mt-8" style={{ backgroundColor: primaryColor }} />
 
 <div className="flex justify-between items-start pt-4">
 <div className="flex items-center gap-4">
 {logo && (
 <div className="border border-gray-200 p-1.5 rounded-lg flex items-center justify-center h-14 w-14 bg-white shadow-xs">
 <img src={logo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
 </div>
 )}
 <div>
 <h2 className="text-4xl font-black uppercase tracking-tight" style={{ color: primaryColor }}>{company.name}</h2>
 <p className="text-xs text-gray-400 mt-1">42 Blue Area, Islamabad</p>
 </div>
 </div>
 <div className="bg-gray-100 p-4 rounded-xl text-right">
 <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Balance</div>
 <div className="text-2xl font-black mt-1" style={{ color: primaryColor }}>{formatCurrency(630000)}</div>
 </div>
 </div>

 <div className="border-y border-gray-150 py-4 grid grid-cols-3 gap-4 text-xs">
 <div>
 <div className="font-bold text-gray-450 uppercase">Client Info</div>
 <div className="font-bold text-gray-800 mt-1">Acme Corporation</div>
 <div className="text-gray-500 ">15 Main Boulevard, Lahore</div>
 </div>
 <div>
 <div className="font-bold text-gray-450 uppercase">Invoice Number</div>
 <div className="font-bold text-gray-800 mt-1">INV-2025-042</div>
 <div className="text-gray-500 ">Issued: 20 June 2026</div>
 </div>
 <div className="text-right">
 <div className="font-bold text-gray-450 uppercase">Status</div>
 <div className="mt-1">
 <span 
 className="inline-block px-3 py-1 font-black rounded-lg text-[10px] text-white"
 style={{ backgroundColor: accentColor }}
 >
 PAID IN FULL
 </span>
 </div>
 <div className="text-gray-500 mt-1">Due: 14 July 2025</div>
 </div>
 </div>

 <table className="w-full text-sm mt-4">
 <thead>
 <tr className="border-b-2 text-left" style={{ borderColor: primaryColor }}>
 <th className="py-2.5 font-bold">Services & Items</th>
 <th className="py-2.5 text-right font-bold">Qty</th>
 <th className="py-2.5 text-right font-bold">Rate</th>
 <th className="py-2.5 text-right font-bold">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr>
 <td className="py-3 font-semibold">UI/UX Design Services</td>
 <td className="text-right py-3">1</td>
 <td className="text-right py-3">{formatCurrency(150000)}</td>
 <td className="text-right py-3 font-bold" style={{ color: primaryColor }}>{formatCurrency(150000)}</td>
 </tr>
 <tr>
 <td className="py-3 font-semibold">Web Development - Phase 1</td>
 <td className="text-right py-3">1</td>
 <td className="text-right py-3">{formatCurrency(450000)}</td>
 <td className="text-right py-3 font-bold" style={{ color: primaryColor }}>{formatCurrency(450000)}</td>
 </tr>
 </tbody>
 </table>

 <div className="flex justify-between items-end pt-6 border-t border-gray-150">
 <p className="text-xs text-gray-400 italic max-w-sm">Thank you for working with us! Please send payments to bank details provided on settings.</p>
 <div className="w-56 space-y-1.5 text-xs text-right">
 <div className="flex justify-between">
 <span className="text-gray-400">Subtotal</span>
 <span className="font-semibold">{formatCurrency(600000)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-400">Tax (5%)</span>
 <span className="font-semibold">{formatCurrency(30000)}</span>
 </div>
 <div className="flex justify-between pt-2 border-t-2 font-black text-sm" style={{ color: primaryColor, borderColor: primaryColor }}>
 <span>TOTAL PAID</span>
 <span>{formatCurrency(630000)}</span>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Classic Layout */}
 {selectedLayout === "classic" && (
 <div className="space-y-6">
 {/* Decorative Double Borders */}
 <div className="text-center pb-4 border-b border-double border-gray-300">
 {logo && (
 <div className="flex justify-center mb-3">
 <div className="h-16 w-16 flex items-center justify-center bg-white rounded p-1 border">
 <img src={logo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
 </div>
 </div>
 )}
 <h2 className="text-3xl font-serif tracking-wide" style={{ color: primaryColor }}>{company.name}</h2>
 <p className="text-xs text-gray-500 italic mt-1">{company.address} • Phone: {company.phone}</p>
 </div>

 <div className="flex justify-between text-sm py-2">
 <div>
 <h4 className="font-bold text-gray-700 italic">Bill To:</h4>
 <p className="font-bold text-gray-900 mt-1">Acme Corporation</p>
 <p className="text-gray-500 ">{company.address}</p>
 </div>
 <div className="text-right space-y-1">
 <p><span className="font-bold text-gray-600 ">Invoice Reference:</span> INV-2025-042</p>
 <p><span className="font-bold text-gray-600 ">Issue Date:</span> 20 June 2026</p>
 <p><span className="font-bold text-gray-600 ">Due Date:</span> 14 July 2025</p>
 <p className="font-bold text-green-700 uppercase tracking-widest pt-2">★ Status: PAID ★</p>
 </div>
 </div>

 <table className="w-full text-sm mt-4 border-t border-b border-gray-300">
 <thead>
 <tr className="border-b text-left text-gray-700 font-serif">
 <th className="py-2 italic">Itemized Description</th>
 <th className="py-2 text-right">Quantity</th>
 <th className="py-2 text-right">Unit Price</th>
 <th className="py-2 text-right">Total Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-150">
 <tr>
 <td className="py-3 font-medium text-gray-800">UI/UX Design Services</td>
 <td className="text-right py-3">1</td>
 <td className="text-right py-3">{formatCurrency(150000)}</td>
 <td className="text-right py-3 font-medium text-gray-900 ">{formatCurrency(150000)}</td>
 </tr>
 <tr>
 <td className="py-3 font-medium text-gray-800">Web Development - Phase 1</td>
 <td className="text-right py-3">1</td>
 <td className="text-right py-3">{formatCurrency(450000)}</td>
 <td className="text-right py-3 font-medium text-gray-900 ">{formatCurrency(450000)}</td>
 </tr>
 </tbody>
 </table>

 <div className="flex justify-end pt-4">
 <div className="w-64 space-y-2 text-sm border-double border-t-4 pt-2" style={{ borderColor: accentColor }}>
 <div className="flex justify-between">
 <span className="italic">Invoice Subtotal</span>
 <span>{formatCurrency(600000)}</span>
 </div>
 <div className="flex justify-between">
 <span className="italic">Taxation (5.0%)</span>
 <span>{formatCurrency(30000)}</span>
 </div>
 <div className="flex justify-between font-bold text-base border-t border-b border-gray-300 py-1" style={{ color: primaryColor }}>
 <span>Total Balance Due</span>
 <span>{formatCurrency(630000)}</span>
 </div>
 </div>
 </div>
 </div>
 )}

 </div>
 </Card>
 </div>

 </div>
 </div>
 )
}
