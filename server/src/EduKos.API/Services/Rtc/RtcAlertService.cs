using EduKos.Application.DTOs.Auth;
using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Services.Rtc;

public sealed class RtcAlertService(
    AppDbContext context,
    IRtcEventPublisher eventPublisher) : IRtcAlertService
{
    public async Task PublishNewApplicationAsync(
        InstitutionApplication application,
        CancellationToken cancellationToken)
    {
        var institutionOwnerUserId = await context.Institutions
            .Where(institution => institution.InstitutionId == application.InstitutionId)
            .Select(institution => institution.OwnerUserId)
            .FirstOrDefaultAsync(cancellationToken);
        var adminUserIds = await GetAdminUserIdsAsync(cancellationToken);
        int[] institutionUserIds = institutionOwnerUserId.HasValue
            ? [institutionOwnerUserId.Value]
            : [];
        var recipients = adminUserIds.Concat(institutionUserIds).Distinct().ToArray();

        AddNotifications(
            recipients,
            RtcNotificationTypes.NewApplication,
            "Aplikim i ri",
            $"{application.FullName} ka aplikuar ne {application.Institution?.Name}.",
            application.ApplicationId);
        await context.SaveChangesAsync(cancellationToken);

        var payload = new
        {
            type = RtcNotificationTypes.NewApplication,
            applicationId = application.ApplicationId,
            institutionId = application.InstitutionId,
            institutionName = application.Institution?.Name,
            applicantName = application.FullName
        };

        await eventPublisher.PublishAsync(
            RtcEventNames.AdminAlert,
            adminUserIds,
            payload,
            cancellationToken);
        await eventPublisher.PublishAsync(
            RtcEventNames.InstitutionAlert,
            institutionUserIds,
            payload,
            cancellationToken);
    }

    public async Task UpdateApplicationStatusAsync(
        InstitutionApplication application,
        int changedByUserId,
        string status,
        CancellationToken cancellationToken)
    {
        application.Status = status;
        context.ApplicationStatusUpdates.Add(new ApplicationStatusUpdate
        {
            ApplicationId = application.ApplicationId,
            ChangedByUserId = changedByUserId,
            Status = status
        });

        if (application.UserId.HasValue)
        {
            AddNotifications(
                [application.UserId.Value],
                RtcNotificationTypes.ApplicationStatus,
                "Statusi i aplikimit u ndryshua",
                $"Aplikimi juaj tani eshte: {status}.",
                application.ApplicationId);
        }

        await context.SaveChangesAsync(cancellationToken);

        if (application.UserId.HasValue)
        {
            await eventPublisher.PublishAsync(
                RtcEventNames.ApplicationStatusUpdated,
                [application.UserId.Value],
                new
                {
                    applicationId = application.ApplicationId,
                    status,
                    updatedAt = DateTime.UtcNow
                },
                cancellationToken);
        }
    }

    public async Task PublishInstitutionRegistrationAsync(
        AuthResponseDto authResponse,
        CancellationToken cancellationToken)
    {
        if (!authResponse.Roles.Contains(AppRoles.Shkolla))
            return;

        var ownerUserId = int.Parse(authResponse.UserId);
        var institution = await context.Institutions
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.OwnerUserId == ownerUserId, cancellationToken);
        var adminUserIds = await GetAdminUserIdsAsync(cancellationToken);
        var institutionName = institution?.Name ?? authResponse.Email;

        AddNotifications(
            adminUserIds,
            RtcNotificationTypes.InstitutionRegistration,
            "Regjistrim i ri i institucionit",
            $"{institutionName} eshte regjistruar dhe pret aprovim.",
            institution?.InstitutionId);
        await context.SaveChangesAsync(cancellationToken);

        await eventPublisher.PublishAsync(
            RtcEventNames.AdminAlert,
            adminUserIds,
            new
            {
                type = RtcNotificationTypes.InstitutionRegistration,
                institutionId = institution?.InstitutionId,
                institutionName = institution?.Name,
                ownerEmail = authResponse.Email
            },
            cancellationToken);
    }

    public async Task PublishInstitutionAnnouncementAsync(
        InstitutionAnnouncement announcement,
        CancellationToken cancellationToken)
    {
        var institutionName = await context.Institutions
            .Where(institution => institution.InstitutionId == announcement.InstitutionId)
            .Select(institution => institution.Name)
            .FirstAsync(cancellationToken);

        var savedRecipientIds = context.SavedInstitutions
            .Where(saved => saved.InstitutionId == announcement.InstitutionId)
            .Select(saved => saved.UserId);
        var applicantRecipientIds = context.Applications
            .Where(application =>
                application.InstitutionId == announcement.InstitutionId
                && application.UserId.HasValue)
            .Select(application => application.UserId!.Value);
        var recipientUserIds = await savedRecipientIds
            .Concat(applicantRecipientIds)
            .Distinct()
            .Where(userId => context.Users.Any(user => user.UserId == userId && user.IsActive))
            .ToArrayAsync(cancellationToken);

        if (recipientUserIds.Length == 0)
            return;

        var title = $"Njoftim i ri nga {institutionName}";
        var message = announcement.Title;

        foreach (var recipientUserId in recipientUserIds)
        {
            context.Notifications.Add(new Notification
            {
                UserId = recipientUserId,
                Title = title,
                Message = message
            });
        }

        AddNotifications(
            recipientUserIds,
            RtcNotificationTypes.InstitutionAnnouncement,
            title,
            message,
            announcement.AnnouncementId);
        await context.SaveChangesAsync(cancellationToken);

        await eventPublisher.PublishAsync(
            RtcEventNames.InstitutionAlert,
            recipientUserIds,
            new
            {
                type = RtcNotificationTypes.InstitutionAnnouncement,
                announcementId = announcement.AnnouncementId,
                institutionId = announcement.InstitutionId,
                institutionName,
                title = announcement.Title,
                content = announcement.Content,
                createdAt = announcement.CreatedAt
            },
            cancellationToken);
    }

    private async Task<int[]> GetAdminUserIdsAsync(CancellationToken cancellationToken) =>
        await context.UserRoles
            .Where(userRole => userRole.Role.Name == AppRoles.Admin && userRole.User.IsActive)
            .Select(userRole => userRole.UserId)
            .Distinct()
            .ToArrayAsync(cancellationToken);

    private void AddNotifications(
        IEnumerable<int> recipientUserIds,
        string type,
        string title,
        string message,
        int? entityId)
    {
        foreach (var recipientUserId in recipientUserIds.Distinct())
        {
            context.RealtimeNotifications.Add(new RealtimeNotification
            {
                RecipientUserId = recipientUserId,
                Type = type,
                Title = title,
                Message = message,
                EntityId = entityId
            });
        }
    }
}
