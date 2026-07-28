"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { createBanner, deleteBanner, updateBannerOrder, getFileSize, updateBannerTitle, getCloudinarySignature } from "@/actions/admin"
import { getAnnouncementBanner, saveAnnouncementBanner } from "@/actions/system"
import imageCompression from 'browser-image-compression';
import { toast } from "sonner"
import { Upload, X, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import Image from "next/image"
import { useRouter } from "next/navigation"

function FileSizeDisplay({ url }: { url: string }) {
  const [size, setSize] = useState<string | null>(null)
  
  useEffect(() => {
    getFileSize(url).then(bytes => {
      if (bytes) {
        const mb = bytes / (1024 * 1024)
        if (mb >= 1) setSize(`${mb.toFixed(2)} MB`)
        else setSize(`${(bytes / 1024).toFixed(0)} KB`)
      } else {
        setSize("Unknown size")
      }
    })
  }, [url])

  if (!size) return <span className="text-xs text-slate-400">Loading size...</span>
  return <span className="text-sm font-medium text-slate bg-white px-3 py-1 rounded-lg border border-charcoal/5 shadow-sm">{size}</span>
}

function BannerTitleInput({ banner }: { banner: any }) {
  const [title, setTitle] = useState(banner.title || "")
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSave = async () => {
    if (title === banner.title) return
    setIsSaving(true)
    const res = await updateBannerTitle(banner.id, title)
    if (res.success) toast.success("Tag updated")
    else toast.error("Failed to update tag")
    setIsSaving(false)
  }

  return (
    <div className="flex gap-2 items-center mt-2">
      <input 
        type="text" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        onBlur={handleSave}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        placeholder="Enter tag (e.g. Cottons)" 
        className="text-sm px-3 py-1.5 rounded-lg border border-charcoal/10 bg-white focus:outline-none focus:border-teal-500 w-full sm:w-48"
      />
      {isSaving && <Loader2 size={14} className="animate-spin text-slate-400" />}
    </div>
  )
}

export function BannerManager({ banners }: { banners: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [uploadingType, setUploadingType] = useState<"hero" | "carousel" | null>(null)
  
  const [announcement, setAnnouncement] = useState({ text: "", isActive: false });
  const [isLoadingAnnouncement, setIsLoadingAnnouncement] = useState(true);

  useEffect(() => {
    getAnnouncementBanner().then((data) => {
      if (data) setAnnouncement(data);
      setIsLoadingAnnouncement(false);
    });
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

  const heroBanners = banners.filter(b => b.type === "hero").sort((a, b) => a.order - b.order)
  const carouselBanners = banners.filter(b => b.type === "carousel").sort((a, b) => a.order - b.order)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "hero" | "carousel") => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingType(type)
    try {
      let fileToUpload = file;
      
      // Always compress images to ensure fast loading and save Cloudinary storage
      toast.info("Optimizing image for fast loading...");
      const options = {
        maxSizeMB: 0.3, // Compress to ~300KB max
        maxWidthOrHeight: 1600, // Limit dimensions for web
        useWebWorker: true,
        initialQuality: 0.8
      }
      fileToUpload = await imageCompression(file, options);

      // 1. Get secure upload signature from our server
      const sigData = await getCloudinarySignature()
      if (!sigData.success || !sigData.signature || !sigData.apiKey || !sigData.cloudName) {
        throw new Error("Failed to get upload signature from server")
      }

      // 2. Upload file directly to Cloudinary from the browser!
      const formData = new FormData()
      formData.append("file", fileToUpload)
      formData.append("api_key", sigData.apiKey)
      formData.append("timestamp", sigData.timestamp!.toString())
      formData.append("signature", sigData.signature)
      formData.append("folder", "rk-fabrics/banners")

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message || "Upload to Cloudinary failed")
      }

      // 3. Save the returned URL to our database
      const createData = new FormData()
      createData.append("type", type)
      createData.append("imageUrl", uploadData.secure_url)

      const createRes = await createBanner(createData)
      if (createRes.success) {
        toast.success(`${type} image added successfully!`)
      } else {
        throw new Error(createRes.error || "Failed to save banner")
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploadingType(null)
      if (e.target) e.target.value = ''
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm("Remove this image?")) return
    startTransition(async () => {
      const res = await deleteBanner(id)
      if (res.success) toast.success("Image removed")
      else toast.error("Failed to remove image")
    })
  }

  const handleDragEnd = (result: DropResult, typeBanners: any[]) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    const newItems = Array.from(typeBanners);
    const [draggedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, draggedItem);
    
    startTransition(async () => {
      await updateBannerOrder(newItems.map(b => b.id));
      toast.success("Order updated");
    });
  }

  const BannerList = ({ title, items, type }: { title: string, items: any[], type: "hero" | "carousel" }) => (
    <div className="bg-white md:rounded-3xl border-y md:border border-charcoal/10 p-4 sm:p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:shadow-sm -mx-4 sm:mx-0 mb-6 md:mb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-charcoal/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-charcoal">{title}</h3>
          <p className="text-sm text-slate mt-1">
            {items.length} of 7 images • Recommended Size: {type === "hero" ? "1920 × 800px" : "1200 × 600px"}
          </p>
        </div>
        <label className={`
          flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-neo-btn transition-all cursor-pointer
          ${uploadingType === type || isPending ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-charcoal text-white hover:bg-black hover:shadow-neo-pressed'}
        `}>
          {uploadingType === type ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Upload Image
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            disabled={uploadingType === type || isPending}
            onClick={(e) => {
              if (items.length >= 7) {
                e.preventDefault();
                toast.error(`Maximum 7 images allowed for ${type} section.`);
              }
            }}
            onChange={(e) => handleUpload(e, type)} 
          />
        </label>
      </div>

      <DragDropContext onDragEnd={(res) => handleDragEnd(res, items)}>
        <Droppable droppableId={`${type}-banners`}>
          {(provided) => (
            <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
              {items.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-charcoal/20">
                  <ImageIcon className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-slate font-medium">No images added yet.</p>
                </div>
              )}
              
              {items.map((banner, index) => (
                <Draggable key={banner.id} draggableId={banner.id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 sm:gap-4 bg-slate-50 p-2 sm:p-3 rounded-2xl border transition-all duration-200 ${
                        snapshot.isDragging ? 'shadow-lg border-teal-500 scale-[1.02] bg-white z-50' : 'border-charcoal/5 group'
                      }`}
                    >
                      <div 
                        {...provided.dragHandleProps}
                        className="flex flex-col gap-1 px-1 sm:px-2 text-slate-300 hover:text-charcoal cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="relative w-20 h-14 sm:w-32 sm:h-20 rounded-xl overflow-hidden shadow-inner bg-charcoal/5 flex-shrink-0">
                        <Image src={banner.imageUrl} alt="Banner" fill className="object-cover" />
                      </div>

                      <div className="flex-grow pl-1 sm:pl-4 flex flex-col justify-center overflow-hidden">
                        <div>
                          <FileSizeDisplay url={banner.imageUrl} />
                        </div>
                        {type === "carousel" && <BannerTitleInput banner={banner} />}
                      </div>

                      <button 
                        onClick={() => handleDelete(banner.id)}
                        disabled={isPending}
                        className="p-2 text-rose-500 hover:bg-rose-100 rounded-full transition-colors mr-2 shrink-0"
                        title="Remove"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
            Banner Settings
          </h2>
          <p className="text-slate mt-1 text-sm">Manage your store's hero and carousel images.</p>
        </div>
      </div>
      
      <div className="bg-[#f6fafd] md:rounded-3xl border-y md:border border-charcoal/10 p-4 sm:p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:shadow-sm mb-8 -mx-4 sm:mx-0">
        <h3 className="text-xl font-bold text-charcoal mb-4">Announcement Banner (Top Header)</h3>
        {isLoadingAnnouncement && !announcement.text ? (
          <p className="text-sm text-slate animate-pulse">Loading...</p>
        ) : (
          <div className="space-y-6 w-full">
            
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="w-full min-w-0">
                <label className="block text-sm font-bold text-charcoal mb-2">Banner Content (HTML supported)</label>
                <textarea 
                  value={announcement.text}
                  onChange={(e) => setAnnouncement({...announcement, text: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-sm font-mono h-32"
                  placeholder="🎉 <strong>FREE SHIPPING</strong> on orders above ₹999... ✨"
                />
              </div>
              
              <div className="w-full h-full flex flex-col min-w-0">
                <label className="block text-sm font-bold text-charcoal mb-2">Live Preview</label>
                <div className="flex-1 border border-charcoal/10 rounded-xl overflow-hidden bg-cream flex flex-col justify-center min-h-[8rem]">
                  <div className="w-full bg-charcoal text-white text-xs py-2 font-medium relative z-10 marquee-container">
                    <div className="marquee-content">
                      <span dangerouslySetInnerHTML={{ __html: announcement.text || "Your text here..." }} />
                      <span className="mx-16 opacity-50">✦</span>
                    </div>
                    <div className="marquee-content" aria-hidden="true">
                      <span dangerouslySetInnerHTML={{ __html: announcement.text || "Your text here..." }} />
                      <span className="mx-16 opacity-50">✦</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-charcoal/10 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={announcement.isActive}
                  onChange={(e) => setAnnouncement({...announcement, isActive: e.target.checked})}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-600"
                />
                <span className="text-sm font-bold text-charcoal">Show Announcement Banner</span>
              </label>
              
              <button 
                onClick={handleSaveAnnouncement}
                disabled={isLoadingAnnouncement}
                className="w-full sm:w-auto btn-primary flex flex-row items-center justify-center gap-2 py-2.5 px-6 disabled:opacity-50 text-sm font-semibold whitespace-nowrap"
              >
                <span>Save Announcement</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <BannerList title="Hero Images" items={heroBanners} type="hero" />
        <BannerList title="Carousel Images" items={carouselBanners} type="carousel" />
      </div>
    </div>
  )
}
