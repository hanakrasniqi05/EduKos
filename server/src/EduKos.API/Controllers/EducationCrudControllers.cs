using EduKos.Application.DTOs.Education;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[Route("api/[controller]")]
public class InstitutionTypesController(AppDbContext context) : CrudControllerBase<InstitutionType, InstitutionTypeDto>(context)
{
    protected override DbSet<InstitutionType> Set => Context.InstitutionTypes;
    protected override int GetId(InstitutionType entity) => entity.InstitutionTypeId;
    protected override void SetId(InstitutionType entity, int id) => entity.InstitutionTypeId = id;
}

[Route("api/[controller]")]
public class InstitutionDetailsController(AppDbContext context) : CrudControllerBase<InstitutionDetail, InstitutionDetailDto>(context)
{
    protected override DbSet<InstitutionDetail> Set => Context.InstitutionDetails;
    protected override int GetId(InstitutionDetail entity) => entity.InstitutionDetailId;
    protected override void SetId(InstitutionDetail entity, int id) => entity.InstitutionDetailId = id;
}

[Route("api/[controller]")]
public class RecommendationsController(AppDbContext context) : CrudControllerBase<Recommendation, RecommendationDto>(context)
{
    protected override DbSet<Recommendation> Set => Context.Recommendations;
    protected override int GetId(Recommendation entity) => entity.RecommendationId;
    protected override void SetId(Recommendation entity, int id) => entity.RecommendationId = id;
}

[Route("api/[controller]")]
public class NotificationsController(AppDbContext context) : CrudControllerBase<Notification, NotificationDto>(context)
{
    protected override DbSet<Notification> Set => Context.Notifications;
    protected override int GetId(Notification entity) => entity.NotificationId;
    protected override void SetId(Notification entity, int id) => entity.NotificationId = id;

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var notifications = await Context.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(notifications.Select(MapToDto));
    }
}

[Route("api/[controller]")]
public class FilesController(AppDbContext context) : CrudControllerBase<FileAsset, FileDto>(context)
{
    protected override DbSet<FileAsset> Set => Context.Files;
    protected override int GetId(FileAsset entity) => entity.FileId;
    protected override void SetId(FileAsset entity, int id) => entity.FileId = id;
}

[Route("api/[controller]")]
public class SettingsController(AppDbContext context) : CrudControllerBase<Setting, SettingDto>(context)
{
    protected override DbSet<Setting> Set => Context.Settings;
    protected override int GetId(Setting entity) => entity.SettingId;
    protected override void SetId(Setting entity, int id) => entity.SettingId = id;
}
