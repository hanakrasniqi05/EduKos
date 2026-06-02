using System.Security.Claims;
using EduKos.Application.DTOs.Education;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Shkolla")]
    public async Task<ActionResult<IEnumerable<ApplicationDto>>> GetAll(
        [FromQuery] int? institutionId,
        [FromQuery] int? userId,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = BaseQuery();

        if (institutionId.HasValue)
            query = query.Where(x => x.InstitutionId == institutionId.Value);

        if (userId.HasValue)
            query = query.Where(x => x.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(x => x.Status == status);

        var applications = await query.OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);
        return Ok(applications.Select(ToDto));
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<ApplicationDto>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId();
        var applications = await BaseQuery()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(applications.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApplicationDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var application = await BaseQuery().FirstOrDefaultAsync(x => x.ApplicationId == id, cancellationToken);

        if (application == null)
            return NotFound();

        if (!User.IsInRole("Admin") && !User.IsInRole("Shkolla") && application.UserId != CurrentUserId())
            return Forbid();

        return Ok(ToDto(application));
    }

    [HttpPost]
    public async Task<ActionResult<ApplicationDto>> Create([FromBody] ApplicationDto dto, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId();

        if (dto.DocumentFileId.HasValue)
        {
            var ownsDocument = await context.Files.AnyAsync(
                x => x.FileId == dto.DocumentFileId.Value && x.UploadedByUserId == userId,
                cancellationToken);

            if (!ownsDocument)
                return BadRequest(new { message = "Selected document was not found for this user." });
        }

        var application = new InstitutionApplication
        {
            InstitutionId = dto.InstitutionId,
            UserId = userId,
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            EducationLevel = dto.EducationLevel,
            SelectedProgram = dto.SelectedProgram,
            Message = dto.Message,
            DocumentFileId = dto.DocumentFileId,
            Status = "pending"
        };

        await context.Applications.AddAsync(application, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        application = await BaseQuery()
            .FirstAsync(x => x.ApplicationId == application.ApplicationId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = application.ApplicationId }, ToDto(application));
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Shkolla")]
    public async Task<ActionResult<ApplicationDto>> UpdateStatus(
        int id,
        [FromBody] ApplicationStatusUpdateDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.Status is not ("pending" or "approved" or "rejected"))
            return BadRequest(new { message = "Status must be pending, approved, or rejected." });

        var application = await context.Applications.FindAsync([id], cancellationToken);
        if (application == null)
            return NotFound();

        application.Status = dto.Status;
        await context.SaveChangesAsync(cancellationToken);

        var updated = await BaseQuery().FirstAsync(x => x.ApplicationId == id, cancellationToken);
        return Ok(ToDto(updated));
    }

    private IQueryable<InstitutionApplication> BaseQuery() =>
        context.Applications
            .AsNoTracking()
            .Include(x => x.Institution)
            .Include(x => x.DocumentFile);

    private int CurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : throw new UnauthorizedAccessException("Invalid user.");
    }

    private static ApplicationDto ToDto(InstitutionApplication application) => new()
    {
        ApplicationId = application.ApplicationId,
        InstitutionId = application.InstitutionId,
        UserId = application.UserId,
        FullName = application.FullName,
        Email = application.Email,
        Phone = application.Phone,
        EducationLevel = application.EducationLevel,
        SelectedProgram = application.SelectedProgram,
        Message = application.Message,
        DocumentFileId = application.DocumentFileId,
        DocumentFileName = application.DocumentFile?.FileName,
        DocumentFileUrl = application.DocumentFile?.FileUrl,
        Status = application.Status,
        CreatedAt = application.CreatedAt,
        InstitutionName = application.Institution?.Name
    };
}
