import type { ApiResponse } from "@/features/auth/types";
import { getAuthToken } from "@/lib/auth-token";

const API_BASE_URL = "http://localhost:3000";

function isApiEnvelope(
  value: unknown,
): value is ApiResponse<unknown> & { message?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "data" in value
  );
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }
  return fallback;
}

function parseResponseBody<T>(response: Response, body: unknown): T {
  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.statusText));
  }

  if (isApiEnvelope(body)) {
    if (!body.success) {
      throw new Error(body.message ?? "Request failed");
    }
    return body.data as T;
  }

  return body as T;
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: authHeaders({
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }),
  });

  const body: unknown = await response.json().catch(() => null);
  return parseResponseBody<T>(response, body);
}

async function requestForm<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  formData: FormData,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method,
    headers: authHeaders(),
    body: formData,
  });

  const body: unknown = await response.json().catch(() => null);
  return parseResponseBody<T>(response, body);
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, "POST", formData),
  putForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, "PUT", formData),
  patchForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, "PATCH", formData),
};
