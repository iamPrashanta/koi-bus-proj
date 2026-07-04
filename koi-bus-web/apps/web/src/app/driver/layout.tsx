"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import UserMenu from "@/components/shared/UserMenu";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrating } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isHydrating) return;
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "DRIVER") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, isHydrating]);

  if (!isMounted || isHydrating || !isAuthenticated || user?.role !== "DRIVER") {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-display font-bold tracking-wide">Koi Bus Driver Panel</h1>
          <p className="text-xs text-zinc-400">Welcome, {user.firstName || "Driver"}</p>
        </div>
        <UserMenu />
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
