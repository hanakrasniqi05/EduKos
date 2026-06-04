namespace EduKos.API.Services.DataManagement;

public sealed record DataExportResult(byte[] Content, string ContentType, string FileName);

public sealed class ImportResult
{
    public int Created { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
}
