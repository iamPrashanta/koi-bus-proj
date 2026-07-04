"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrating } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isHydrating) return; // Wait for AuthProvider
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "SUPER_ADMIN" && user?.role !== "BUS_OWNER") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, isHydrating]);

  if (!isMounted || isHydrating || !isAuthenticated || (user?.role !== "SUPER_ADMIN" && user?.role !== "BUS_OWNER")) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar could go here */}
      <main className="flex-1 flex flex-col relative h-full">
        {children}
      </main>
    </div>
  );
}
