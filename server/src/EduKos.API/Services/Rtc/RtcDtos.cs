namespace EduKos.API.Services.Rtc;

public sealed record CreateInstitutionConversationRequest(int InstitutionId);

public sealed record SendRtcMessageRequest(string Body);

public sealed record RtcConversationDto(
    int ConversationId,
    string Type,
    int? StudentUserId,
    int InstitutionId,
    string InstitutionName,
    int? AdminUserId,
    string? LastMessage,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record RtcMessageDto(
    int MessageId,
    int ConversationId,
    int SenderUserId,
    string Body,
    DateTime CreatedAt,
    DateTime? ReadAt);

public sealed record RealtimeNotificationDto(
    int RealtimeNotificationId,
    int RecipientUserId,
    string Type,
    string Title,
    string Message,
    int? EntityId,
    bool IsRead,
    DateTime CreatedAt);
