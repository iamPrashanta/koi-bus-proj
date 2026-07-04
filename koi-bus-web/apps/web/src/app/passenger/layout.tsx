"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import UserMenu from "@/components/shared/UserMenu";

export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrating } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isHydrating) return;
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "PASSENGER") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, isHydrating]);

  if (!isMounted || isHydrating || !isAuthenticated || user?.role !== "PASSENGER") {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-display font-bold tracking-wide">Koi Bus Passenger Portal</h1>
          <p className="text-xs text-zinc-400">Track your buses, routes and arrivals in real time.</p>
        </div>
        <UserMenu />
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
