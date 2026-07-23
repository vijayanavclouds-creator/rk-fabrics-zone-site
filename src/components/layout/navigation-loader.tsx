"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationLoaderInner() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Hide loader whenever the route or search params change (navigation complete)
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, anchors
      if (
        href.startsWith("http") || 
        href.startsWith("mailto:") || 
        href.startsWith("tel:") || 
        href.startsWith("#") ||
        target.target === "_blank"
      ) {
        return;
      }

      // Check if they are holding Ctrl/Cmd to open in new tab
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
      }

      // Check if it's the exact same page, in which case it won't trigger a route change
      try {
        const targetUrl = new URL(target.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
          return;
        }
      } catch (err) {
        // Fallback if URL parsing fails
      }

      // If it's a valid internal link, show the loader
      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/[0.19]">
      <div className="loader-container">
        <div className="multi-shape-loader">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
    </div>
  );
}

export function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderInner />
    </Suspense>
  );
}
