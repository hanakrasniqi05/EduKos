import type { NotificationDto, UserCreatePayload, UserDto } from "./apiTypes";
import { apiRequest } from "./apiClient";

export function getAllUsers() {
  return apiRequest<UserDto[]>("/users");
}

export function createUser(data: UserCreatePayload) {
  return apiRequest<UserDto>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(id: number, data: Partial<UserDto>) {
  return apiRequest<void>(`/users/${id}`, {
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

export function deleteUser(id: number) {
  return apiRequest<void>(`/users/${id}`, { method: "DELETE" });
}

export function getMyNotifications() {
  return apiRequest<NotificationDto[]>("/notifications/mine");
}
