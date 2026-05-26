const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const ROLES = {
  Admin: "Admin",
  Nxenes: "Nxenes",
  Shkolla: "Shkolla",
} as const;

export function getDashboardPath(roles: string[]): string {
  if (roles.includes(ROLES.Admin)) return "/dashboard/admin";
  if (roles.includes(ROLES.Shkolla)) return "/dashboard/institution";
  return "/dashboard/user";
}

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
export type InstitutionTypeDto = {
  institutionTypeId: number;
  name: string;
};

export type ReviewDto = {
  reviewId: number;
  userId: number;
  institutionId: number;
  teachingQualityRating?: number;
  facilitiesRating?: number;
  difficultyRating?: number;
  staffRating?: number;
  comment?: string;
  createdAt: string;
};

export type UserCreatePayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
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
  window.dispatchEvent(new Event("edukos-auth-change"));
}

export function clearAuth() {
  localStorage.removeItem("edukos_auth");
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("edukos-auth-change"));
}

export function isAccessTokenExpired(auth: AuthResponse): boolean {
  const expiresAt = new Date(auth.accessTokenExpiresAt).getTime();
  return Number.isNaN(expiresAt) || Date.now() >= expiresAt - 60_000;
}

export async function restoreSession(): Promise<AuthResponse | null> {
  const auth = getStoredAuth();
  if (!auth) return null;

  if (!isAccessTokenExpired(auth)) return auth;

  if (!auth.refreshToken) {
    clearAuth();
    return null;
  }

  try {
    const refreshed = await refreshToken(auth.refreshToken);
    storeAuth(refreshed);
    return refreshed;
  } catch {
    clearAuth();
    return null;
  }
}

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

export type InstitutionProgramDto = {
  programId: number;
  institutionId: number;
  name: string;
  level?: string;
  description?: string;
  duration?: string;
};

export type InstitutionFullDetailsDto = {
  institution: InstitutionDto;
  programs: InstitutionProgramDto[];
};

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (auth?.accessToken) {
    headers.set("Authorization", `Bearer ${auth.accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Could not reach the API. Start the backend server and try again.");
  }

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

export async function register(payload: RegisterPayload) {
  const response = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }, false);

  storeAuth(response);
  return response;
}

export async function login(email: string, password: string) {
  const response = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);

  storeAuth(response);
  return response;
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

export async function saveInstitution(institutionId: number) {
  return request<{ savedInstitutionId: number; userId: number; institutionId: number }>(
    "/savedinstitutions/save",
    {
      method: "POST",
      body: JSON.stringify({ institutionId }),
    },
  );
}

export async function unsaveInstitution(institutionId: number) {
  return request<void>(`/savedinstitutions/unsave/${institutionId}`, {
    method: "DELETE",
  });
}

export async function getMyApplications() {
  return request<ApplicationDto[]>("/applications/mine");
}

export async function getAllApplications(institutionId?: number) {
  const query = institutionId ? `?institutionId=${institutionId}` : "";
  return request<ApplicationDto[]>(`/applications${query}`);
}

export async function getAllUsers() {
  return request<UserDto[]>("/users");
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
export async function getInstitutionTypes() {
  return request<InstitutionTypeDto[]>("/InstitutionTypes");
}

export async function getInstitutionsByType(institutionTypeId: number) {
  return request<InstitutionDto[]>(`/institutions/by-type/${institutionTypeId}`);
}

export async function getInstitutionFullDetails(institutionId: number) {
  return request<InstitutionFullDetailsDto>(`/institutions/${institutionId}/full-details`);
}

export async function submitApplication(data: Omit<ApplicationDto, "applicationId" | "createdAt" | "status" | "institutionName" | "userId">) {
  return request<ApplicationDto>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createUser(data: UserCreatePayload) {
  return request<UserDto>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: Partial<UserDto>) {
  return request<void>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      userId: id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt ?? new Date().toISOString(),
      roles: data.roles ?? [],
    }),
  });
}

export async function deleteUser(id: number) {
  return request<void>(`/users/${id}`, { method: "DELETE" });
}

export async function createInstitution(
  data: Omit<InstitutionDto, "institutionId" | "createdAt" | "institutionTypeName">,
) {
  return request<InstitutionDto>("/institutions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInstitution(id: number, data: InstitutionDto) {
  return request<void>(`/institutions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, institutionId: id }),
  });
}

export async function deleteInstitution(id: number) {
  return request<void>(`/institutions/${id}`, { method: "DELETE" });
}

export async function createInstitutionType(name: string) {
  return request<InstitutionTypeDto>("/InstitutionTypes", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateInstitutionType(id: number, data: InstitutionTypeDto) {
  return request<void>(`/InstitutionTypes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, institutionTypeId: id }),
  });
}

export async function deleteInstitutionType(id: number) {
  return request<void>(`/InstitutionTypes/${id}`, { method: "DELETE" });
}

export async function getReviews() {
  return request<ReviewDto[]>("/reviews");
}

export async function deleteReview(id: number) {
  return request<void>(`/reviews/${id}`, { method: "DELETE" });
}

export async function updateApplicationStatus(id: number, status: string) {
  return request<ApplicationDto>(`/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export type AdminDashboardData = {
  user: UserDto;
  users: UserDto[];
  institutions: InstitutionDto[];
  institutionTypes: InstitutionTypeDto[];
  reviews: ReviewDto[];
  applications: ApplicationDto[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [user, users, institutions, institutionTypes, reviews, applications] = await Promise.all([
    getCurrentUser(),
    getAllUsers(),
    getInstitutions(),
    getInstitutionTypes(),
    getReviews(),
    getAllApplications(),
  ]);

  return { user, users, institutions, institutionTypes, reviews, applications };
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
