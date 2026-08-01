"use client";

import { useEffect, useState } from "react";

export function ChatContainer({ children }: { children: React.ReactNode }) {
  const [height, setHeight] = useState("calc(100dvh - 160px)");

  useEffect(() => {
    // Only apply on mobile devices
    if (window.innerWidth >= 768) {
      setHeight("auto");
      return;
    }

    document.body.style.overflow = "hidden";

    const calculateHeight = () => {
      if (window.innerWidth >= 768) {
        setHeight("auto");
        document.body.style.overflow = "";
        return;
      }

      const header = document.querySelector("header");
      // The sticky header sits at top, but if there's an announcement bar it might push it.
      // header.getBoundingClientRect().bottom gives the exact pixel Y-coordinate of the bottom of the header.
      const headerBottom = header ? header.getBoundingClientRect().bottom : 88;
      
      const bottomNavHeight = 64; // bottom nav is h-16 (64px)
      const availableHeight = window.innerHeight - headerBottom - bottomNavHeight;
      setHeight(`${availableHeight}px`);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    
    // Also re-calculate after a short delay in case the announcement bar text wraps and changes height after hydration
    const timeout = setTimeout(calculateHeight, 100);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", calculateHeight);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div 
      className="bg-white md:rounded-3xl border-t border-b md:border border-charcoal/10 p-4 pb-0 md:p-8 md:shadow-sm flex flex-col -mx-4 -mt-10 md:mx-0 md:mt-0 md:h-[calc(100vh-200px)] md:min-h-[500px]"
      style={{ height: height !== "auto" ? height : undefined }}
    >
      {children}
    </div>
  );
}
