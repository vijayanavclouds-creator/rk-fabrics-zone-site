"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Plus, X, Tag, Scissors, ChevronDown, Trash2, GripVertical, Save } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { saveStoreTaxonomy } from "@/actions/system"
import { cn } from "@/lib/utils"

export interface TaxonomyOption {
  value: string;
  label: string;
  subcategories?: TaxonomyOption[];
}

interface TaxonomyManagerProps {
  initialCategories: TaxonomyOption[];
  initialFabrics: TaxonomyOption[];
}

export function TaxonomyManager({ initialCategories, initialFabrics }: TaxonomyManagerProps) {
  const [categories, setCategories] = useState<TaxonomyOption[]>(initialCategories)
  const [savedCategories, setSavedCategories] = useState<TaxonomyOption[]>(initialCategories)
  const [isPending, startTransition] = useTransition()

  const [newCatLabel, setNewCatLabel] = useState("")
  const [newCatValue, setNewCatValue] = useState("")

  const [expandedCat, setExpandedCat] = useState<number | null>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    const newCats = Array.from(categories);
    const [draggedItem] = newCats.splice(source.index, 1);
    newCats.splice(destination.index, 0, draggedItem);
    setCategories(newCats);
  }

  const autoGenerateSlug = (label: string) => {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleAddCategory = () => {
    if (!newCatLabel || !newCatValue) return
    if (categories.some(c => c.value === newCatValue)) {
      toast.error("A category with this URL slug already exists.")
      return
    }
    setCategories([...categories, { value: newCatValue, label: newCatLabel, subcategories: [] }])
    setNewCatLabel("")
    setNewCatValue("")
  }



  const addSubcategory = (catIndex: number, subIndex?: number) => {
    const updated = [...categories]
    if (subIndex === undefined) {
      if (!updated[catIndex].subcategories) updated[catIndex].subcategories = []
      updated[catIndex].subcategories.push({ label: "New Subcategory", value: "new-subcategory" })
    } else {
      const subcats = updated[catIndex].subcategories
      if (subcats) {
        if (!subcats[subIndex].subcategories) subcats[subIndex].subcategories = []
        subcats[subIndex].subcategories.push({ label: "New Sub-subcategory", value: "new-sub-subcategory" })
      }
    }
    setCategories(updated)
    if (subIndex === undefined) setExpandedCat(catIndex)
  }

  const updateSubcategory = (catIndex: number, subIndex: number, field: "label" | "value", val: string, subSubIndex?: number) => {
    const updated = [...categories]
    const subcats = updated[catIndex].subcategories
    if (subcats) {
      if (subSubIndex === undefined) {
        const oldLabel = subcats[subIndex].label;
        const oldSlug = subcats[subIndex].value;
        subcats[subIndex] = { ...subcats[subIndex], [field]: val }
        
        if (field === "label") {
          const expectedOldSlug = autoGenerateSlug(oldLabel);
          if (!oldSlug || oldSlug === "new-subcategory" || oldSlug === expectedOldSlug) {
            subcats[subIndex].value = autoGenerateSlug(val);
          }
        }
      } else {
        const subsubcats = subcats[subIndex].subcategories
        if (subsubcats) {
          const oldLabel = subsubcats[subSubIndex].label;
          const oldSlug = subsubcats[subSubIndex].value;
          subsubcats[subSubIndex] = { ...subsubcats[subSubIndex], [field]: val }
          
          if (field === "label") {
            const expectedOldSlug = autoGenerateSlug(oldLabel);
            if (!oldSlug || oldSlug === "new-sub-subcategory" || oldSlug === expectedOldSlug) {
              subsubcats[subSubIndex].value = autoGenerateSlug(val);
            }
          }
        }
      }
      setCategories(updated)
    }
  }

  const removeSubcategory = (catIndex: number, subIndex: number, subSubIndex?: number) => {
    const updated = [...categories]
    const subcats = updated[catIndex].subcategories
    if (subcats) {
      if (subSubIndex === undefined) {
        subcats.splice(subIndex, 1)
      } else {
        const subsubcats = subcats[subIndex].subcategories
        if (subsubcats) {
          subsubcats.splice(subSubIndex, 1)
        }
      }
      setCategories(updated)
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      // Clean up empty subcategories
      const cleanedCats = categories.map(c => ({
        ...c,
        subcategories: c.subcategories?.map(s => ({
          ...s,
          subcategories: s.subcategories?.filter(ss => ss.label.trim() !== "" && ss.value.trim() !== "")
        })).filter(s => s.label.trim() !== "" && s.value.trim() !== "")
      }))

      const res = await saveStoreTaxonomy(cleanedCats, initialFabrics)
      if (res.success) {
        toast.success("Categories saved successfully!")
        setCategories(cleanedCats)
        setSavedCategories(cleanedCats);
        wasDirty.current = false;
      } else {
        toast.error(res.error || "Failed to save taxonomy.")
      }
    })
  }

  const hasChanges = JSON.stringify(categories) !== JSON.stringify(savedCategories);
  const wasDirty = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  useEffect(() => {
    const handlePopState = () => {
      if (hasChanges) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
          window.history.pushState(null, "", window.location.href);
        } else {
          setTimeout(() => {
            window.history.back();
          }, 0);
        }
      }
    };

    if (hasChanges && !wasDirty.current) {
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
      wasDirty.current = true;
    } else if (!hasChanges && wasDirty.current) {
      window.removeEventListener("popstate", handlePopState);
      wasDirty.current = false;
      window.history.back();
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasChanges]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-12 pt-8 border-t border-charcoal/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal flex items-center gap-2">
            <Tag size={24} className="text-teal-600" />
            Categories & Fabrics Manager
          </h2>
          <p className="text-sm text-slate mt-1">
            Manage the master list of categories, subcategories, and fabrics.
          </p>
        </div>
      </div>

      <div className="w-full">
        {/* Categories Section */}
        <div className="bg-white rounded-none md:rounded-3xl border-y md:border-x border-charcoal/10 shadow-sm overflow-hidden -mx-4 md:mx-0">
          
          <div className="p-4 md:p-6">
            <div className="flex gap-1.5 md:gap-2 mb-6 items-end border-b border-charcoal/10 pb-6">
              <div className="flex-1">
                <label className="text-[10px] md:text-xs font-semibold text-slate uppercase mb-1 block ml-2">Display Name</label>
                <input 
                  type="text" 
                  value={newCatLabel}
                  onChange={(e) => {
                    setNewCatLabel(e.target.value);
                    if (!newCatValue || newCatValue === autoGenerateSlug(newCatLabel)) {
                      setNewCatValue(autoGenerateSlug(e.target.value));
                    }
                  }}
                  className="w-full bg-cream shadow-neo-input !border-none rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:!outline-none focus:!ring-0 text-xs md:text-sm font-semibold text-charcoal placeholder:text-slate/60 transition-all"
                  placeholder="e.g. Men"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] md:text-xs font-semibold text-slate uppercase mb-1 block ml-2">URL Slug</label>
                <input 
                  type="text" 
                  value={newCatValue}
                  onChange={(e) => setNewCatValue(e.target.value)}
                  className="w-full bg-cream shadow-neo-input !border-none rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:!outline-none focus:!ring-0 text-xs md:text-sm font-mono text-teal-700 placeholder:text-slate/60 transition-all"
                  placeholder="e.g. men"
                />
              </div>
              <button 
                onClick={handleAddCategory}
                disabled={!newCatLabel || !newCatValue}
                className="btn-icon !w-8 !h-8 md:!w-10 md:!h-10 text-teal-600 disabled:opacity-50 shrink-0 mb-0.5 md:mb-1 ml-1 md:ml-2"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="categories">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2.5">
                      {categories.map((cat, i) => (
                        <Draggable key={cat.value || `cat-${i}`} draggableId={cat.value || `cat-${i}`} index={i}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-xl bg-slate-50 overflow-hidden transition-all duration-200 ${
                                snapshot.isDragging ? 'shadow-lg border-teal-500 scale-[1.02] bg-white z-50' : 'border-charcoal/10'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row gap-1.5 md:gap-3 p-1.5 md:p-2 bg-white border-b border-charcoal/10 items-center">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-center p-1.5 text-slate-300 hover:text-charcoal cursor-grab active:cursor-grabbing transition-colors shrink-0 md:ml-1"
                                >
                                  <GripVertical size={16} />
                                </div>
                                <div className="flex-1 grid grid-cols-[35%_minmax(0,1fr)] md:grid-cols-2 gap-1.5 md:gap-3 ml-1 md:ml-0">
                                  <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-charcoal mb-0.5 ml-2">Category Name</label>
                        <input 
                          type="text" 
                          value={cat.label} 
                          onChange={e => {
                            const updated = [...categories];
                            const oldLabel = updated[i].label;
                            const oldSlug = updated[i].value;
                            updated[i] = { ...updated[i], label: e.target.value };
                            
                            const expectedOldSlug = autoGenerateSlug(oldLabel);
                            if (!oldSlug || oldSlug === expectedOldSlug) {
                               updated[i].value = autoGenerateSlug(e.target.value);
                            }
                            setCategories(updated);
                          }}
                          className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-xs bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-charcoal mb-0.5 ml-2">URL Slug</label>
                        <input 
                          type="text" 
                          value={cat.value} 
                          onChange={e => {
                            const updated = [...categories];
                            updated[i] = { ...updated[i], value: e.target.value };
                            setCategories(updated);
                          }}
                          className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-xs bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-start md:justify-end gap-1.5 w-full md:w-auto pl-[34px] md:pl-0 pt-0.5 md:pt-0 mt-0.5 md:mt-0 pr-2">
                      <button 
                        onClick={() => setExpandedCat(expandedCat === i ? null : i)}
                        className="flex-1 md:flex-none px-3 py-1.5 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-full font-medium text-[11px] transition-colors flex items-center justify-center gap-1.5"
                      >
                        Subcategories ({cat.subcategories?.length || 0})
                        <ChevronDown size={14} className={`transition-transform ${expandedCat === i ? 'rotate-180' : ''}`} />
                      </button>
                      <button 
                        onClick={() => {
                          if(!window.confirm(`Are you sure you want to remove ${cat.label}?`)) return;
                          const newCats = categories.filter((_, idx) => idx !== i);
                          setCategories(newCats);
                        }}
                        className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
                        title="Remove category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedCat === i && (
                    <div className="p-3 md:p-4 bg-slate-100 shadow-inner border-t border-charcoal/10">
                      <div className="space-y-2.5 mb-4">
                        {(cat.subcategories || []).map((sub, subIdx) => (
                          <div key={subIdx} className="flex flex-col gap-1.5 border border-charcoal/10 rounded-xl p-2 bg-white/60 backdrop-blur-sm shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-1.5 items-center">
                              <input 
                                type="text" 
                                placeholder="Label"
                                value={sub.label} 
                                onChange={e => updateSubcategory(i, subIdx, "label", e.target.value)}
                                className="flex-1 w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs bg-white shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
                              />
                              <input 
                                type="text" 
                                placeholder="Slug"
                                value={sub.value} 
                                onChange={e => updateSubcategory(i, subIdx, "value", e.target.value)}
                                className="flex-1 w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs bg-white shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-mono"
                              />
                              <button 
                                onClick={() => removeSubcategory(i, subIdx)}
                                className="p-1.5 md:p-2 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            
                            {/* Sub-subcategories */}
                            <div className="pl-2 md:pl-6 space-y-1.5 mt-0.5">
                              {(sub.subcategories || []).map((subSub, subSubIdx) => (
                                <div key={subSubIdx} className="flex flex-col sm:flex-row gap-1.5 items-center">
                                  <input 
                                    type="text" 
                                    placeholder="Sub-label"
                                    value={subSub.label} 
                                    onChange={e => updateSubcategory(i, subIdx, "label", e.target.value, subSubIdx)}
                                    className="flex-1 w-full px-2 md:px-2.5 py-1.5 text-[11px] md:text-xs bg-white shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-semibold"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Sub-slug"
                                    value={subSub.value} 
                                    onChange={e => updateSubcategory(i, subIdx, "value", e.target.value, subSubIdx)}
                                    className="flex-1 w-full px-2 md:px-2.5 py-1.5 text-[11px] md:text-xs bg-white shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 text-charcoal placeholder:text-slate/60 transition-all font-mono"
                                  />
                                  <button 
                                    onClick={() => removeSubcategory(i, subIdx, subSubIdx)}
                                    className="p-1 md:p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                              <button 
                                onClick={() => addSubcategory(i, subIdx)}
                                className="flex items-center gap-1 text-[10px] uppercase font-bold text-teal-600/70 hover:text-teal-700"
                              >
                                <Plus size={12} /> Add Sub-subcategory
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!cat.subcategories || cat.subcategories.length === 0) && (
                          <div className="text-xs text-slate-500 italic">No subcategories yet.</div>
                        )}
                      </div>
                      <button 
                        onClick={() => addSubcategory(i)}
                        className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                      >
                        <Plus size={14} /> Add Subcategory
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
              {categories.length === 0 && (
                <div className="text-center py-8 text-slate text-sm">No categories found.</div>
              )}
            </div>
          </div>
          <div className="px-4 py-4 md:px-6 md:py-5 border-t border-charcoal/10 bg-cream/20 flex justify-end">
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

    </div>
  )
}
