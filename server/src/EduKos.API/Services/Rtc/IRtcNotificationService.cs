using EduKos.Domain.Entities;

namespace EduKos.API.Services.Rtc;

public interface IRtcNotificationService
{
    Task<IReadOnlyList<RealtimeNotification>> GetNotificationsAsync(
        int userId,
        CancellationToken cancellationToken);

    Task<RealtimeNotification> MarkReadAsync(
        int userId,
        int notificationId,
        CancellationToken cancellationToken);
}
