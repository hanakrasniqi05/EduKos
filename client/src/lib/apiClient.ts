import type { AuthResponse } from "./apiTypes";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const AUTH_STORAGE_KEY = "edukos_auth";

export function getStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeAuth(auth: AuthResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  localStorage.setItem("token", auth.accessToken);
  window.dispatchEvent(new Event("edukos-auth-change"));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("edukos-auth-change"));
}

export function isAccessTokenExpired(auth: AuthResponse) {
  const expiresAt = new Date(auth.accessTokenExpiresAt).getTime();
  return Number.isNaN(expiresAt) || Date.now() >= expiresAt - 60_000;
}

export async function refreshStoredSession(): Promise<AuthResponse | null> {
  const auth = getStoredAuth();
  if (!auth?.refreshToken) {
    clearAuth();
    return null;
  }

  try {
    const refreshed = await refreshAccessToken(auth.refreshToken);
    storeAuth(refreshed);
    return refreshed;
  } catch {
    clearAuth();
    return null;
  }
}

export async function restoreSession(): Promise<AuthResponse | null> {
  const auth = getStoredAuth();
  if (!auth) return null;
  if (!isAccessTokenExpired(auth)) return auth;
  return refreshStoredSession();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Could not reach the API. Start the backend server and try again.");
  }

  if (response.status === 401 && retry && auth?.refreshToken) {
    const refreshed = await refreshAccessToken(auth.refreshToken);
    storeAuth(refreshed);
    return apiRequest<T>(path, options, false);
  }

  if (!response.ok) throw await responseError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function authenticatedFetch(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers);
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && auth?.refreshToken) {
    const refreshed = await refreshAccessToken(auth.refreshToken);
    storeAuth(refreshed);
    return authenticatedFetch(path, options, false);
  }

  return response;
}

export async function responseError(response: Response, fallback = "Request failed") {
  let message = fallback;
  try {
    const body = await response.json() as { message?: string };
    message = body.message ?? message;
  } catch {
    message = response.statusText || message;
  }
  return new Error(message);
}

async function refreshAccessToken(refreshToken: string) {
  return apiRequest<AuthResponse>(
    "/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
    false,
  );
}
