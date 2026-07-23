"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function AuthSuccessContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const to = searchParams.get("to");

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      
      // If a specific custom redirect was requested (like checkout), honor it
      if (to && to !== "/shop" && to !== "/account") {
        router.push(to);
        return;
      }

      // Smart role-based redirect
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/shop");
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router, to]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]"><div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div></div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}
