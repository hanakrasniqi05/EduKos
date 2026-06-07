using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Services.Rtc;

public sealed class RtcMessageService(
    AppDbContext context,
    IRtcConversationAccessPolicy accessPolicy) : IRtcMessageService
{
    public async Task<IReadOnlyList<Message>> GetMessagesAsync(
        int userId,
        IReadOnlyCollection<string> roles,
        int conversationId,
        CancellationToken cancellationToken)
    {
        await accessPolicy.GetAccessibleConversationAsync(
            userId,
            roles,
            conversationId,
            tracked: false,
            cancellationToken);

        return await context.Messages
            .AsNoTracking()
            .Where(message => message.ConversationId == conversationId)
            .OrderBy(message => message.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<RtcMessageDelivery> SendMessageAsync(
        int userId,
        IReadOnlyCollection<string> roles,
        int conversationId,
        string body,
        CancellationToken cancellationToken)
    {
        var normalizedBody = ValidateBody(body);
        var conversation = await accessPolicy.GetAccessibleConversationAsync(
            userId,
            roles,
            conversationId,
            tracked: true,
            cancellationToken);

        var message = new Message
        {
            ConversationId = conversationId,
            SenderUserId = userId,
            Body = normalizedBody
        };

        conversation.LastMessage = Truncate(normalizedBody, 1000);
        conversation.UpdatedAt = DateTime.UtcNow;
        context.Messages.Add(message);

        RealtimeNotification? notification = null;
        var recipientUserId = ResolveRecipient(conversation, userId);
        if (recipientUserId.HasValue)
        {
            notification = CreateMessageNotification(
                conversation,
                recipientUserId.Value,
                userId,
                normalizedBody);
            context.RealtimeNotifications.Add(notification);
        }

        await context.SaveChangesAsync(cancellationToken);
        return new RtcMessageDelivery(message, notification);
    }

    private static string ValidateBody(string body)
    {
        var normalizedBody = body.Trim();
        return normalizedBody.Length is > 0 and <= 4000
            ? normalizedBody
            : throw new InvalidOperationException(
                "Mesazhi duhet te kete nga 1 deri ne 4000 karaktere.");
    }

    private static RealtimeNotification CreateMessageNotification(
        Conversation conversation,
        int recipientUserId,
        int senderUserId,
        string body)
    {
        var isAdminConversation =
            conversation.Type == RtcConversationTypes.InstitutionAdmin;

        return new RealtimeNotification
        {
            RecipientUserId = recipientUserId,
            Type = isAdminConversation
                ? RtcNotificationTypes.InstitutionMessage
                : RtcNotificationTypes.ConversationMessage,
            Title = isAdminConversation
                ? senderUserId == conversation.AdminUserId
                    ? "Mesazh i ri nga administrata"
                    : "Mesazh i ri nga institucioni"
                : senderUserId == conversation.StudentUserId
                    ? "Mesazh i ri nga nxenesi"
                    : "Mesazh i ri nga institucioni",
            Message = Truncate(body, 200),
            EntityId = conversation.ConversationId
        };
    }

    private static int? ResolveRecipient(Conversation conversation, int senderUserId)
    {
        if (conversation.Type == RtcConversationTypes.StudentInstitution)
            return senderUserId == conversation.StudentUserId
                ? conversation.Institution.OwnerUserId
                : conversation.StudentUserId;

        return senderUserId == conversation.Institution.OwnerUserId
            ? conversation.AdminUserId
            : conversation.Institution.OwnerUserId;
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length > maxLength ? value[..maxLength] : value;
}
