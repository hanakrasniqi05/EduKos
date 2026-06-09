import type { AuthResponse, UserDto } from "./apiTypes";
import {
  apiRequest,
  clearAuth,
  getStoredAuth,
  storeAuth,
} from "./apiClient";

export const ROLES = {
  Admin: "Admin",
  Nxenes: "Nxenes",
  Shkolla: "Shkolla",
} as const;

export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  institutionName?: string;
  institutionTypeId?: number;
  city?: string;
  website?: string;
};

export function getDashboardPath(roles: string[]) {
  if (roles.includes(ROLES.Admin)) return "/dashboard/admin";
  if (roles.includes(ROLES.Shkolla)) return "/dashboard/institution";
  return "/dashboard/user";
}

export async function register(payload: RegisterPayload) {
  const auth = await apiRequest<AuthResponse>(
    "/auth/register",
    { method: "POST", body: JSON.stringify(payload) },
    false,
  );
  storeAuth(auth);
  return auth;
}

export async function login(email: string, password: string) {
  const auth = await apiRequest<AuthResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false,
  );
  storeAuth(auth);
  return auth;
}

export function refreshToken(refreshTokenValue: string) {
  return apiRequest<AuthResponse>(
    "/auth/refresh",
    { method: "POST", body: JSON.stringify({ refreshToken: refreshTokenValue }) },
    false,
  );
}

export async function logout() {
  const auth = getStoredAuth();
  if (!auth?.refreshToken) {
    clearAuth();
    return;
  }

  try {
    await apiRequest(
      "/auth/logout",
      { method: "POST", body: JSON.stringify({ refreshToken: auth.refreshToken }) },
      false,
    );
  } finally {
    clearAuth();
  }
}

export function getCurrentUser() {
  return apiRequest<UserDto>("/auth/me");
}

export function updateCurrentUser(
  data: Pick<UserDto, "firstName" | "lastName" | "phoneNumber">,
) {
  return apiRequest<UserDto>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
