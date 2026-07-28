"use client"

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Save, GripVertical, ChevronDown } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
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
    setLinks([...links, { _id: crypto.randomUUID(), label: "New Tab", href: "/shop", submenu: [] }])
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
        <button 
          onClick={addMainTab}
          className="btn-primary flex items-center justify-center gap-2 text-center py-4 px-8"
        >
          <Plus size={18} /> Add Tab
        </button>
      </div>
      <div className="bg-white md:rounded-3xl border border-charcoal/10 p-2 sm:p-5 md:p-8 md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] -mx-4 sm:mx-0 sm:w-full border-x-0 sm:border-x">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="main-tabs">
            {(provided) => (
              <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                {links.map((link, idx) => (
                  <Draggable key={link._id} draggableId={link._id} index={idx}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border rounded-2xl bg-slate-50 overflow-hidden transition-all duration-200 ${
                          snapshot.isDragging ? 'shadow-lg border-teal-500 scale-[1.02] bg-white z-50' : 'border-charcoal/10'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 bg-white border-b border-charcoal/10">
                          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto md:flex-1">
                            <div 
                              {...provided.dragHandleProps}
                              className="flex items-center justify-center p-2 text-slate-300 hover:text-charcoal cursor-grab active:cursor-grabbing transition-colors shrink-0"
                            >
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

              <div className="flex items-center justify-start md:justify-end gap-2 w-full md:w-auto pl-[44px] md:pl-0 pt-1 md:pt-0 mt-1 md:mt-0">
                <button 
                  onClick={() => setExpandedTab(expandedTab === idx ? null : idx)}
                  className="flex-1 md:flex-none px-4 py-2 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
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
                        className="w-[50%] md:w-auto md:flex-1 md:max-w-[200px] px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
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
          className="btn-primary flex items-center justify-center gap-2 text-center py-4 px-10 disabled:opacity-50"
        >
          {isPending ? <span className="animate-pulse">Saving...</span> : <><Save size={20} /> Save Changes</>}
        </button>
      </div>
      </div>
    </div>
  )
}
