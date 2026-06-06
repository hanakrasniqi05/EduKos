using EduKos.Domain.Entities;

namespace EduKos.API.Services.Rtc;

public static class RtcDtoMapper
{
    public static RtcConversationDto ToDto(this Conversation conversation) =>
        new(
            conversation.ConversationId,
            conversation.Type,
            conversation.StudentUserId,
            conversation.InstitutionId,
            conversation.Institution.Name,
            conversation.AdminUserId,
            conversation.LastMessage,
            conversation.CreatedAt,
            conversation.UpdatedAt);

    public static RtcMessageDto ToDto(this Message message) =>
        new(
            message.MessageId,
            message.ConversationId,
            message.SenderUserId,
            message.Body,
            message.CreatedAt,
            message.ReadAt);

    public static RealtimeNotificationDto ToDto(this RealtimeNotification notification) =>
        new(
            notification.RealtimeNotificationId,
            notification.RecipientUserId,
            notification.Type,
            notification.Title,
            notification.Message,
            notification.EntityId,
            notification.IsRead,
            notification.CreatedAt);
}
