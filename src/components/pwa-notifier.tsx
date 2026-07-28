"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";

export function PwaNotifier() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { status } = useSession();

  useEffect(() => {
    // Only show if user is logged in
    if (status !== "authenticated") return;

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome from showing the default install prompt
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      
      const lastShown = localStorage.getItem("pwa-prompt-last-shown");
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (!lastShown || (now - parseInt(lastShown) > twentyFourHours)) {
        setShow(true);
        localStorage.setItem("pwa-prompt-last-shown", now.toString());
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: If beforeinstallprompt doesn't fire (like in dev mode or iOS)
    // we still want to show the popup UI.
    const timer = setTimeout(() => {
      const lastShown = localStorage.getItem("pwa-prompt-last-shown");
      const now = Date.now();
      if (!lastShown || (now - parseInt(lastShown) > 24 * 60 * 60 * 1000)) {
        setShow(true);
        localStorage.setItem("pwa-prompt-last-shown", now.toString());
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [status]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShow(false);
      }
    } else {
      alert("To install, tap the 'Share' icon on Safari and select 'Add to Home Screen'.");
    }
  };

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
          className="fixed bottom-[85px] left-4 right-4 md:absolute md:top-[calc(100%+12px)] md:bottom-auto md:left-auto md:right-0 md:w-80 bg-white border border-charcoal/10 rounded-2xl shadow-2xl z-[100] p-4"
        >
          {/* Arrow pointing up (desktop only) */}
          <div className="hidden md:block absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-charcoal/10 transform rotate-45 z-0" />
          
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
              <div className="pr-4 flex-1">
                <h4 className="font-bold text-charcoal text-sm">RK Fabrics App</h4>
                <p className="text-xs text-slate mt-1 mb-3 leading-relaxed">Install our app for a faster shopping experience!</p>
                
                <button 
                  onClick={handleInstall}
                  className="btn-primary w-full !h-9 text-xs"
                >
                  Install App
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
