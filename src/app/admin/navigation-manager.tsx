"use client"

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Save, GripVertical, ChevronDown, ChevronUp } from "lucide-react"
import { getNavigationLinks, saveNavigationLinks } from "@/actions/system"
import { defaultNavLinks } from "@/components/layout/header"

export function NavigationManager() {
  const [links, setLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [expandedTab, setExpandedTab] = useState<number | null>(null)

  useEffect(() => {
    const fetchLinks = async () => {
      const data = await getNavigationLinks()
      if (data && data.length > 0) {
        setLinks(data)
      } else {
        setLinks(defaultNavLinks)
      }
      setIsLoading(false)
    }
    fetchLinks()
  }, [])

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveNavigationLinks(links)
      if (res.success) {
        toast.success("Navigation links saved successfully!")
      } else {
        toast.error("Failed to save navigation links.")
      }
    })
  }

  const addMainTab = () => {
    setLinks([...links, { label: "New Tab", href: "/shop", submenu: [] }])
  }

  const updateMainTab = (idx: number, field: string, value: string) => {
    const updated = [...links]
    updated[idx] = { ...updated[idx], [field]: value }
    setLinks(updated)
  }

  const removeMainTab = (idx: number) => {
    if (!confirm("Are you sure you want to remove this main tab?")) return
    const updated = [...links]
    updated.splice(idx, 1)
    setLinks(updated)
  }

  const addSubmenu = (mainIdx: number) => {
    const updated = [...links]
    if (!updated[mainIdx].submenu) {
      updated[mainIdx].submenu = []
    }
    updated[mainIdx].submenu.push({ label: "New Submenu", href: "/shop" })
    setLinks(updated)
    setExpandedTab(mainIdx)
  }

  const updateSubmenu = (mainIdx: number, subIdx: number, field: string, value: string) => {
    const updated = [...links]
    updated[mainIdx].submenu[subIdx] = { ...updated[mainIdx].submenu[subIdx], [field]: value }
    setLinks(updated)
  }

  const removeSubmenu = (mainIdx: number, subIdx: number) => {
    const updated = [...links]
    updated[mainIdx].submenu.splice(subIdx, 1)
    setLinks(updated)
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const updated = [...links]
    const temp = updated[idx]
    updated[idx] = updated[idx - 1]
    updated[idx - 1] = temp
    setLinks(updated)
  }

  const moveDown = (idx: number) => {
    if (idx === links.length - 1) return
    const updated = [...links]
    const temp = updated[idx]
    updated[idx] = updated[idx + 1]
    updated[idx + 1] = temp
    setLinks(updated)
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading navigation links...</div>
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">Storefront Navigation</h2>
          <p className="text-sm text-slate mt-1">Manage the main menu tabs and dropdown links shown on the website header.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {isPending ? <span className="animate-pulse">Saving...</span> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>
      <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

      <div className="space-y-4">
        {links.map((link, idx) => (
          <div key={idx} className="border border-charcoal/10 rounded-2xl bg-slate-50 overflow-hidden">
            <div className="flex items-center gap-4 p-4 bg-white border-b border-charcoal/10">
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} className="text-slate-400 hover:text-charcoal disabled:opacity-30">
                  <ChevronUp size={16} />
                </button>
                <button type="button" onClick={() => moveDown(idx)} disabled={idx === links.length - 1} className="text-slate-400 hover:text-charcoal disabled:opacity-30">
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tab Label</label>
                  <input 
                    type="text" 
                    value={link.label} 
                    onChange={e => updateMainTab(idx, "label", e.target.value)}
                    className="w-full p-2.5 text-sm font-semibold rounded-lg border border-charcoal/20 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Target URL</label>
                  <input 
                    type="text" 
                    value={link.href} 
                    onChange={e => updateMainTab(idx, "href", e.target.value)}
                    className="w-full p-2.5 text-sm rounded-lg border border-charcoal/20 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setExpandedTab(expandedTab === idx ? null : idx)}
                  className="px-4 py-2 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                >
                  Submenus ({link.submenu?.length || 0})
                  <ChevronDown size={16} className={`transition-transform ${expandedTab === idx ? 'rotate-180' : ''}`} />
                </button>
                <button 
                  onClick={() => removeMainTab(idx)}
                  className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {expandedTab === idx && (
              <div className="p-4 bg-slate-50 pl-16">
                <div className="space-y-3 mb-4">
                  {(link.submenu || []).map((sub: any, subIdx: number) => (
                    <div key={subIdx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center text-xs font-bold text-charcoal">{subIdx + 1}</div>
                      <input 
                        type="text" 
                        placeholder="Submenu Label"
                        value={sub.label} 
                        onChange={e => updateSubmenu(idx, subIdx, "label", e.target.value)}
                        className="flex-1 max-w-[200px] p-2 text-sm rounded-lg border border-charcoal/20 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="URL (/shop?category=...)"
                        value={sub.href} 
                        onChange={e => updateSubmenu(idx, subIdx, "href", e.target.value)}
                        className="flex-1 p-2 text-sm rounded-lg border border-charcoal/20 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white text-teal-700 font-mono"
                      />
                      <button 
                        onClick={() => removeSubmenu(idx, subIdx)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!link.submenu || link.submenu.length === 0) && (
                    <div className="text-sm text-slate-500 italic">No submenu items. Click below to add one.</div>
                  )}
                </div>
                <button 
                  onClick={() => addSubmenu(idx)}
                  className="flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={16} /> Add Dropdown Link
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button 
          onClick={addMainTab}
          className="flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-neo-btn hover:-translate-y-1"
        >
          <Plus size={20} /> Add Main Menu Tab
        </button>
      </div>
      </div>
    </div>
  )
}
