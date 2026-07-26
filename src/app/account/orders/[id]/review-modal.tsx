"use client"

import { useState } from "react"
import { submitOrderReview } from "@/actions/reviews"
import { toast } from "sonner"
import { Star, X } from "lucide-react"

interface ReviewModalProps {
  productId: string
  orderItemId: string
  productName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReviewModal({ productId, orderItemId, productName, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setLoading(true)
    try {
      const res = await submitOrderReview({
        productId,
        orderItemId,
        rating,
        comment,
      })

      if (res.success) {
        toast.success("Review submitted successfully!")
        onSuccess()
      } else {
        toast.error(res.error || "Failed to submit review")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate hover:text-charcoal transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-2">
          Rate & Review
        </h2>
        <p className="text-slate text-sm mb-6">
          How was your experience with <span className="font-bold">{productName}</span>?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-bold text-charcoal mb-2">
              Add a written review
            </label>
            <textarea
              id="comment"
              rows={4}
              placeholder="What did you like or dislike? How was the fit and fabric?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal/20 transition-all resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm font-bold text-slate bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 btn-primary py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
