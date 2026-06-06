namespace EduKos.Domain.Entities;

public class Conversation
{
    public int ConversationId { get; set; }
    public string Type { get; set; } = default!;
    public int? StudentUserId { get; set; }
    public int InstitutionId { get; set; }
    public int? AdminUserId { get; set; }
    public string? LastMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? StudentUser { get; set; }
    public Institution Institution { get; set; } = default!;
    public User? AdminUser { get; set; }
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}

public class Message
{
    public int MessageId { get; set; }
    public int ConversationId { get; set; }
    public int SenderUserId { get; set; }
    public string Body { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    public Conversation Conversation { get; set; } = default!;
    public User SenderUser { get; set; } = default!;
}

public class RealtimeNotification
{
    public int RealtimeNotificationId { get; set; }
    public int RecipientUserId { get; set; }
    public string Type { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public int? EntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User RecipientUser { get; set; } = default!;
}

public class ApplicationStatusUpdate
{
    public int ApplicationStatusUpdateId { get; set; }
    public int ApplicationId { get; set; }
    public int ChangedByUserId { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public InstitutionApplication Application { get; set; } = default!;
    public User ChangedByUser { get; set; } = default!;
}
