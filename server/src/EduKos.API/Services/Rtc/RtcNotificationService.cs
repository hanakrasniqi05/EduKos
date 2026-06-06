using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Services.Rtc;

public sealed class RtcNotificationService(AppDbContext context) : IRtcNotificationService
{
    public async Task<IReadOnlyList<RealtimeNotification>> GetNotificationsAsync(
        int userId,
        CancellationToken cancellationToken) =>
        await context.RealtimeNotifications
            .AsNoTracking()
            .Where(notification => notification.RecipientUserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .Take(100)
            .ToListAsync(cancellationToken);

    public async Task<RealtimeNotification> MarkReadAsync(
        int userId,
        int notificationId,
        CancellationToken cancellationToken)
    {
        var notification = await context.RealtimeNotifications.FirstOrDefaultAsync(
            item => item.RealtimeNotificationId == notificationId
                && item.RecipientUserId == userId,
            cancellationToken)
            ?? throw new KeyNotFoundException("Njoftimi nuk u gjet.");

        notification.IsRead = true;
        await context.SaveChangesAsync(cancellationToken);
        return notification;
    }
}
