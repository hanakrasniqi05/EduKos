using EduKos.API.Models.NoSql;
using EduKos.Application.DTOs.Education;
using EduKos.Infrastructure.Persistence;
using MongoDB.Driver;

namespace EduKos.API.Services.NoSql;

public sealed class InstitutionAnalyticsService(
    MongoDbContext context,
    ILogger<InstitutionAnalyticsService> logger) : IInstitutionAnalyticsService
{
    private const string InstitutionViewAction = "institution_view";
    private const string InstitutionSearchAction = "institution_search";

    public Task TrackInstitutionViewAsync(
        int institutionId,
        int? userId,
        CancellationToken cancellationToken = default) =>
        TryTrackAsync(
            new ActivityHistoryDocument
            {
                UserId = userId,
                Action = InstitutionViewAction,
                EntityName = "Institution",
                EntityId = institutionId.ToString(),
                CreatedAt = DateTime.UtcNow
            },
            cancellationToken);

    public Task TrackInstitutionSearchAsync(
        InstitutionSearchRequestDto request,
        int resultCount,
        int? userId,
        CancellationToken cancellationToken = default)
    {
        var details = new Dictionary<string, string>
        {
            ["resultCount"] = resultCount.ToString()
        };

        AddIfPresent(details, "name", request.Name);
        AddIfPresent(details, "city", request.City);
        AddIfPresent(details, "category", request.Category);
        AddIfPresent(details, "program", request.Program);

        if (request.InstitutionTypeId.HasValue)
            details["institutionTypeId"] = request.InstitutionTypeId.Value.ToString();

        return TryTrackAsync(
            new ActivityHistoryDocument
            {
                UserId = userId,
                Action = InstitutionSearchAction,
                EntityName = "Institution",
                CreatedAt = DateTime.UtcNow,
                Details = details
            },
            cancellationToken);
    }

    public async Task<InstitutionAnalyticsDto> GetInstitutionAnalyticsAsync(
        int institutionId,
        int days,
        CancellationToken cancellationToken = default)
    {
        var from = DateTime.UtcNow.AddDays(-NormalizeDays(days));
        var filter = Builders<ActivityHistoryDocument>.Filter.And(
            Builders<ActivityHistoryDocument>.Filter.Eq(item => item.Action, InstitutionViewAction),
            Builders<ActivityHistoryDocument>.Filter.Eq(item => item.EntityId, institutionId.ToString()),
            Builders<ActivityHistoryDocument>.Filter.Gte(item => item.CreatedAt, from));

        var views = await context.ActivityHistory
            .Find(filter)
            .Project(item => new { item.UserId, item.CreatedAt })
            .ToListAsync(cancellationToken);

        var dailyViews = views
            .GroupBy(item => DateOnly.FromDateTime(item.CreatedAt))
            .OrderBy(group => group.Key)
            .Select(group => new DailyViewDto(group.Key, group.LongCount()))
            .ToList();

        return new InstitutionAnalyticsDto(
            institutionId,
            from,
            views.LongCount(),
            views.Where(item => item.UserId.HasValue)
                .Select(item => item.UserId!.Value)
                .Distinct()
                .Count(),
            dailyViews);
    }

    public async Task<InstitutionSearchAnalyticsDto> GetSearchAnalyticsAsync(
        int days,
        CancellationToken cancellationToken = default)
    {
        var from = DateTime.UtcNow.AddDays(-NormalizeDays(days));
        var filter = Builders<ActivityHistoryDocument>.Filter.And(
            Builders<ActivityHistoryDocument>.Filter.Eq(item => item.Action, InstitutionSearchAction),
            Builders<ActivityHistoryDocument>.Filter.Gte(item => item.CreatedAt, from));

        var searches = await context.ActivityHistory
            .Find(filter)
            .Project(item => item.Details)
            .ToListAsync(cancellationToken);

        return new InstitutionSearchAnalyticsDto(
            from,
            searches.Count,
            TopValues(searches, "name"),
            TopValues(searches, "city"),
            TopValues(searches, "category"),
            TopValues(searches, "program"));
    }

    private async Task TryTrackAsync(
        ActivityHistoryDocument activity,
        CancellationToken cancellationToken)
    {
        try
        {
            await context.ActivityHistory.InsertOneAsync(
                activity,
                cancellationToken: cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Institution analytics could not be saved.");
        }
    }

    private static IReadOnlyList<SearchTermDto> TopValues(
        IEnumerable<Dictionary<string, string>> searches,
        string key) =>
        searches
            .Where(details => details.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
            .Select(details => details[key].Trim())
            .GroupBy(value => value, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key)
            .Take(5)
            .Select(group => new SearchTermDto(group.Key, group.Count()))
            .ToList();

    private static void AddIfPresent(
        IDictionary<string, string> details,
        string key,
        string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
            details[key] = value.Trim();
    }

    private static int NormalizeDays(int days) => Math.Clamp(days, 1, 365);
}
