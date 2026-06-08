using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EduKos.Infrastructure.Persistence;

public class LogDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string Level { get; set; } = "Information";
    public string Message { get; set; } = default!;
    public string? Source { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Dictionary<string, string> Metadata { get; set; } = new();
}

public class NotificationDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string Type { get; set; } = "general";
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ActivityHistoryDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; } = default!;
    public string? EntityName { get; set; }
    public string? EntityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Dictionary<string, string> Details { get; set; } = new();
}
