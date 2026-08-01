"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ConditionalFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide footer on query chat pages to maximize chat interface space
  const hideFooterRoutes = ["/account/queries", "/admin/queries", "/support/queries"];
  
  if (hideFooterRoutes.some(route => pathname.includes(route))) {
    return null;
  }

  return <>{children}</>;
}
