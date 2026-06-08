using EduKos.Infrastructure.Persistence;
using MongoDB.Bson;
using MongoDB.Driver;

namespace EduKos.API.Services.NoSql;

public sealed class NoSqlDataService(MongoDbContext context) : INoSqlDataService
{
    public async Task<NotificationDocument> CreateNotificationAsync(
        int userId,
        string title,
        string message,
        string type,
        CancellationToken cancellationToken = default)
    {
        var notification = new NotificationDocument
        {
            UserId = userId,
            Title = title.Trim(),
            Message = message.Trim(),
            Type = string.IsNullOrWhiteSpace(type) ? "general" : type.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await context.Notifications.InsertOneAsync(notification, cancellationToken: cancellationToken);
        return notification;
    }

    public async Task<IReadOnlyList<NotificationDocument>> GetNotificationsAsync(
        int userId,
        int limit,
        CancellationToken cancellationToken = default) =>
        await context.Notifications
            .Find(notification => notification.UserId == userId)
            .SortByDescending(notification => notification.CreatedAt)
            .Limit(NormalizeLimit(limit))
            .ToListAsync(cancellationToken);

    public async Task<NotificationDocument?> MarkNotificationReadAsync(
        int userId,
        string notificationId,
        CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(notificationId, out _))
            return null;

        var filter = Builders<NotificationDocument>.Filter.And(
            Builders<NotificationDocument>.Filter.Eq(notification => notification.Id, notificationId),
            Builders<NotificationDocument>.Filter.Eq(notification => notification.UserId, userId));

        return await context.Notifications.FindOneAndUpdateAsync(
            filter,
            Builders<NotificationDocument>.Update.Set(notification => notification.IsRead, true),
            new FindOneAndUpdateOptions<NotificationDocument> { ReturnDocument = ReturnDocument.After },
            cancellationToken);
    }

    public Task AddActivityAsync(
        int? userId,
        string action,
        string? entityName,
        string? entityId,
        IReadOnlyDictionary<string, string>? details = null,
        CancellationToken cancellationToken = default) =>
        context.ActivityHistory.InsertOneAsync(
            new ActivityHistoryDocument
            {
                UserId = userId,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                CreatedAt = DateTime.UtcNow,
                Details = Copy(details)
            },
            cancellationToken: cancellationToken);

    public async Task<IReadOnlyList<ActivityHistoryDocument>> GetActivitiesAsync(
        int? userId,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var filter = userId.HasValue
            ? Builders<ActivityHistoryDocument>.Filter.Eq(activity => activity.UserId, userId.Value)
            : Builders<ActivityHistoryDocument>.Filter.Empty;

        return await context.ActivityHistory
            .Find(filter)
            .SortByDescending(activity => activity.CreatedAt)
            .Limit(NormalizeLimit(limit))
            .ToListAsync(cancellationToken);
    }

    public Task AddLogAsync(
        string level,
        string message,
        string? source,
        int? userId,
        IReadOnlyDictionary<string, string>? metadata = null,
        CancellationToken cancellationToken = default) =>
        context.Logs.InsertOneAsync(
            new LogDocument
            {
                Level = level,
                Message = message,
                Source = source,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                Metadata = Copy(metadata)
            },
            cancellationToken: cancellationToken);

    public async Task<IReadOnlyList<LogDocument>> GetLogsAsync(
        int limit,
        CancellationToken cancellationToken = default) =>
        await context.Logs
            .Find(Builders<LogDocument>.Filter.Empty)
            .SortByDescending(log => log.CreatedAt)
            .Limit(NormalizeLimit(limit))
            .ToListAsync(cancellationToken);

    private static int NormalizeLimit(int limit) => Math.Clamp(limit, 1, 100);

    private static Dictionary<string, string> Copy(IReadOnlyDictionary<string, string>? values) =>
        values?.ToDictionary(pair => pair.Key, pair => pair.Value) ?? new();
}
