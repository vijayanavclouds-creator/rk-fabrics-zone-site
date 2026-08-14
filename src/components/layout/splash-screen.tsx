"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show the splash screen if this is a fresh visit/reload
    // If the user is navigating within the SPA, this component stays unmounted/hidden.
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const handleLoad = () => {
      // Small delay to ensure hydration is complete and DOM is ready
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("hasSeenSplash", "true");
      }, 800);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      // Fallback in case load takes too long (e.g. slow image somewhere else)
      const timeout = setTimeout(handleLoad, 2500);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timeout);
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FBFDF9]"
          style={{ backgroundColor: '#FBFDF9' }}
        >
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-32 h-32 md:w-40 md:h-40 mb-6"
          >
            <Image
              src="/logo.png"
              alt="RK Fabrics Zone Logo"
              fill
              className="object-contain drop-shadow-xl"
              priority
            />
          </motion.div>

          {/* Text and Loader */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center"
          >
             <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-teal-900 tracking-widest uppercase text-center">
               RK Fabrics
             </h2>
             <p className="text-teal-700/60 font-medium tracking-widest text-xs mt-1 uppercase">Premium Collection</p>
             
             {/* Loading Dots */}
             <div className="mt-8 flex gap-2">
               <div className="w-2 h-2 rounded-full bg-teal-600/80 animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 rounded-full bg-teal-600/80 animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 rounded-full bg-teal-600/80 animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
