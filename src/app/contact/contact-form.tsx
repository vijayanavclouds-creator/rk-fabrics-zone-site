"use client";

import { Send, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { submitContactMessage } from "@/actions/contact";
import { cn } from "@/lib/utils";

const subjectOptions = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Order Issue", label: "Order Issue" },
  { value: "Wholesale Inquiry", label: "Wholesale Inquiry" },
  { value: "Custom Fabric Request", label: "Custom Fabric Request" },
  { value: "Returns & Exchange", label: "Returns & Exchange" },
  { value: "Other", label: "Other" },
];

const SubjectSelect = ({ value, onChange, name }: { value: string, onChange: (v: string) => void, name: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = subjectOptions.find(o => o.value === value)?.label || value;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input type="hidden" name={name} value={value} />
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none text-sm flex justify-between items-center text-charcoal"
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} className={cn("text-slate transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-charcoal/10 rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto no-scrollbar">
          {subjectOptions.map(opt => (
            <button 
              key={opt.value} 
              type="button" 
              onClick={() => { onChange(opt.value); setIsOpen(false); }} 
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate/5 rounded-lg cursor-pointer group transition-colors"
            >
              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0", value === opt.value ? "border-teal-600" : "border-charcoal/20 group-hover:border-teal-600")}>
                {value === opt.value && <div className="w-2 h-2 rounded-full bg-teal-600" /> }
              </div>
              <span className="text-sm text-charcoal">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function ContactForm({ deliveredOrders = [], userName = "", userEmail = "" }: { deliveredOrders?: any[], userName?: string, userEmail?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState(
    searchParams.get("subject") === "wholesale" ? "Wholesale Inquiry" : "General Inquiry"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState<number>(0);
  const [userCaptcha, setUserCaptcha] = useState("");

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaText(`${num1} + ${num2} = ?`);
    setCaptchaAnswer(num1 + num2);
    setUserCaptcha("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam === "wholesale") {
      setSubject("Wholesale Inquiry");
    } else if (subjectParam === "Return & Exchange" || subjectParam === "Returns & Exchange") {
      setSubject("Returns & Exchange");
    } else {
      setSubject("General Inquiry");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (parseInt(userCaptcha) !== captchaAnswer) {
      toast.error("Incorrect security question answer.");
      generateCaptcha();
      return;
    }

    const formData = new FormData(e.currentTarget);

    setIsSubmitting(true);
    toast.loading("Sending message...");
    
    const result = await submitContactMessage(formData);
    
    toast.dismiss();
    
    if (result.success) {
      toast.success("Message sent successfully!");
      (e.target as HTMLFormElement).reset();
      setSubject("General Inquiry"); // Reset subject after success
      generateCaptcha();
      
      if (result.userId && result.queryId) {
        router.push(`/account/queries/${result.queryId}`);
      }
    } else {
      toast.error(result.error || "Failed to send message. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-charcoal/5 p-6 space-y-4">
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-2">
        Send Us a Message
      </h2>

      <div>
        <label className="block text-xs font-medium text-slate mb-1.5">Name *</label>
        <input name="name" type="text" required defaultValue={userName} placeholder="Your name" className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate mb-1.5">Email *</label>
        <input name="email" type="email" required defaultValue={userEmail} placeholder="you@email.com" className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate mb-1.5">Subject</label>
        <SubjectSelect 
          name="subject"
          value={subject} 
          onChange={setSubject}
        />
      </div>

      {subject === "Returns & Exchange" && (
        <div>
          <label className="block text-xs font-medium text-slate mb-1.5">Select Delivered Order *</label>
          {deliveredOrders.length > 0 ? (
            <select 
              name="orderId" 
              required 
              defaultValue={searchParams.get("orderId") || ""}
              className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal" 
            >
              <option value="" disabled>Select an order...</option>
              {deliveredOrders.map((order) => {
                const itemNames = order.items.map((i: any) => i.productName).join(", ");
                const truncatedNames = itemNames.length > 40 ? itemNames.substring(0, 40) + "..." : itemNames;
                return (
                  <option key={order.id} value={order.id}>
                    {`#${order.id.slice(-8).toUpperCase()} - ${new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} (${truncatedNames})`}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm text-slate">
              You have no delivered orders available for return. Please log in or check your account.
              <input type="hidden" name="orderId" value="" />
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate mb-1.5">Message *</label>
        <textarea name="message" required rows={5} placeholder="Tell us how we can help..." className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40 resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate mb-1">Anti-Spam Verification: {captchaText}</label>
        <p className="text-[10.5px] text-slate-500 mb-2">Please solve this simple math problem to prove you are human.</p>
        <input 
          type="number" 
          required 
          value={userCaptcha}
          onChange={(e) => setUserCaptcha(e.target.value)}
          placeholder="Enter the result" 
          className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40" 
        />
      </div>

      <button disabled={isSubmitting} type="submit" className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
        <Send size={16} /> {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      <div className="mt-4 px-1 text-center">
        <p className="text-[11px] leading-relaxed text-amber-700 bg-amber-50/80 border border-amber-200/60 py-2.5 px-3 rounded-lg inline-block shadow-sm">
          <strong>Note:</strong> To maintain quality service in our free tier, our AI assistant (Mira) is limited to <strong>5 messages per user per day</strong>. If you exceed this limit, you will be automatically transferred to our human support team.
        </p>
      </div>
    </form>
  );
}
