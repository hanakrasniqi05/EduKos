namespace EduKos.Application.DTOs.Common;

public record PagedResultDto<T>
{
    public IEnumerable<T> Items { get; init; } = [];
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
}
