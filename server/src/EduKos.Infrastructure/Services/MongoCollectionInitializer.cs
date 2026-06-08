using EduKos.Infrastructure.Persistence;
using MongoDB.Driver;

namespace EduKos.Infrastructure.Services;

public class MongoCollectionInitializer
{
    private readonly MongoDbContext _context;

    public MongoCollectionInitializer(MongoDbContext context)
    {
        _context = context;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await EnsureLogIndexesAsync(cancellationToken);
        await EnsureNotificationIndexesAsync(cancellationToken);
        await EnsureActivityHistoryIndexesAsync(cancellationToken);
    }

    private Task EnsureLogIndexesAsync(CancellationToken cancellationToken)
    {
        var indexes = new[]
        {
            new CreateIndexModel<LogDocument>(
                Builders<LogDocument>.IndexKeys.Descending(x => x.CreatedAt)),
            new CreateIndexModel<LogDocument>(
                Builders<LogDocument>.IndexKeys.Ascending(x => x.UserId).Descending(x => x.CreatedAt))
        };

        return _context.Logs.Indexes.CreateManyAsync(indexes, cancellationToken);
    }

    private Task EnsureNotificationIndexesAsync(CancellationToken cancellationToken)
    {
        var indexes = new[]
        {
            new CreateIndexModel<NotificationDocument>(
                Builders<NotificationDocument>.IndexKeys.Ascending(x => x.UserId).Descending(x => x.CreatedAt)),
            new CreateIndexModel<NotificationDocument>(
                Builders<NotificationDocument>.IndexKeys.Ascending(x => x.UserId).Ascending(x => x.IsRead))
        };

        return _context.Notifications.Indexes.CreateManyAsync(indexes, cancellationToken);
    }

    private Task EnsureActivityHistoryIndexesAsync(CancellationToken cancellationToken)
    {
        var indexes = new[]
        {
            new CreateIndexModel<ActivityHistoryDocument>(
                Builders<ActivityHistoryDocument>.IndexKeys.Ascending(x => x.UserId).Descending(x => x.CreatedAt)),
            new CreateIndexModel<ActivityHistoryDocument>(
                Builders<ActivityHistoryDocument>.IndexKeys.Ascending(x => x.Action).Descending(x => x.CreatedAt)),
            new CreateIndexModel<ActivityHistoryDocument>(
                Builders<ActivityHistoryDocument>.IndexKeys
                    .Ascending(x => x.Action)
                    .Ascending(x => x.EntityName)
                    .Ascending(x => x.EntityId)
                    .Descending(x => x.CreatedAt))
        };

        return _context.ActivityHistory.Indexes.CreateManyAsync(indexes, cancellationToken);
    }
}
