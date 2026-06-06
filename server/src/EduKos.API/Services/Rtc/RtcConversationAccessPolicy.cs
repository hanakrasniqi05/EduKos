using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Services.Rtc;

public sealed class RtcConversationAccessPolicy(AppDbContext context) : IRtcConversationAccessPolicy
{
    public async Task<Conversation> GetAccessibleConversationAsync(
        int userId,
        IReadOnlyCollection<string> roles,
        int conversationId,
        bool tracked,
        CancellationToken cancellationToken)
    {
        var query = context.Conversations.Include(conversation => conversation.Institution).AsQueryable();
        if (!tracked)
            query = query.AsNoTracking();

        var conversation = await query.FirstOrDefaultAsync(
            item => item.ConversationId == conversationId,
            cancellationToken)
            ?? throw new KeyNotFoundException("Biseda nuk u gjet.");

        if (!HasAccess(conversation, userId, roles))
            throw new UnauthorizedAccessException("Nuk keni qasje ne kete bisede.");

        return conversation;
    }

    private static bool HasAccess(
        Conversation conversation,
        int userId,
        IReadOnlyCollection<string> roles) =>
        roles.Contains(AppRoles.Nxenes)
            && conversation.Type == RtcConversationTypes.StudentInstitution
            && conversation.StudentUserId == userId
        || roles.Contains(AppRoles.Shkolla)
            && conversation.Institution.OwnerUserId == userId
        || roles.Contains(AppRoles.Admin)
            && conversation.Type == RtcConversationTypes.InstitutionAdmin;
}
