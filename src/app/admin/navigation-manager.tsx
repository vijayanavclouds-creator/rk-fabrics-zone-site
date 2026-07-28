"use client"

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Save, GripVertical, ChevronDown } from "lucide-react"
import { getNavigationLinks, saveNavigationLinks } from "@/actions/system"
import { defaultNavLinks } from "@/components/layout/header"

export function NavigationManager() {
  const [links, setLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [expandedTab, setExpandedTab] = useState<number | null>(null)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

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

  const handleDrop = (dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    const newLinks = [...links];
    const draggedItem = newLinks[draggedIdx];
    newLinks.splice(draggedIdx, 1);
    newLinks.splice(dropIdx, 0, draggedItem);
    setLinks(newLinks);
    setDraggedIdx(null);
    setDragOverIdx(null);
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
          onClick={addMainTab}
          className="btn-primary flex items-center justify-center gap-2 text-center py-4 px-8"
        >
          <Plus size={18} /> Add Tab
        </button>
      </div>
      <div className="bg-white md:rounded-3xl border border-charcoal/10 p-2 sm:p-5 md:p-8 md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] -mx-4 sm:mx-0 sm:w-full border-x-0 sm:border-x">

      <div className="space-y-4">
        {links.map((link, idx) => (
          <div 
            key={idx} 
            draggable
            onDragStart={() => setDraggedIdx(idx)}
            onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
            className={`border rounded-2xl bg-slate-50 overflow-hidden transition-all duration-200 ${
              draggedIdx === idx ? 'opacity-40 border-dashed border-teal-500 scale-[0.98]' : 
              dragOverIdx === idx ? 'border-teal-500 shadow-[0_0_0_2px_rgba(13,148,136,0.2)]' : 'border-charcoal/10'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 bg-white border-b border-charcoal/10">
              <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto md:flex-1">
                <div className="flex items-center justify-center p-2 text-slate-300 hover:text-charcoal cursor-grab active:cursor-grabbing transition-colors shrink-0">
                  <GripVertical size={20} />
                </div>
                
                <div className="flex-1 grid grid-cols-[35%_minmax(0,1fr)] md:grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-charcoal mb-1 ml-2">Tab Label</label>
                    <input 
                      type="text" 
                      value={link.label} 
                      onChange={e => updateMainTab(idx, "label", e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-charcoal mb-1 ml-2">Target URL</label>
                    <input 
                      type="text" 
                      value={link.href} 
                      onChange={e => updateMainTab(idx, "href", e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pl-6 sm:pl-8 md:pl-0 pt-1 md:pt-0 mt-1 md:mt-0">
                <button 
                  onClick={() => setExpandedTab(expandedTab === idx ? null : idx)}
                  className="px-4 py-2 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-lg font-medium text-sm transition-colors flex items-center gap-2 flex-1 md:flex-none justify-center"
                >
                  Submenus ({link.submenu?.length || 0})
                  <ChevronDown size={16} className={`transition-transform ${expandedTab === idx ? 'rotate-180' : ''}`} />
                </button>
                <button 
                  onClick={() => removeMainTab(idx)}
                  className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
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
                        className="w-[40%] md:w-auto md:flex-1 md:max-w-[200px] px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="URL (/shop?category=...)"
                        value={sub.href} 
                        onChange={e => updateSubmenu(idx, subIdx, "href", e.target.value)}
                        className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-mono"
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
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className="btn-primary flex items-center justify-center gap-2 text-center py-4 px-10 disabled:opacity-50"
        >
          {isPending ? <span className="animate-pulse">Saving...</span> : <><Save size={20} /> Save Changes</>}
        </button>
      </div>
      </div>
    </div>
  )
}
