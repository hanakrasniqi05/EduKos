using EduKos.API.Models.NoSql;
using EduKos.Application.DTOs.Education;

namespace EduKos.API.Services.NoSql;

public interface IInstitutionAnalyticsService
{
    Task TrackInstitutionViewAsync(
        int institutionId,
        int? userId,
        CancellationToken cancellationToken = default);

    Task TrackInstitutionSearchAsync(
        InstitutionSearchRequestDto request,
        int resultCount,
        int? userId,
        CancellationToken cancellationToken = default);

    Task<InstitutionAnalyticsDto> GetInstitutionAnalyticsAsync(
        int institutionId,
        int days,
        CancellationToken cancellationToken = default);

    Task<InstitutionSearchAnalyticsDto> GetSearchAnalyticsAsync(
        int days,
        CancellationToken cancellationToken = default);
}
