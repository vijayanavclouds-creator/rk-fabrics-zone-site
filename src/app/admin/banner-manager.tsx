"use client"

import { useState, useEffect } from "react"
import { 
  getAnnouncementBanner, 
  saveAnnouncementBanner, 
  getHome2HtmlSettings, 
  saveHome2HtmlSettings,
  getHtmlRecords,
  createHtmlRecord,
  updateHtmlRecord,
  deleteHtmlRecord
} from "@/actions/system"
import { DEFAULT_HERO_HTML, DEFAULT_CAROUSEL_HTML } from "./default-home2-html"
import { toast } from "sonner"
import { Loader2, Save, Plus, X, Trash, Play, Copy, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

export function BannerManager({ banners }: { banners: any[] }) {
  const router = useRouter()
  
  const [announcement, setAnnouncement] = useState({ text: "", isActive: false });
  const [isLoadingAnnouncement, setIsLoadingAnnouncement] = useState(true);

  // HTML State
  const [heroHtml, setHeroHtml] = useState("")
  const [carouselHtml, setCarouselHtml] = useState("")
  const [savingHtml, setSavingHtml] = useState(false)
  
  // Records State
  const [records, setRecords] = useState<any[]>([])
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null) // Used for fullscreen preview
  const [newRecord, setNewRecord] = useState({ title: "", type: "Hero HTML", code: "" })
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [isSavingRecord, setIsSavingRecord] = useState(false)

  const loadRecords = async () => {
    const res = await getHtmlRecords()
    if (res.success && res.records) setRecords(res.records)
  }

  useEffect(() => {
    getAnnouncementBanner().then((data) => {
      if (data) setAnnouncement(data);
      setIsLoadingAnnouncement(false);
    });
    
    getHome2HtmlSettings().then(res => {
      if (res.success) {
        setHeroHtml(res.heroHtml || DEFAULT_HERO_HTML)
        setCarouselHtml(res.carouselHtml || DEFAULT_CAROUSEL_HTML)
      }
    });

    loadRecords()
  }, []);

  const handleSaveAnnouncement = async () => {
    setIsLoadingAnnouncement(true);
    const res = await saveAnnouncementBanner(announcement);
    setIsLoadingAnnouncement(false);
    if (res.success) {
      toast.success("Announcement banner updated");
      router.refresh();
    }
    else toast.error("Failed to update banner");
  };

  const handleSaveHtml = async () => {
    setSavingHtml(true)
    const res = await saveHome2HtmlSettings(heroHtml, carouselHtml)
    if (res.success) toast.success("HTML Settings Saved")
    else toast.error("Failed to save HTML")
    setSavingHtml(false)
  }

  const handleSaveRecord = async () => {
    if (!newRecord.title || !newRecord.code) return toast.error("Title and HTML Code are required")
    setIsSavingRecord(true)
    let res;
    if (editingRecordId) {
      res = await updateHtmlRecord(editingRecordId, newRecord.title, newRecord.type, newRecord.code)
    } else {
      res = await createHtmlRecord(newRecord.title, newRecord.type, newRecord.code)
    }
    setIsSavingRecord(false)
    if (res.success) {
      toast.success(editingRecordId ? "Record updated successfully" : "Record saved successfully")
      setIsAddModalOpen(false)
      setNewRecord({ title: "", type: "Hero HTML", code: "" })
      setEditingRecordId(null)
      loadRecords()
    } else {
      toast.error(editingRecordId ? "Failed to update record" : "Failed to save record")
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    const res = await deleteHtmlRecord(id)
    if (res.success) {
      toast.success("Record deleted")
      loadRecords()
    } else {
      toast.error("Failed to delete record")
    }
  }

  const handleUseRecord = (record: any) => {
    if (record.type === "Hero HTML") {
      setHeroHtml(record.code)
    } else {
      setCarouselHtml(record.code)
    }
    
    // Copy to clipboard as well
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(record.code).then(() => {
        toast.success(`Loaded into editor & copied to clipboard!`)
      }).catch(() => {
        toast.success(`Loaded "${record.title}" into ${record.type} editor`)
      });
    } else {
      toast.success(`Loaded "${record.title}" into ${record.type} editor`)
    }
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
            Dynamic Homepage (Home 2)
          </h2>
          <p className="text-slate mt-1 text-sm">Manage dynamic HTML and AI generation for your secondary home page.</p>
        </div>
        <button 
          onClick={handleSaveHtml}
          disabled={savingHtml}
          className="btn-primary flex items-center gap-2"
        >
          {savingHtml ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save HTML Settings
        </button>
      </div>

      {/* HTML Records Section */}
      <div className="bg-white md:rounded-3xl border-y md:border border-charcoal/10 p-4 sm:p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:shadow-sm -mx-4 sm:mx-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-charcoal">Saved HTML Templates</h3>
          <button 
            onClick={() => {
              setEditingRecordId(null)
              setNewRecord({ title: "", type: "Hero HTML", code: "" })
              setIsAddModalOpen(true)
            }}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-charcoal hover:bg-charcoal-light px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
        
        {records.length === 0 ? (
          <div className="text-center py-8 text-slate text-sm bg-slate-50 rounded-xl border border-charcoal/10">
            No HTML records saved yet. Create one for future reference!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate border-b border-charcoal/10">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-xl">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Last Modified</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-charcoal">{record.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${record.type === 'Hero HTML' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate">
                      {new Date(record.updatedAt).toLocaleDateString()} {new Date(record.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setPreviewHtml(record.code)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition-colors" title="Preview Fullscreen">
                          <Play size={16} />
                        </button>
                        <button onClick={() => handleUseRecord(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Use this code">
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingRecordId(record.id)
                            setNewRecord({ title: record.title, type: record.type, code: record.code })
                            setIsAddModalOpen(true)
                          }} 
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors" 
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteRecord(record.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Section (Side-by-side on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* HTML Editor Section for Hero */}
        <div className="bg-white md:rounded-3xl border-y md:border border-charcoal/10 p-4 sm:p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:shadow-sm -mx-4 sm:mx-0 flex flex-col h-[700px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-lg font-bold text-charcoal">Hero Section HTML</h3>
            <button 
              onClick={() => setPreviewHtml(heroHtml)} 
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Play size={14} /> Preview
            </button>
          </div>
          
          <textarea
            value={heroHtml}
            onChange={e => setHeroHtml(e.target.value)}
            className="w-full flex-1 p-4 rounded-xl border border-charcoal/20 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-xs sm:text-sm font-mono custom-scrollbar resize-none"
            placeholder="<div>Your custom Hero HTML here...</div>"
          />
        </div>

        {/* HTML Editor Section for Carousel */}
        <div className="bg-white md:rounded-3xl border-y md:border border-charcoal/10 p-4 sm:p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:shadow-sm -mx-4 sm:mx-0 flex flex-col h-[700px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-lg font-bold text-charcoal">Carousel Section HTML</h3>
            <button 
              onClick={() => setPreviewHtml(carouselHtml)} 
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Play size={14} /> Preview
            </button>
          </div>
          
          <textarea
            value={carouselHtml}
            onChange={e => setCarouselHtml(e.target.value)}
            className="w-full flex-1 p-4 rounded-xl border border-charcoal/20 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-xs sm:text-sm font-mono custom-scrollbar resize-none"
            placeholder="<div>Your custom Carousel HTML here...</div>"
          />
        </div>
      </div>

      {/* --- ADD RECORD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-charcoal/10 shrink-0">
              <h3 className="text-lg font-bold text-charcoal">{editingRecordId ? "Edit HTML Template" : "Add New HTML Template"}</h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingRecordId(null)
                }} 
                className="text-slate hover:text-charcoal transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-charcoal">Template Title</label>
                  <input 
                    type="text" 
                    value={newRecord.title}
                    onChange={e => setNewRecord({...newRecord, title: e.target.value})}
                    placeholder="e.g. Summer Sale Hero"
                    className="w-full px-3 py-2 rounded-lg border border-charcoal/20 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-charcoal">Template Type</label>
                  <select 
                    value={newRecord.type}
                    onChange={e => setNewRecord({...newRecord, type: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-charcoal/20 focus:outline-none focus:border-teal-600"
                  >
                    <option value="Hero HTML">Hero HTML</option>
                    <option value="Carousel HTML">Carousel HTML</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5 h-64 md:h-96 flex flex-col">
                <label className="text-sm font-semibold text-charcoal shrink-0">HTML Code</label>
                <textarea 
                  value={newRecord.code}
                  onChange={e => setNewRecord({...newRecord, code: e.target.value})}
                  placeholder="Paste your HTML code here..."
                  className="w-full flex-1 p-3 rounded-lg border border-charcoal/20 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 font-mono text-xs custom-scrollbar resize-none"
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-charcoal/10 flex justify-end gap-3 shrink-0 bg-slate-50">
              <button 
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingRecordId(null)
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-charcoal/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRecord}
                disabled={isSavingRecord}
                className="btn-primary flex items-center gap-2"
              >
                {isSavingRecord ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN PREVIEW MODAL --- */}
      {previewHtml !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center px-6 py-4 border-b border-charcoal/10 bg-white shadow-sm shrink-0">
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <Play size={18} className="text-teal-600" /> Live Preview Mode
            </h3>
            <button 
              onClick={() => setPreviewHtml(null)} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal text-white hover:bg-charcoal-light transition-colors text-sm font-semibold"
            >
              <X size={16} /> Close Preview
            </button>
          </div>
          
          <div className="flex-1 w-full bg-slate-50 overflow-hidden relative">
            <iframe 
              srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><style>body { margin: 0; overflow-x: hidden; }</style></head><body>${previewHtml}</body></html>`}
              className="w-full h-full border-none absolute inset-0"
              title="HTML Preview"
            />
          </div>
        </div>
      )}

    </div>
  )
}
