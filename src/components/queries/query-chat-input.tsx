"use client"

import { useState, useRef } from "react"
import { Send, Paperclip, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { uploadQueryAttachment } from "@/actions/upload"
import { toast } from "sonner"

interface QueryChatInputProps {
  onReply: (formData: FormData) => Promise<void>
}

export function QueryChatInput({ onReply }: QueryChatInputProps) {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px' // Reset to h-14
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px'
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !file) return

    setIsSubmitting(true)
    try {
      let attachmentUrl = ""
      
      if (file) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        
        const uploadResult = await uploadQueryAttachment(formData)
        setIsUploading(false)
        
        if (uploadResult.success && uploadResult.url) {
          attachmentUrl = uploadResult.url
        } else {
          toast.error(uploadResult.error || "Failed to upload image")
          setIsSubmitting(false)
          return
        }
      }

      const submitData = new FormData()
      if (message.trim()) {
        submitData.append("message", message.trim())
      }
      if (attachmentUrl) {
        submitData.append("attachment", attachmentUrl)
      }
      
      await onReply(submitData)
      
      // Reset form
      setMessage("")
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px'
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to send message")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <div className="shrink-0 mt-auto bg-white pt-3 pb-2 md:pt-6 md:pb-0 border-t border-charcoal/10 flex flex-col justify-center">
      {file && (
        <div className="mb-3 mx-2 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-charcoal/10 w-max">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-lg overflow-hidden shrink-0 border border-charcoal/10">
            {URL.createObjectURL(file) ? (
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={16} className="text-slate-400" />
            )}
          </div>
          <div className="text-xs">
            <p className="font-bold text-charcoal truncate max-w-[150px]">{file.name}</p>
            <p className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button 
            type="button" 
            onClick={() => {
              setFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 shrink-0 ml-2 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 items-center w-full">
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting || isUploading}
          className="btn-icon !w-14 !h-14 shrink-0 disabled:opacity-50 text-slate-500 hover:text-teal-600 transition-colors"
        >
          <Paperclip size={24} className="stroke-[1.5]" />
        </button>
        
        <div className={`flex items-center flex-1 rounded-full border border-white/40 bg-[var(--color-cream)] pl-6 pr-2 h-14 overflow-hidden transition-all duration-200 ${isFocused ? 'shadow-neo-pressed scale-[0.99]' : 'shadow-neo-btn'}`}>
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustHeight()
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your reply here..."
            disabled={isSubmitting || isUploading}
            className="flex-1 bg-transparent border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none resize-none h-14 py-4 disabled:opacity-50 text-[16px] text-charcoal placeholder:text-slate/60 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          />
          
          <button 
            type="submit" 
            disabled={isSubmitting || (!message.trim() && !file)}
            className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-500 hover:text-teal-600 transition-colors disabled:opacity-50"
          >
            {isUploading || isSubmitting ? (
              <Loader2 size={22} className="animate-spin stroke-[1.5]" />
            ) : (
              <Send size={22} className="stroke-[1.5] translate-x-[-1px] translate-y-[1px]" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
