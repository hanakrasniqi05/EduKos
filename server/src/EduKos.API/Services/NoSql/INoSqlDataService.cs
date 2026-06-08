using EduKos.Infrastructure.Persistence;

namespace EduKos.API.Services.NoSql;

public interface INoSqlDataService
{
    Task<NotificationDocument> CreateNotificationAsync(
        int userId,
        string title,
        string message,
        string type,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationDocument>> GetNotificationsAsync(
        int userId,
        int limit,
        CancellationToken cancellationToken = default);

    Task<NotificationDocument?> MarkNotificationReadAsync(
        int userId,
        string notificationId,
        CancellationToken cancellationToken = default);

    Task AddActivityAsync(
        int? userId,
        string action,
        string? entityName,
        string? entityId,
        IReadOnlyDictionary<string, string>? details = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ActivityHistoryDocument>> GetActivitiesAsync(
        int? userId,
        int limit,
        CancellationToken cancellationToken = default);

    Task AddLogAsync(
        string level,
        string message,
        string? source,
        int? userId,
        IReadOnlyDictionary<string, string>? metadata = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogDocument>> GetLogsAsync(
        int limit,
        CancellationToken cancellationToken = default);
}
