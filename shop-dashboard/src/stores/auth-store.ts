import { create } from "zustand";

import type { AuthSession, AuthUser } from "@/features/auth/types";

export type AppRole = "admin" | "moderator" | "user";

export type User = AuthUser;
export type Session = AuthSession;

interface AuthState {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  /** True until the initial session restore + role fetch resolves. */
  initializing: boolean;
  setSession: (session: Session | null) => void;
  setRoles: (roles: AppRole[]) => void;
  setInitializing: (v: boolean) => void;
  reset: () => void;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  roles: [],
  initializing: true,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      roles: session?.user ? [session.user.role] : [],
    }),
  setRoles: (roles) => set({ roles }),
  setInitializing: (initializing) => set({ initializing }),
  reset: () => set({ session: null, user: null, roles: [] }),
  hasRole: (role) => get().roles.includes(role),
  hasAnyRole: (roles) => roles.some((r) => get().roles.includes(r)),
}));
