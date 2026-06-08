using EduKos.API.Extensions;
using EduKos.API.Models.NoSql;
using EduKos.API.Services.NoSql;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/nosql")]
[Authorize]
public sealed class NoSqlController(INoSqlDataService noSqlDataService) : ControllerBase
{
    [HttpGet("notifications")]
    public async Task<ActionResult<IEnumerable<MongoNotificationDto>>> GetMyNotifications(
        [FromQuery] int limit = 30,
        CancellationToken cancellationToken = default)
    {
        var notifications = await noSqlDataService.GetNotificationsAsync(
            User.GetRequiredUserId(),
            limit,
            cancellationToken);

        return Ok(notifications.Select(notification => notification.ToDto()));
    }

    [HttpPatch("notifications/{id}/read")]
    public async Task<ActionResult<MongoNotificationDto>> MarkNotificationRead(
        string id,
        CancellationToken cancellationToken)
    {
        var notification = await noSqlDataService.MarkNotificationReadAsync(
            User.GetRequiredUserId(),
            id,
            cancellationToken);

        return notification is null
            ? NotFound(new { message = "Njoftimi nuk u gjet." })
            : Ok(notification.ToDto());
    }

    [HttpPost("notifications")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MongoNotificationDto>> CreateNotification(
        CreateMongoNotificationRequest request,
        CancellationToken cancellationToken)
    {
        var notification = await noSqlDataService.CreateNotificationAsync(
            request.UserId,
            request.Title,
            request.Message,
            request.Type,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetMyNotifications),
            new { id = notification.Id },
            notification.ToDto());
    }

    [HttpGet("activity/mine")]
    public async Task<ActionResult<IEnumerable<MongoActivityDto>>> GetMyActivity(
        [FromQuery] int limit = 30,
        CancellationToken cancellationToken = default)
    {
        var activities = await noSqlDataService.GetActivitiesAsync(
            User.GetRequiredUserId(),
            limit,
            cancellationToken);

        return Ok(activities.Select(activity => activity.ToDto()));
    }

    [HttpGet("activity")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<MongoActivityDto>>> GetActivity(
        [FromQuery] int? userId,
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        var activities = await noSqlDataService.GetActivitiesAsync(userId, limit, cancellationToken);
        return Ok(activities.Select(activity => activity.ToDto()));
    }

    [HttpGet("logs")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<MongoLogDto>>> GetLogs(
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        var logs = await noSqlDataService.GetLogsAsync(limit, cancellationToken);
        return Ok(logs.Select(log => log.ToDto()));
    }
}
