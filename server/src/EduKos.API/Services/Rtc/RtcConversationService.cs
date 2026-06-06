using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Services.Rtc;

public sealed class RtcConversationService(AppDbContext context) : IRtcConversationService
{
    public async Task<Conversation> OpenInstitutionConversationAsync(
        int userId,
        int institutionId,
        CancellationToken cancellationToken)
    {
        await EnsureRoleAsync(userId, AppRoles.Nxenes, cancellationToken);

        var institutionExists = await context.Institutions.AnyAsync(
            institution => institution.InstitutionId == institutionId
                && institution.OwnerUserId != null,
            cancellationToken);

        if (!institutionExists)
            throw new KeyNotFoundException("Institucioni nuk u gjet ose nuk ka llogari aktive.");

        return await FindOrCreateAsync(
            conversation => conversation.Type == RtcConversationTypes.StudentInstitution
                && conversation.StudentUserId == userId
                && conversation.InstitutionId == institutionId,
            new Conversation
            {
                Type = RtcConversationTypes.StudentInstitution,
                StudentUserId = userId,
                InstitutionId = institutionId
            },
            cancellationToken);
    }

    public async Task<Conversation> OpenAdminConversationAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        await EnsureRoleAsync(userId, AppRoles.Shkolla, cancellationToken);

        var institution = await context.Institutions.FirstOrDefaultAsync(
            item => item.OwnerUserId == userId,
            cancellationToken)
            ?? throw new KeyNotFoundException("Institucioni i perdoruesit nuk u gjet.");

        var adminUserId = await context.UserRoles
            .Where(userRole => userRole.Role.Name == AppRoles.Admin && userRole.User.IsActive)
            .Select(userRole => userRole.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (adminUserId == 0)
            throw new KeyNotFoundException("Administratori nuk u gjet.");

        return await FindOrCreateAsync(
            conversation => conversation.Type == RtcConversationTypes.InstitutionAdmin
                && conversation.InstitutionId == institution.InstitutionId
                && conversation.AdminUserId == adminUserId,
            new Conversation
            {
                Type = RtcConversationTypes.InstitutionAdmin,
                InstitutionId = institution.InstitutionId,
                AdminUserId = adminUserId
            },
            cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetConversationsAsync(
        int userId,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken)
    {
        var query = context.Conversations
            .AsNoTracking()
            .Include(conversation => conversation.Institution)
            .AsQueryable();

        query = roles switch
        {
            _ when roles.Contains(AppRoles.Admin) =>
                query.Where(item => item.Type == RtcConversationTypes.InstitutionAdmin),
            _ when roles.Contains(AppRoles.Shkolla) =>
                query.Where(item => item.Institution.OwnerUserId == userId),
            _ when roles.Contains(AppRoles.Nxenes) =>
                query.Where(item => item.Type == RtcConversationTypes.StudentInstitution
                    && item.StudentUserId == userId),
            _ => query.Where(_ => false)
        };

        return await query.OrderByDescending(item => item.UpdatedAt).ToListAsync(cancellationToken);
    }

    public async Task<int[]> GetParticipantUserIdsAsync(
        int conversationId,
        CancellationToken cancellationToken)
    {
        var participants = await context.Conversations
            .AsNoTracking()
            .Where(conversation => conversation.ConversationId == conversationId)
            .Select(conversation => new
            {
                conversation.StudentUserId,
                InstitutionOwnerUserId = conversation.Institution.OwnerUserId,
                conversation.AdminUserId
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException("Biseda nuk u gjet.");

        return new[]
            {
                participants.StudentUserId,
                participants.InstitutionOwnerUserId,
                participants.AdminUserId
            }
            .Where(userId => userId.HasValue)
            .Select(userId => userId!.Value)
            .Distinct()
            .ToArray();
    }

    private async Task<Conversation> FindOrCreateAsync(
        System.Linq.Expressions.Expression<Func<Conversation, bool>> predicate,
        Conversation candidate,
        CancellationToken cancellationToken)
    {
        var existing = await context.Conversations
            .Include(conversation => conversation.Institution)
            .FirstOrDefaultAsync(predicate, cancellationToken);

        if (existing != null)
            return existing;

        context.Conversations.Add(candidate);
        await context.SaveChangesAsync(cancellationToken);
        await context.Entry(candidate).Reference(conversation => conversation.Institution).LoadAsync(cancellationToken);
        return candidate;
    }

    private async Task EnsureRoleAsync(
        int userId,
        string role,
        CancellationToken cancellationToken)
    {
        var hasRole = await context.UserRoles.AnyAsync(
            userRole => userRole.UserId == userId && userRole.Role.Name == role,
            cancellationToken);

        if (!hasRole)
            throw new UnauthorizedAccessException("Nuk keni leje per kete veprim.");
    }
}
