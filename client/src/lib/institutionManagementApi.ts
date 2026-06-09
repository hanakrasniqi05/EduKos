import type {
  InstitutionAnnouncementDto,
  InstitutionAnalyticsDto,
  InstitutionDto,
  InstitutionFacilityDto,
  InstitutionProgramDto,
  InstitutionStaffDto,
} from "./apiTypes";
import { apiRequest } from "./apiClient";

export function getMyInstitutionProfile() {
  return apiRequest<InstitutionDto>("/institution/my-profile");
}

export function getInstitutionAnalytics(institutionId: number, days = 30) {
  return apiRequest<InstitutionAnalyticsDto>(
    `/institution-analytics/${institutionId}?days=${days}`,
  );
}

export function updateMyInstitutionProfile(data: Partial<InstitutionDto>) {
  return apiRequest<void>("/institution/my-profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getMyPrograms() {
  return apiRequest<InstitutionProgramDto[]>("/institution-programs/my");
}

export function createProgram(
  data: Omit<InstitutionProgramDto, "programId" | "institutionId">,
) {
  return apiRequest<InstitutionProgramDto>("/institution-programs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProgram(id: number, data: Partial<InstitutionProgramDto>) {
  return apiRequest<void>(`/institution-programs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProgram(id: number) {
  return apiRequest<void>(`/institution-programs/${id}`, { method: "DELETE" });
}

export function getMyStaff() {
  return apiRequest<InstitutionStaffDto[]>("/institution-staff/my");
}

export function createStaff(
  data: Omit<InstitutionStaffDto, "staffId" | "institutionId">,
) {
  return apiRequest<InstitutionStaffDto>("/institution-staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStaff(id: number, data: Partial<InstitutionStaffDto>) {
  return apiRequest<void>(`/institution-staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteStaff(id: number) {
  return apiRequest<void>(`/institution-staff/${id}`, { method: "DELETE" });
}

export function getMyFacilities() {
  return apiRequest<InstitutionFacilityDto[]>("/institution-facilities/my");
}

export function createFacility(
  data: Omit<InstitutionFacilityDto, "facilityId" | "institutionId">,
) {
  return apiRequest<InstitutionFacilityDto>("/institution-facilities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateFacility(id: number, data: Partial<InstitutionFacilityDto>) {
  return apiRequest<void>(`/institution-facilities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteFacility(id: number) {
  return apiRequest<void>(`/institution-facilities/${id}`, { method: "DELETE" });
}

export function getMyAnnouncements() {
  return apiRequest<InstitutionAnnouncementDto[]>("/institution-announcements/my");
}

export function createAnnouncement(
  data: Omit<InstitutionAnnouncementDto, "announcementId" | "institutionId" | "createdAt">,
) {
  return apiRequest<InstitutionAnnouncementDto>("/institution-announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAnnouncement(
  id: number,
  data: Partial<InstitutionAnnouncementDto>,
) {
  return apiRequest<void>(`/institution-announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAnnouncement(id: number) {
  return apiRequest<void>(`/institution-announcements/${id}`, { method: "DELETE" });
}
