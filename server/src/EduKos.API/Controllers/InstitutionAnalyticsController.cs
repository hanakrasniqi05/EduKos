using EduKos.API.Extensions;
using EduKos.API.Models.NoSql;
using EduKos.API.Services.NoSql;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-analytics")]
[Authorize(Roles = "Admin,Shkolla")]
public sealed class InstitutionAnalyticsController(
    AppDbContext context,
    IInstitutionAnalyticsService analyticsService) : ControllerBase
{
    [HttpGet("{institutionId:int}")]
    public async Task<ActionResult<InstitutionAnalyticsDto>> GetInstitutionAnalytics(
        int institutionId,
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default)
    {
        var institution = await context.Institutions
            .AsNoTracking()
            .Where(item => item.InstitutionId == institutionId)
            .Select(item => new { item.InstitutionId, item.OwnerUserId })
            .FirstOrDefaultAsync(cancellationToken);

        if (institution is null)
            return NotFound(new { message = "Institucioni nuk u gjet." });

        if (User.IsInRole("Shkolla") && institution.OwnerUserId != User.GetRequiredUserId())
            return Forbid();

        return Ok(await analyticsService.GetInstitutionAnalyticsAsync(
            institutionId,
            days,
            cancellationToken));
    }

    [HttpGet("searches")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InstitutionSearchAnalyticsDto>> GetSearchAnalytics(
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default) =>
        Ok(await analyticsService.GetSearchAnalyticsAsync(days, cancellationToken));
}
