"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function PwaNotifier() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show only once per 24 hours to avoid annoying the user across tabs/sessions
    const checkAndShowPrompt = () => {
      try {
        const lastShown = localStorage.getItem("pwa-prompt-last-shown");
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (!lastShown || (now - parseInt(lastShown) > twentyFourHours)) {
          // Add a small delay so it doesn't interrupt the initial page load
          const timer = setTimeout(() => {
            setShow(true);
            localStorage.setItem("pwa-prompt-last-shown", now.toString());
          }, 3000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        // Ignore localStorage errors (e.g., incognito mode)
      }
    };

    const cleanup = checkAndShowPrompt();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-[calc(100%+12px)] right-0 w-72 sm:w-80 bg-white border border-charcoal/10 rounded-2xl shadow-2xl z-[100] p-4"
        >
          {/* Arrow pointing up */}
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-charcoal/10 transform rotate-45 z-0" />
          
          <div className="relative z-10">
            <button 
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 p-1.5 text-slate hover:text-charcoal transition-colors bg-white hover:bg-slate-50 rounded-full"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0 border border-teal-100">
                <Smartphone size={20} className="text-teal-600" />
              </div>
              <div className="pr-4">
                <h4 className="font-bold text-charcoal text-sm">RK Fabrics Zone App</h4>
                <p className="text-xs text-slate mt-1 mb-4 leading-relaxed">Install our Progressive Web App for a faster, app-like shopping experience on your device!</p>
                
                <button 
                  onClick={() => {
                    alert("To install the PWA, tap the 'Share' icon on Safari and select 'Add to Home Screen', or look for the 'Install' prompt/icon in Chrome/Edge.");
                    handleDismiss();
                  }}
                  className="bg-charcoal text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-charcoal/90 transition-colors w-full"
                >
                  View Install Instructions
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
