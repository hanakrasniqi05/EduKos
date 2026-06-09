import type {
  HomeStatsDto,
  InstitutionDto,
  InstitutionFullDetailsDto,
  InstitutionTypeDto,
  InstitutionWritePayload,
  ReviewDto,
} from "./apiTypes";
import { apiRequest } from "./apiClient";

export type SearchInstitutionsParams = {
  name?: string;
  city?: string;
  category?: string;
  institutionTypeId?: number;
  program?: string;
  isApproved?: boolean;
  minTuitionFee?: number;
  maxTuitionFee?: number;
  minRating?: number;
  language?: string;
  institutionOwnership?: string;
};

export type CreateInstitutionReviewPayload = {
  institutionId: number;
  rating: number;
  comment?: string;
};

export function getMySavedInstitutions() {
  return apiRequest<InstitutionDto[]>("/savedinstitutions/mine/institutions");
}

export function saveInstitution(institutionId: number) {
  return apiRequest<{ savedInstitutionId: number; userId: number; institutionId: number }>(
    "/savedinstitutions/save",
    { method: "POST", body: JSON.stringify({ institutionId }) },
  );
}

export function unsaveInstitution(institutionId: number) {
  return apiRequest<void>(`/savedinstitutions/unsave/${institutionId}`, { method: "DELETE" });
}

export function getRecommendations() {
  return apiRequest<InstitutionDto[]>("/institutions/search?isApproved=true");
}

export function getInstitutions() {
  return apiRequest<InstitutionDto[]>("/institutions");
}

export function getInstitutionTypes() {
  return apiRequest<InstitutionTypeDto[]>("/InstitutionTypes");
}

export function getInstitutionsByType(institutionTypeId: number) {
  return apiRequest<InstitutionDto[]>(`/institutions/by-type/${institutionTypeId}`);
}

export function getInstitutionFullDetails(institutionId: number) {
  return apiRequest<InstitutionFullDetailsDto>(`/institutions/${institutionId}/full-details`);
}

export function createInstitution(data: InstitutionWritePayload) {
  return apiRequest<InstitutionDto>("/institutions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateInstitution(id: number, data: InstitutionWritePayload) {
  return apiRequest<void>(`/institutions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, institutionId: id }),
  });
}

export function deleteInstitution(id: number) {
  return apiRequest<void>(`/institutions/${id}`, { method: "DELETE" });
}

export function createInstitutionType(name: string) {
  return apiRequest<InstitutionTypeDto>("/InstitutionTypes", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateInstitutionType(id: number, data: InstitutionTypeDto) {
  return apiRequest<void>(`/InstitutionTypes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, institutionTypeId: id }),
  });
}

export function deleteInstitutionType(id: number) {
  return apiRequest<void>(`/InstitutionTypes/${id}`, { method: "DELETE" });
}

export function getReviews() {
  return apiRequest<ReviewDto[]>("/reviews");
}

export function getMyInstitutionReview(institutionId: number) {
  return apiRequest<ReviewDto>(`/reviews/institution/${institutionId}/mine`);
}

export function rateInstitution(payload: CreateInstitutionReviewPayload) {
  return apiRequest<ReviewDto>("/reviews/institution", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteReview(id: number) {
  return apiRequest<void>(`/reviews/${id}`, { method: "DELETE" });
}

export function searchInstitutions(params: SearchInstitutionsParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.append(key, String(value));
  });
  return apiRequest<InstitutionDto[]>(`/institutions/search${query.size ? `?${query}` : ""}`);
}

export function getHomeStats() {
  return apiRequest<HomeStatsDto>("/home/stats");
}
