"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Plus, X, Tag, Scissors, ChevronDown, Trash2 } from "lucide-react"
import { saveStoreTaxonomy } from "@/actions/system"
import { cn } from "@/lib/utils"

export interface TaxonomyOption {
  value: string;
  label: string;
  subcategories?: { label: string, value: string }[];
}

interface TaxonomyManagerProps {
  initialCategories: TaxonomyOption[];
  initialFabrics: TaxonomyOption[];
}

export function TaxonomyManager({ initialCategories, initialFabrics }: TaxonomyManagerProps) {
  const [categories, setCategories] = useState<TaxonomyOption[]>(initialCategories)
  const [fabrics, setFabrics] = useState<TaxonomyOption[]>(initialFabrics)
  const [savedCategories, setSavedCategories] = useState<TaxonomyOption[]>(initialCategories)
  const [savedFabrics, setSavedFabrics] = useState<TaxonomyOption[]>(initialFabrics)
  const [isPending, startTransition] = useTransition()

  const [newCatLabel, setNewCatLabel] = useState("")
  const [newCatValue, setNewCatValue] = useState("")
  const [newFabLabel, setNewFabLabel] = useState("")
  const [newFabValue, setNewFabValue] = useState("")

  const [expandedCat, setExpandedCat] = useState<number | null>(null)

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

  const handleAddFabric = () => {
    if (!newFabLabel || !newFabValue) return
    if (fabrics.some(f => f.value === newFabValue)) {
      toast.error("A fabric with this URL slug already exists.")
      return
    }
    setFabrics([...fabrics, { value: newFabValue, label: newFabLabel }])
    setNewFabLabel("")
    setNewFabValue("")
  }

  const addSubcategory = (catIndex: number) => {
    const updated = [...categories]
    if (!updated[catIndex].subcategories) {
      updated[catIndex].subcategories = []
    }
    updated[catIndex].subcategories.push({ label: "New Subcategory", value: "new-subcategory" })
    setCategories(updated)
    setExpandedCat(catIndex)
  }

  const updateSubcategory = (catIndex: number, subIndex: number, field: "label" | "value", val: string) => {
    const updated = [...categories]
    const subcats = updated[catIndex].subcategories
    if (subcats) {
      subcats[subIndex] = { ...subcats[subIndex], [field]: val }
      if (field === "label") {
        // Auto update slug if it hasn't been manually set or matches old slug
        // Simple approach: just update the value if it's currently empty
        if (!subcats[subIndex].value) {
          subcats[subIndex].value = autoGenerateSlug(val);
        }
      }
      setCategories(updated)
    }
  }

  const removeSubcategory = (catIndex: number, subIndex: number) => {
    const updated = [...categories]
    if (updated[catIndex].subcategories) {
      updated[catIndex].subcategories.splice(subIndex, 1)
      setCategories(updated)
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      // Clean up empty subcategories
      const cleanedCats = categories.map(c => ({
        ...c,
        subcategories: c.subcategories?.filter(s => s.label.trim() !== "" && s.value.trim() !== "")
      }))

      const res = await saveStoreTaxonomy(cleanedCats, fabrics)
      if (res.success) {
        toast.success("Categories & Fabrics saved successfully!")
        setCategories(cleanedCats)
        setSavedCategories(cleanedCats);
        setSavedFabrics(fabrics);
        wasDirty.current = false;
      } else {
        toast.error(res.error || "Failed to save taxonomy.")
      }
    })
  }

  const hasChanges = JSON.stringify(categories) !== JSON.stringify(savedCategories) || JSON.stringify(fabrics) !== JSON.stringify(savedFabrics);
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-white rounded-none md:rounded-3xl border-y md:border-x border-charcoal/10 shadow-sm overflow-hidden -mx-4 md:mx-0">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-charcoal/10 bg-cream/50 flex items-center gap-2">
            <Tag size={18} className="text-teal-600" />
            <h3 className="font-bold text-charcoal text-sm md:text-base">Product Categories</h3>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">Display Name</label>
                <input 
                  type="text" 
                  value={newCatLabel}
                  onChange={(e) => {
                    setNewCatLabel(e.target.value);
                    if (!newCatValue || newCatValue === autoGenerateSlug(newCatLabel)) {
                      setNewCatValue(autoGenerateSlug(e.target.value));
                    }
                  }}
                  className="w-full bg-white border border-charcoal/20 rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-xs md:text-sm shadow-sm"
                  placeholder="e.g. Men"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">URL Slug</label>
                <input 
                  type="text" 
                  value={newCatValue}
                  onChange={(e) => setNewCatValue(e.target.value)}
                  className="w-full bg-slate/5 border border-charcoal/20 rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-xs md:text-sm font-mono text-teal-700 shadow-sm"
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

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((cat, i) => (
                <div key={i} className="border border-charcoal/10 rounded-2xl overflow-hidden bg-white hover:border-teal-500/30 transition-colors shadow-sm">
                  <div className="flex items-center justify-between p-3 md:p-4">
                    <div>
                      <div className="font-bold text-sm md:text-base text-charcoal">{cat.label}</div>
                      <div className="text-xs font-mono text-teal-600/70 mt-1">{cat.value}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setExpandedCat(expandedCat === i ? null : i)}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-lg font-medium text-xs md:text-sm transition-colors flex items-center gap-2"
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
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-rose hover:bg-rose/10 transition-colors bg-rose-50/50"
                        title="Remove category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedCat === i && (
                    <div className="p-3 md:p-4 bg-slate-50 border-t border-charcoal/10">
                      <div className="space-y-3 mb-4">
                        {(cat.subcategories || []).map((sub, subIdx) => (
                          <div key={subIdx} className="flex flex-col sm:flex-row gap-2">
                            <input 
                              type="text" 
                              placeholder="Label"
                              value={sub.label} 
                              onChange={e => updateSubcategory(i, subIdx, "label", e.target.value)}
                              className="flex-1 px-3 py-2 text-xs md:text-sm bg-white border border-charcoal/10 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Slug"
                              value={sub.value} 
                              onChange={e => updateSubcategory(i, subIdx, "value", e.target.value)}
                              className="flex-1 px-3 py-2 text-xs md:text-sm bg-white border border-charcoal/10 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none font-mono text-teal-700"
                            />
                            <button 
                              onClick={() => removeSubcategory(i, subIdx)}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                            >
                              <X size={18} />
                            </button>
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
              ))}
              {categories.length === 0 && (
                <div className="text-center py-8 text-slate text-sm">No categories found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Fabrics Section */}
        <div className="bg-white rounded-none md:rounded-3xl border-y md:border-x border-charcoal/10 shadow-sm overflow-hidden -mx-4 md:mx-0">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-charcoal/10 bg-cream/50 flex items-center gap-2">
            <Scissors size={18} className="text-teal-600" />
            <h3 className="font-bold text-charcoal text-sm md:text-base">Fabric Options</h3>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">Display Name</label>
                <input 
                  type="text" 
                  value={newFabLabel}
                  onChange={(e) => {
                    setNewFabLabel(e.target.value);
                    if (!newFabValue || newFabValue === autoGenerateSlug(newFabLabel)) {
                      setNewFabValue(autoGenerateSlug(e.target.value));
                    }
                  }}
                  className="w-full bg-white border border-charcoal/20 rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-xs md:text-sm shadow-sm"
                  placeholder="e.g. Organza"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">URL Slug</label>
                <input 
                  type="text" 
                  value={newFabValue}
                  onChange={(e) => setNewFabValue(e.target.value)}
                  className="w-full bg-slate/5 border border-charcoal/20 rounded-full px-3 py-2 md:px-5 md:py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-xs md:text-sm font-mono text-teal-700 shadow-sm"
                  placeholder="e.g. organza"
                />
              </div>
              <button 
                onClick={handleAddFabric}
                disabled={!newFabLabel || !newFabValue}
                className="btn-icon !w-8 !h-8 md:!w-10 md:!h-10 text-teal-600 disabled:opacity-50 shrink-0 mb-0.5 md:mb-1 ml-1 md:ml-2"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {fabrics.map((fab, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 md:px-5 md:py-3 rounded-full border border-charcoal/10 hover:border-teal-500/30 bg-white group transition-colors shadow-sm">
                  <div>
                    <div className="font-medium text-[11px] md:text-sm text-charcoal">{fab.label}</div>
                    <div className="text-[9px] md:text-xs font-mono text-teal-600/70 mt-0.5">{fab.value}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const newFabs = fabrics.filter((_, idx) => idx !== i);
                        setFabrics(newFabs);
                      }}
                      className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-rose hover:bg-rose/10 transition-colors"
                      title="Remove fabric"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {fabrics.length === 0 && (
                <div className="text-center py-8 text-slate text-sm">No fabrics found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className={cn(
            "btn-primary px-8 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all",
            isPending && "opacity-50 cursor-not-allowed shadow-none"
          )}
        >
          {isPending ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  )
}
