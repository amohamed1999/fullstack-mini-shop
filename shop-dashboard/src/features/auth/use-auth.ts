import { useEffect } from "react";

import { api } from "@/lib/api";
import {
  clearAuthToken,
  getAuthToken,
  isRememberMe,
  setAuthTokens,
} from "@/lib/auth-token";
import { useAuthStore } from "@/stores/auth-store";

import type { AuthSession } from "./types";
import type { LoginInput, SignupInput } from "./schemas";

/**
 * Mount once at the root. Restores session from local API and loads roles.
 */
export function useAuthBootstrap() {
  const { setSession, setInitializing } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      try {
        const token = getAuthToken();
        if (!token) {
          setSession(null);
          return;
        }

        // Token exists — fetch the current user to restore the session
        const session = await api.get<AuthSession>("/auth/me");
        setSession(session);
      } catch (error) {
        console.error("Failed to restore session", error);
        clearAuthToken();
        setSession(null);
      } finally {
        setInitializing(false);
      }
    }

    void initAuth();
  }, [setSession, setInitializing]);
}

export async function loginWithPassword(input: LoginInput) {
  const session = await api.post<AuthSession>("/auth/login", {
    email: input.email,
    password: input.password,
  });
  setAuthTokens(
    session.accessToken,
    session.refreshToken,
    input.remember ?? true,
  );
  useAuthStore.getState().setSession(session);
}

export async function signupWithPassword(input: SignupInput) {
  await api.post("/auth/signup", {
    email: input.email,
    password: input.password,
    fullName: input.fullName,
  });
}


export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAuthToken();
    useAuthStore.getState().reset();
  }
}
