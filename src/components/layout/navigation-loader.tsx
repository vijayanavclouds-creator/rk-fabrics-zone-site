"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationLoaderInner() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Hide loader whenever the route or search params change (navigation complete)
    setIsNavigating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Remove e.defaultPrevented check because Next.js Link ALWAYS prevents default for soft routing

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

      setIsNavigating(true);

      // Safety timeout: if navigation doesn't complete within 10 seconds, hide the loader
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 10000);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
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
