using EduKos.API.Extensions;
using EduKos.API.Services.Rtc;
using EduKos.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduKos.API.Controllers.Rtc;

[ApiController]
[Route("api/rtc/notifications")]
[Authorize]
[ServiceFilter(typeof(RtcExceptionFilter))]
public sealed class RtcNotificationsController(
    IRtcNotificationService notificationService,
    IRtcEventPublisher eventPublisher) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RealtimeNotificationDto>>> GetNotifications(
        CancellationToken cancellationToken)
    {
        var notifications = await notificationService.GetNotificationsAsync(
            User.GetRequiredUserId(),
            cancellationToken);

        return Ok(notifications.Select(RtcDtoMapper.ToDto));
    }

    [HttpPatch("{id:int}/read")]
    public async Task<ActionResult<RealtimeNotificationDto>> MarkRead(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = User.GetRequiredUserId();
        var notification = await notificationService.MarkReadAsync(
            userId,
            id,
            cancellationToken);
        var dto = notification.ToDto();

        await eventPublisher.PublishAsync(
            RtcEventNames.NotificationRead,
            [userId],
            dto,
            cancellationToken);

        return Ok(dto);
    }
}
