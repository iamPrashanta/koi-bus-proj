import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  operatorId?: number | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean; // true while AuthProvider is running the boot refresh
  login: (user: User, token: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setHydrating: (v: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrating: true, // start as true — AuthProvider will set false after boot
      login: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true, isHydrating: false }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isHydrating: false }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      setHydrating: (v) => set({ isHydrating: v }),
    }),
    {
      name: 'koi-bus-auth',
      // Only persist user identity — NOT isHydrating
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
