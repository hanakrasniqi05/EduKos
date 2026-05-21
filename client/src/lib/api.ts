const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5056/api";

export type AuthResponse = {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  roles: string[];
};

export type UserDto = {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
};

export type InstitutionDto = {
  institutionId: number;
  institutionTypeId: number;
  ownerUserId?: number;
  name: string;
  description?: string;
  location?: string;
  city?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  isApproved: boolean;
  createdAt: string;
  institutionTypeName?: string;
};

export type NotificationDto = {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type ApplicationDto = {
  applicationId: number;
  institutionId: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  educationLevel: string;
  selectedProgram?: string;
  message?: string;
  status: "pending" | "approved" | "rejected" | string;
  createdAt: string;
  institutionName?: string;
};

export type DashboardData = {
  user: UserDto;
  savedInstitutions: InstitutionDto[];
  applications: ApplicationDto[];
  notifications: NotificationDto[];
  recommendations: InstitutionDto[];
};

export function getStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem("edukos_auth");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem("edukos_auth");
    return null;
  }
}

export function storeAuth(auth: AuthResponse) {
  localStorage.setItem("edukos_auth", JSON.stringify(auth));
  localStorage.setItem("token", auth.accessToken);
}

export function clearAuth() {
  localStorage.removeItem("edukos_auth");
  localStorage.removeItem("token");
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (auth?.accessToken) {
    headers.set("Authorization", `Bearer ${auth.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && auth?.refreshToken) {
    const refreshed = await refreshToken(auth.refreshToken);
    storeAuth(refreshed);
    return request<T>(path, options, false);
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const response = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);

  storeAuth(response);
  return response;
}

export async function ensureDashboardAuth() {
  const auth = getStoredAuth();
  if (auth?.accessToken) return auth;

  return login("nxenes@edukos.com", "Nxenes123!");
}

export async function refreshToken(refreshTokenValue: string) {
  return request<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  }, false);
}

export async function logout() {
  const auth = getStoredAuth();
  if (!auth?.refreshToken) {
    clearAuth();
    return;
  }

  try {
    await request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    }, false);
  } finally {
    clearAuth();
  }
}

export async function getCurrentUser() {
  return request<UserDto>("/auth/me");
}

export async function updateCurrentUser(data: Pick<UserDto, "firstName" | "lastName" | "phoneNumber">) {
  return request<UserDto>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getMySavedInstitutions() {
  return request<InstitutionDto[]>("/savedinstitutions/mine/institutions");
}

export async function unsaveInstitution(institutionId: number) {
  return request<void>(`/savedinstitutions/unsave/${institutionId}`, {
    method: "DELETE",
  });
}

export async function getMyApplications() {
  return request<ApplicationDto[]>("/applications/mine");
}

export async function getMyNotifications() {
  return request<NotificationDto[]>("/notifications/mine");
}

export async function getRecommendations() {
  return request<InstitutionDto[]>("/institutions/search?isApproved=true");
}

export async function getInstitutions() {
  return request<InstitutionDto[]>("/institutions");
}

export async function submitApplication(data: Omit<ApplicationDto, "applicationId" | "createdAt" | "status" | "institutionName" | "userId">) {
  return request<ApplicationDto>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const [user, savedInstitutions, applications, notifications, recommendations] = await Promise.all([
    getCurrentUser(),
    getMySavedInstitutions(),
    getMyApplications(),
    getMyNotifications(),
    getRecommendations(),
  ]);

  return {
    user,
    savedInstitutions,
    applications,
    notifications,
    recommendations: recommendations.slice(0, 4),
  };
}
