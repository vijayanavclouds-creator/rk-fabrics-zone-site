"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ConditionalFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide footer on query chat pages and invoice pages to maximize interface space
  const hideFooterRoutes = ["/account/queries", "/admin/queries", "/support/queries", "/invoice"];
  
  if (hideFooterRoutes.some(route => pathname.includes(route))) {
    return null;
  }

  return <>{children}</>;
}
