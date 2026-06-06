using EduKos.Domain.Entities;

namespace EduKos.API.Services.Rtc;

public interface IRtcConversationService
{
    Task<Conversation> OpenInstitutionConversationAsync(int userId, int institutionId, CancellationToken cancellationToken);
    Task<Conversation> OpenAdminConversationAsync(int userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Conversation>> GetConversationsAsync(int userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken);
    Task<int[]> GetParticipantUserIdsAsync(int conversationId, CancellationToken cancellationToken);
}
