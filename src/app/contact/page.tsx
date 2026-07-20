"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";


export default function ContactPage() {
 return (
 <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
 <div className="text-center mb-12">
 <span className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.3em] text-gold-dark uppercase">
 Get In Touch
 </span>
 <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-charcoal mt-2">
 Contact Us
 </h1>
 <p className="text-slate mt-3 max-w-lg mx-auto">
 Questions about fabrics? Need help with an order? We&apos;re here for you.
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
 {/* Contact Info */}
 <div className="space-y-6">
 <div className="bg-white rounded-2xl border border-charcoal/5 p-6 space-y-5">
 {[
 { icon: MapPin, label: "Visit Our Store", value: "Johari Bazaar, Jaipur, Rajasthan 302003, India", color: "text-teal-600" },
 { icon: Phone, label: "Call Us", value: "+91 98765 43210", color: "text-teal-600" },
 { icon: Mail, label: "Email", value: "hello@rkfabricszone.com", color: "text-teal-600" },
 { icon: Clock, label: "Working Hours", value: "Mon — Sat: 10:00 AM — 8:00 PM", color: "text-gold-dark" },
 ].map((item) => (
 <div key={item.label} className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
 <item.icon size={18} className={item.color} />
 </div>
 <div>
 <p className="text-xs font-medium text-slate uppercase tracking-wider">{item.label}</p>
 <p className="text-sm font-medium text-charcoal mt-0.5">{item.value}</p>
 </div>
 </div>
 ))}
 </div>

 <a
 href="https://wa.me/919876543210"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-3 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold transition-colors"
 >
 <MessageCircle size={20} /> Chat on WhatsApp
 </a>
 </div>

 {/* Contact Form */}
 <form className="bg-white rounded-2xl border border-charcoal/5 p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
 <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-2">
 Send Us a Message
 </h2>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium text-slate mb-1.5">Name *</label>
 <input type="text" placeholder="Your name" className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40" />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate mb-1.5">Phone</label>
 <input type="tel" placeholder="+91" className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40" />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium text-slate mb-1.5">Email *</label>
 <input type="email" placeholder="you@email.com" className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40" />
 </div>

 <div>
 <label className="block text-xs font-medium text-slate mb-1.5">Subject</label>
 <select className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal ">
 <option>General Inquiry</option>
 <option>Order Issue</option>
 <option>Wholesale Inquiry</option>
 <option>Custom Fabric Request</option>
 <option>Returns & Exchange</option>
 <option>Other</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-medium text-slate mb-1.5">Message *</label>
 <textarea rows={5} placeholder="Tell us how we can help..." className="w-full px-4 py-3 bg-cream border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/40 resize-none" />
 </div>

 <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
 <Send size={16} /> Send Message
 </button>
 </form>
 </div>
 </div>
 );
}
