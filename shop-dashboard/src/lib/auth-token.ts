const ACCESS_TOKEN_KEY = "atlas_access_token";
const REFRESH_TOKEN_KEY = "atlas_refresh_token";
const REMEMBER_KEY = "atlas_remember_me";
const EXPIRES_KEY = "atlas_token_expires_at";

const REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function storage(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage;
}

function readToken(key: string): string | null {
  const remember = localStorage.getItem(REMEMBER_KEY) === "true";
  let token = localStorage.getItem(key);
  if (!token) {
    token = sessionStorage.getItem(key);
  }
  if (!token) return null;

  if (remember && key === ACCESS_TOKEN_KEY) {
    const expiresAt = localStorage.getItem(EXPIRES_KEY);
    if (expiresAt && Date.now() > Number(expiresAt)) {
      clearAuthToken();
      return null;
    }
  }

  return token;
}

export function getAuthToken(): string | null {
  return readToken(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return readToken(REFRESH_TOKEN_KEY);
}

export function isRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== "false";
}

export function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  remember = true,
): void {
  clearAuthToken();
  const store = storage(remember);
  store.setItem(ACCESS_TOKEN_KEY, accessToken);
  store.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(REMEMBER_KEY, String(remember));
  if (remember) {
    localStorage.setItem(
      EXPIRES_KEY,
      String(Date.now() + REMEMBER_DURATION_MS),
    );
  } else {
    localStorage.removeItem(EXPIRES_KEY);
  }
}

export function clearAuthToken(): void {
  for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}
