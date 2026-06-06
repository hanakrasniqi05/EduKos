import { getStoredAuth, restoreSession } from "../lib/api";

export async function authenticatedJsonRequest<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) {
    throw new Error("Duhet te kyçeni per ta perdorur komunikimin.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${auth.accessToken}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (response.status === 401 && retry) {
    const refreshed = await restoreSession();
    if (refreshed) {
      return authenticatedJsonRequest<T>(baseUrl, path, options, false);
    }
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return body.message ?? "Veprimi RTC deshtoi.";
  } catch {
    return response.statusText || "Veprimi RTC deshtoi.";
  }
}
