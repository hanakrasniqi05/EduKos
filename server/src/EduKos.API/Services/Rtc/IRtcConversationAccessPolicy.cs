using EduKos.Domain.Entities;

namespace EduKos.API.Services.Rtc;

public interface IRtcConversationAccessPolicy
{
    Task<Conversation> GetAccessibleConversationAsync(
        int userId,
        IReadOnlyCollection<string> roles,
        int conversationId,
        bool tracked,
        CancellationToken cancellationToken);
}
