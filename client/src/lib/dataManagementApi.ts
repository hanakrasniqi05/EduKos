import {
  authenticatedFetch,
  responseError,
} from "./apiClient";

export type DataManagementEntity =
  | "users"
  | "institutions"
  | "applications"
  | "programs"
  | "staff-facilities";

export type DataManagementFormat = "csv" | "excel" | "json";

export type ImportResultDto = {
  created: number;
  updated: number;
  skipped: number;
};

export async function exportData(
  entity: DataManagementEntity,
  format: DataManagementFormat,
) {
  const response = await authenticatedFetch(
    `/data-management/export/${entity}?format=${format}`,
  );
  if (!response.ok) throw await responseError(response, "Export failed");

  const disposition = response.headers.get("content-disposition") ?? "";
  const fileName =
    /filename="?([^"]+)"?/i.exec(disposition)?.[1] ??
    `${entity}.${format === "excel" ? "xlsx" : format}`;

  return { blob: await response.blob(), fileName };
}

export async function importData(
  entity: DataManagementEntity,
  format: DataManagementFormat,
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await authenticatedFetch(
    `/data-management/import/${entity}?format=${format}`,
    { method: "POST", body: formData },
  );
  if (!response.ok) throw await responseError(response, "Import failed");
  return response.json() as Promise<ImportResultDto>;
}
