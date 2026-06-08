namespace EduKos.API.Models.NoSql;

public sealed record DailyViewDto(DateOnly Date, long Views);

public sealed record InstitutionAnalyticsDto(
    int InstitutionId,
    DateTime From,
    long TotalViews,
    int UniqueAuthenticatedUsers,
    IReadOnlyList<DailyViewDto> DailyViews);

public sealed record SearchTermDto(string Value, int Count);

public sealed record InstitutionSearchAnalyticsDto(
    DateTime From,
    int TotalSearches,
    IReadOnlyList<SearchTermDto> TopNames,
    IReadOnlyList<SearchTermDto> TopCities,
    IReadOnlyList<SearchTermDto> TopCategories,
    IReadOnlyList<SearchTermDto> TopPrograms);
