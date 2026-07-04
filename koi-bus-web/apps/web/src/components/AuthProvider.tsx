"use client";

import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/stores/useAuth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * AuthProvider — runs once at app boot.
 *
 * Flow:
 *   1. Attempt silent refresh using the HTTP-only refreshToken cookie.
 *   2. If successful, call /auth/me to get the current user profile.
 *   3. Hydrate the Zustand store (user + new accessToken).
 *   4. On any failure (cookie expired/missing): clear store, set hydrating=false.
 *   5. Protected layouts check isHydrating before deciding to redirect.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken, logout, setHydrating } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function bootRefresh() {
      try {
        // Step 1: Silent refresh — sends the HTTP-only cookie automatically
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (cancelled) return;

        const { accessToken } = refreshRes.data;
        setAccessToken(accessToken);

        // Step 2: Fetch current user profile with the new token
        const meRes = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        if (cancelled) return;

        setUser(meRes.data.data);
      } catch {
        // Cookie missing, expired, or revoked — clear state and let layouts redirect
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setHydrating(false);
        }
      }
    }

    bootRefresh();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
