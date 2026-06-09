import type { ApplicationDto, FileDto } from "./apiTypes";
import {
  API_BASE_URL,
  apiRequest,
  getStoredAuth,
  responseError,
} from "./apiClient";

export function getMyApplications() {
  return apiRequest<ApplicationDto[]>("/applications/mine");
}

export function getAllApplications(institutionId?: number) {
  return apiRequest<ApplicationDto[]>(
    `/applications${institutionId ? `?institutionId=${institutionId}` : ""}`,
  );
}

export function submitApplication(
  data: Omit<ApplicationDto, "applicationId" | "createdAt" | "status" | "institutionName" | "userId">,
) {
  return apiRequest<ApplicationDto>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function uploadApplicationDocument(file: File) {
  const auth = getStoredAuth();
  const formData = new FormData();
  formData.append("file", file);
  const headers = new Headers();
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) throw await responseError(response, "Document upload failed");
  return response.json() as Promise<FileDto>;
}

export function updateApplicationStatus(id: number, status: string) {
  return apiRequest<ApplicationDto>(`/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
