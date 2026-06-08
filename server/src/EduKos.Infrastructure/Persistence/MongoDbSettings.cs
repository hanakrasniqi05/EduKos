namespace EduKos.Infrastructure.Persistence;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";
    public string DatabaseName { get; set; } = "EduKosNonRelational";
    public string LogsCollection { get; set; } = "logs";
    public string NotificationsCollection { get; set; } = "notifications";
    public string ActivityHistoryCollection { get; set; } = "activity_history";
}
