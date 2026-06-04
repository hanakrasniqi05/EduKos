using Microsoft.AspNetCore.Http;

namespace EduKos.API.Services.DataManagement;

public interface IDataManagementService
{
    Task<DataExportResult> ExportAsync(string entity, string format, CancellationToken cancellationToken);
    Task<ImportResult> ImportAsync(string entity, string format, IFormFile file, CancellationToken cancellationToken);
}
