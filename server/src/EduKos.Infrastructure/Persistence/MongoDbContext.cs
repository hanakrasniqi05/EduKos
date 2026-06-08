using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EduKos.Infrastructure.Persistence;

public class MongoDbContext
{
    public MongoDbContext(IMongoDatabase database, IOptions<MongoDbSettings> settings)
    {
        var collectionNames = settings.Value;
        Logs = database.GetCollection<LogDocument>(collectionNames.LogsCollection);
        Notifications = database.GetCollection<NotificationDocument>(collectionNames.NotificationsCollection);
        ActivityHistory = database.GetCollection<ActivityHistoryDocument>(collectionNames.ActivityHistoryCollection);
    }

    public IMongoCollection<LogDocument> Logs { get; }
    public IMongoCollection<NotificationDocument> Notifications { get; }
    public IMongoCollection<ActivityHistoryDocument> ActivityHistory { get; }
}
