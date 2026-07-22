"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus, X, Tag, Scissors } from "lucide-react"
import { saveStoreTaxonomy } from "@/actions/system"
import { cn } from "@/lib/utils"

interface Option {
  value: string;
  label: string;
  showInFooter?: boolean;
}

interface TaxonomyManagerProps {
  initialCategories: Option[];
  initialFabrics: Option[];
}

export function TaxonomyManager({ initialCategories, initialFabrics }: TaxonomyManagerProps) {
  const [categories, setCategories] = useState<Option[]>(initialCategories)
  const [fabrics, setFabrics] = useState<Option[]>(initialFabrics)
  const [isPending, startTransition] = useTransition()

  const [newCatLabel, setNewCatLabel] = useState("")
  const [newCatValue, setNewCatValue] = useState("")
  const [newCatFooter, setNewCatFooter] = useState(false)
  const [newFabLabel, setNewFabLabel] = useState("")
  const [newFabValue, setNewFabValue] = useState("")
  const [newFabFooter, setNewFabFooter] = useState(false)

  const getFooterCount = () => {
    return categories.filter(c => c.showInFooter).length + fabrics.filter(f => f.showInFooter).length;
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
    if (newCatFooter && getFooterCount() >= 5) {
      toast.error("Maximum 5 items allowed in footer.");
      return;
    }
    setCategories([...categories, { value: newCatValue, label: newCatLabel, showInFooter: newCatFooter }])
    setNewCatLabel("")
    setNewCatValue("")
    setNewCatFooter(false)
  }

  const handleAddFabric = () => {
    if (!newFabLabel || !newFabValue) return
    if (fabrics.some(f => f.value === newFabValue)) {
      toast.error("A fabric with this URL slug already exists.")
      return
    }
    if (newFabFooter && getFooterCount() >= 5) {
      toast.error("Maximum 5 items allowed in footer.");
      return;
    }
    setFabrics([...fabrics, { value: newFabValue, label: newFabLabel, showInFooter: newFabFooter }])
    setNewFabLabel("")
    setNewFabValue("")
    setNewFabFooter(false)
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveStoreTaxonomy(categories, fabrics)
      if (res.success) {
        toast.success("Categories & Fabrics saved successfully!")
      } else {
        toast.error(res.error || "Failed to save taxonomy.")
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal flex items-center gap-2">
            <Tag size={24} className="text-teal-600" />
            Categories & Fabrics Manager
          </h2>
          <p className="text-sm text-slate mt-1">
            Manage the master list of categories and fabrics. These will be available when adding products and as filters on the Shop page.
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className={cn(
            "btn-primary",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPending ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal/10 bg-cream/50 flex items-center gap-2">
            <Tag size={18} className="text-teal-600" />
            <h3 className="font-bold text-charcoal">Product Categories</h3>
          </div>
          
          <div className="p-6">
            <div className="flex gap-2 mb-6 items-end">
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
                  className="w-full bg-white border border-charcoal/20 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                  placeholder="e.g. Summer Collection"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">URL Slug</label>
                <input 
                  type="text" 
                  value={newCatValue}
                  onChange={(e) => setNewCatValue(e.target.value)}
                  className="w-full bg-slate/5 border border-charcoal/20 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm font-mono text-teal-700"
                  placeholder="e.g. summer-collection"
                />
              </div>
              <div className="flex flex-col items-center justify-center">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">Footer</label>
                <input 
                  type="checkbox"
                  checked={newCatFooter}
                  onChange={(e) => setNewCatFooter(e.target.checked)}
                  className="w-5 h-5 rounded border-charcoal/20 text-teal-600 focus:ring-teal-500 mb-2 cursor-pointer"
                  title="Add in footer"
                />
              </div>
              <button 
                onClick={handleAddCategory}
                disabled={!newCatLabel || !newCatValue}
                className="bg-teal-600 text-white rounded-xl h-[42px] px-4 hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-charcoal/10 hover:border-teal-500/30 bg-white group transition-colors">
                  <div>
                    <div className="font-medium text-sm text-charcoal">{cat.label}</div>
                    <div className="text-xs font-mono text-teal-600/70 mt-0.5">{cat.value}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!cat.showInFooter}
                        onChange={(e) => {
                          if (e.target.checked && getFooterCount() >= 5) {
                            toast.error("Maximum 5 items allowed in footer.");
                            return;
                          }
                          const newCats = [...categories];
                          newCats[i].showInFooter = e.target.checked;
                          setCategories(newCats);
                        }}
                        className="w-4 h-4 rounded border-charcoal/20 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-[10px] uppercase font-bold text-slate">Footer</span>
                    </label>
                    <button 
                      onClick={() => setCategories(categories.filter((_, idx) => idx !== i))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-rose hover:bg-rose/10 transition-colors"
                      title="Remove category"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-center py-8 text-slate text-sm">No categories found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Fabrics Section */}
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal/10 bg-cream/50 flex items-center gap-2">
            <Scissors size={18} className="text-teal-600" />
            <h3 className="font-bold text-charcoal">Fabric Options</h3>
          </div>
          
          <div className="p-6">
            <div className="flex gap-2 mb-6 items-end">
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
                  className="w-full bg-white border border-charcoal/20 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                  placeholder="e.g. Organza"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">URL Slug</label>
                <input 
                  type="text" 
                  value={newFabValue}
                  onChange={(e) => setNewFabValue(e.target.value)}
                  className="w-full bg-slate/5 border border-charcoal/20 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm font-mono text-teal-700"
                  placeholder="e.g. organza"
                />
              </div>
              <div className="flex flex-col items-center justify-center">
                <label className="text-xs font-semibold text-slate uppercase mb-1 block">Footer</label>
                <input 
                  type="checkbox"
                  checked={newFabFooter}
                  onChange={(e) => setNewFabFooter(e.target.checked)}
                  className="w-5 h-5 rounded border-charcoal/20 text-teal-600 focus:ring-teal-500 mb-2 cursor-pointer"
                  title="Add in footer"
                />
              </div>
              <button 
                onClick={handleAddFabric}
                disabled={!newFabLabel || !newFabValue}
                className="bg-teal-600 text-white rounded-xl h-[42px] px-4 hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {fabrics.map((fab, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-charcoal/10 hover:border-teal-500/30 bg-white group transition-colors">
                  <div>
                    <div className="font-medium text-sm text-charcoal">{fab.label}</div>
                    <div className="text-xs font-mono text-teal-600/70 mt-0.5">{fab.value}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!fab.showInFooter}
                        onChange={(e) => {
                          if (e.target.checked && getFooterCount() >= 5) {
                            toast.error("Maximum 5 items allowed in footer.");
                            return;
                          }
                          const newFabs = [...fabrics];
                          newFabs[i].showInFooter = e.target.checked;
                          setFabrics(newFabs);
                        }}
                        className="w-4 h-4 rounded border-charcoal/20 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-[10px] uppercase font-bold text-slate">Footer</span>
                    </label>
                    <button 
                      onClick={() => setFabrics(fabrics.filter((_, idx) => idx !== i))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-rose hover:bg-rose/10 transition-colors"
                      title="Remove fabric"
                    >
                      <X size={16} />
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
    </div>
  )
}
