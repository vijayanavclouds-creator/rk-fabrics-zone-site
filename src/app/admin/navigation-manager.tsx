"use client"
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Save, GripVertical, ChevronDown } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { getNavigationLinks, saveNavigationLinks } from "@/actions/system"
import { defaultNavLinks } from "@/components/layout/header"
import { cn } from "@/lib/utils"

export function NavigationManager() {
  const [links, setLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [expandedTab, setExpandedTab] = useState<number | null>(null)
  const [newTabLabel, setNewTabLabel] = useState("")
  const [newTabHref, setNewTabHref] = useState("")

  const autoGenerateSlug = (label: string) => {
    return "/" + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  useEffect(() => {
    const fetchLinks = async () => {
      const data = await getNavigationLinks()
      if (data && data.length > 0) {
        setLinks(data.map((l:any) => ({ ...l, _id: l._id || crypto.randomUUID() })))
      } else {
        setLinks(defaultNavLinks.map(l => ({ ...l, _id: crypto.randomUUID() })))
      }
      setIsLoading(false)
    }
    fetchLinks()
  }, [])

  const handleSave = () => {
    startTransition(async () => {
      const linksToSave = links.map(({ _id, ...rest }) => rest);
      const res = await saveNavigationLinks(linksToSave)
      if (res.success) {
        toast.success("Navigation links saved successfully!")
      } else {
        toast.error("Failed to save navigation links.")
      }
    })
  }

  const addMainTab = () => {
    if (!newTabLabel || !newTabHref) return;
    setLinks([...links, { _id: crypto.randomUUID(), label: newTabLabel, href: newTabHref, submenu: [] }])
    setNewTabLabel("")
    setNewTabHref("")
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    const newLinks = Array.from(links);
    const [draggedItem] = newLinks.splice(source.index, 1);
    newLinks.splice(destination.index, 0, draggedItem);
    setLinks(newLinks);
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
      </div>
      <div className="bg-white md:rounded-3xl border border-charcoal/10 p-2 sm:p-5 md:p-8 md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] -mx-4 sm:mx-0 sm:w-full border-x-0 sm:border-x">
        <div className="flex gap-1.5 md:gap-2 mb-6 items-end border-b border-charcoal/10 pb-6">
          <div className="flex-1">
            <label className="text-[10px] md:text-xs font-semibold text-slate uppercase mb-1 block ml-2">Tab Label</label>
            <input 
              type="text" 
              value={newTabLabel}
              onChange={(e) => {
                setNewTabLabel(e.target.value);
                if (!newTabHref || newTabHref === autoGenerateSlug(newTabLabel)) {
                  setNewTabHref(autoGenerateSlug(e.target.value));
                }
              }}
              className="w-full bg-cream shadow-neo-input !border-none rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:!outline-none focus:!ring-0 text-xs md:text-sm font-semibold text-charcoal placeholder:text-slate/60 transition-all"
              placeholder="e.g. Sale"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] md:text-xs font-semibold text-slate uppercase mb-1 block ml-2">Target URL</label>
            <input 
              type="text" 
              value={newTabHref}
              onChange={(e) => setNewTabHref(e.target.value)}
              className="w-full bg-cream shadow-neo-input !border-none rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:!outline-none focus:!ring-0 text-xs md:text-sm font-mono text-teal-700 placeholder:text-slate/60 transition-all"
              placeholder="e.g. /shop?features=on_sale"
            />
          </div>
          <button 
            onClick={addMainTab}
            disabled={!newTabLabel || !newTabHref}
            className="btn-icon !w-8 !h-8 md:!w-10 md:!h-10 text-teal-600 disabled:opacity-50 shrink-0 mb-0.5 md:mb-1 ml-1 md:ml-2"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="main-tabs">
            {(provided) => (
              <div className="space-y-2.5" {...provided.droppableProps} ref={provided.innerRef}>
                {links.map((link, idx) => (
                  <Draggable key={link._id} draggableId={link._id} index={idx}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border rounded-xl bg-slate-50 overflow-hidden transition-all duration-200 ${
                          snapshot.isDragging ? 'shadow-lg border-teal-500 scale-[1.02] bg-white z-50' : 'border-charcoal/10'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row gap-1.5 md:gap-3 p-1.5 md:p-2 bg-white border-b border-charcoal/10 items-center">
                          <div className="flex items-center gap-1.5 md:gap-2 w-full md:w-auto md:flex-1">
                            <div 
                              {...provided.dragHandleProps}
                              className="flex items-center justify-center p-1.5 text-slate-300 hover:text-charcoal cursor-grab active:cursor-grabbing transition-colors shrink-0"
                            >
                              <GripVertical size={16} />
                            </div>
                
                <div className="flex-1 grid grid-cols-[35%_minmax(0,1fr)] md:grid-cols-2 gap-1.5 md:gap-3">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-charcoal mb-0.5 ml-2">Tab Label</label>
                    <input 
                      type="text" 
                      value={link.label} 
                      onChange={e => updateMainTab(idx, "label", e.target.value)}
                      className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-xs bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-charcoal mb-0.5 ml-2">Target URL</label>
                    <input 
                      type="text" 
                      value={link.href} 
                      onChange={e => updateMainTab(idx, "href", e.target.value)}
                      className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-xs bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-start md:justify-end gap-1.5 w-full md:w-auto pl-[34px] md:pl-0 pt-0.5 md:pt-0 mt-0.5 md:mt-0 pr-2">
                <button 
                  onClick={() => setExpandedTab(expandedTab === idx ? null : idx)}
                  className="flex-1 md:flex-none px-3 py-1.5 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-full font-medium text-[11px] transition-colors flex items-center justify-center gap-1.5"
                >
                  Submenus ({link.submenu?.length || 0})
                  <ChevronDown size={16} className={`transition-transform ${expandedTab === idx ? 'rotate-180' : ''}`} />
                </button>
                <button 
                  onClick={() => removeMainTab(idx)}
                  className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {expandedTab === idx && (
              <div className="p-2 md:p-4 bg-slate-50 pl-2 md:pl-16">
                <div className="space-y-3 mb-4">
                  {(link.submenu || []).map((sub: any, subIdx: number) => (
                    <div key={subIdx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-charcoal/10 flex items-center justify-center text-xs font-bold text-charcoal shrink-0">{subIdx + 1}</div>
                      <input 
                        type="text" 
                        placeholder="Submenu Label"
                        value={sub.label} 
                        onChange={e => updateSubmenu(idx, subIdx, "label", e.target.value)}
                        className="w-[60%] md:w-auto md:flex-1 md:max-w-[200px] px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className={cn(
            "btn-primary flex items-center justify-center gap-2 px-6 py-2.5 md:px-8 md:py-3 text-sm font-bold shadow-sm hover:shadow-md transition-all",
            isPending && "opacity-50 cursor-not-allowed shadow-none"
          )}
        >
          {isPending ? <span className="animate-pulse">Saving...</span> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>
      </div>
    </div>
  )
}
