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
public class InstitutionProgramsController(AppDbContext context) : CrudControllerBase<InstitutionProgram, InstitutionProgramDto>(context)
{
    protected override DbSet<InstitutionProgram> Set => Context.InstitutionPrograms;
    protected override int GetId(InstitutionProgram entity) => entity.ProgramId;
    protected override void SetId(InstitutionProgram entity, int id) => entity.ProgramId = id;
}

[Route("api/[controller]")]
public class InstitutionStaffController(AppDbContext context) : CrudControllerBase<InstitutionStaff, InstitutionStaffDto>(context)
{
    protected override DbSet<InstitutionStaff> Set => Context.InstitutionStaff;
    protected override int GetId(InstitutionStaff entity) => entity.StaffId;
    protected override void SetId(InstitutionStaff entity, int id) => entity.StaffId = id;
}

[Route("api/[controller]")]
public class InstitutionFacilitiesController(AppDbContext context) : CrudControllerBase<InstitutionFacility, InstitutionFacilityDto>(context)
{
    protected override DbSet<InstitutionFacility> Set => Context.InstitutionFacilities;
    protected override int GetId(InstitutionFacility entity) => entity.FacilityId;
    protected override void SetId(InstitutionFacility entity, int id) => entity.FacilityId = id;
}

[Route("api/[controller]")]
public class InstitutionAnnouncementsController(AppDbContext context) : CrudControllerBase<InstitutionAnnouncement, InstitutionAnnouncementDto>(context)
{
    protected override DbSet<InstitutionAnnouncement> Set => Context.InstitutionAnnouncements;
    protected override int GetId(InstitutionAnnouncement entity) => entity.AnnouncementId;
    protected override void SetId(InstitutionAnnouncement entity, int id) => entity.AnnouncementId = id;
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

