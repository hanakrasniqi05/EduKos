using EduKos.Application.DTOs.Education;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstitutionsController(AppDbContext context) : ControllerBase
{

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<InstitutionDto>>> GetAll(CancellationToken cancellationToken)
    {
        var institutions = await BaseQuery().ToListAsync(cancellationToken);
        return Ok(institutions.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<InstitutionDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var institution = await BaseQuery()
            .FirstOrDefaultAsync(x => x.InstitutionId == id, cancellationToken);

        return institution == null ? NotFound() : Ok(ToDto(institution));
    }

    [HttpGet("by-type/{institutionTypeId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<InstitutionDto>>> GetByType(int institutionTypeId, CancellationToken cancellationToken)
    {
        var institutions = await BaseQuery()
            .Where(x => x.InstitutionTypeId == institutionTypeId)
            .ToListAsync(cancellationToken);

        return Ok(institutions.Select(ToDto));
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<InstitutionDto>>> Search([FromQuery] InstitutionSearchRequestDto request, CancellationToken cancellationToken)
    {
        var query = BaseQuery();

        if (!string.IsNullOrWhiteSpace(request.Name))
            query = query.Where(x => x.Name.Contains(request.Name));

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(x => x.City != null && x.City.Contains(request.City));

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(x => x.InstitutionType.Name.Contains(request.Category));

        if (request.InstitutionTypeId.HasValue)
            query = query.Where(x => x.InstitutionTypeId == request.InstitutionTypeId.Value);

        if (!string.IsNullOrWhiteSpace(request.Program))
            query = query.Where(x => x.Programs.Any(p => p.Name.Contains(request.Program) || (p.Level != null && p.Level.Contains(request.Program))));
            
        if (request.IsApproved.HasValue)
            query = query.Where(x => x.IsApproved == request.IsApproved.Value);

        var institutions = await query.ToListAsync(cancellationToken);
        return Ok(institutions.Select(ToDto));
    }

    [HttpGet("{id:int}/full-details")]
    [AllowAnonymous]
    public async Task<ActionResult<InstitutionFullDetailsDto>> GetFullDetails(int id, CancellationToken cancellationToken)
    {
        var institution = await context.Institutions
            .AsNoTracking()
            .Include(x => x.InstitutionType)
            .Include(x => x.Details)
            .Include(x => x.Programs)
            .Include(x => x.Staff)
            .Include(x => x.Facilities)
            .Include(x => x.Reviews)
            .Include(x => x.Announcements)
            .FirstOrDefaultAsync(x => x.InstitutionId == id, cancellationToken);

        if (institution == null)
            return NotFound();

        return Ok(new InstitutionFullDetailsDto
        {
            Institution = ToDto(institution),
            Details = institution.Details == null ? null : Map<InstitutionDetail, InstitutionDetailDto>(institution.Details),
            Programs = institution.Programs.Select(Map<InstitutionProgram, InstitutionProgramDto>).ToList(),
            Staff = institution.Staff.Select(Map<InstitutionStaff, InstitutionStaffDto>).ToList(),
            Facilities = institution.Facilities.Select(Map<InstitutionFacility, InstitutionFacilityDto>).ToList(),
            Reviews = institution.Reviews.Select(Map<Review, ReviewDto>).ToList(),
            Announcements = institution.Announcements.Select(Map<InstitutionAnnouncement, InstitutionAnnouncementDto>).ToList()
        });
    }

    [HttpGet("my")]
    [Authorize(Roles = "Shkolla")]
    public async Task<ActionResult<InstitutionDto>> GetMyInstitution(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var institution = await BaseQuery()
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId, cancellationToken);

        if (institution == null)
            return NotFound();

        return Ok(ToDto(institution));
    }

    [HttpGet("my/full")]
    [Authorize(Roles = "Shkolla")]
    public async Task<ActionResult<InstitutionFullDetailsDto>> GetMyFullInstitution(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var institution = await context.Institutions
            .AsNoTracking()
            .Include(x => x.InstitutionType)
            .Include(x => x.Details)
            .Include(x => x.Programs)
            .Include(x => x.Staff)
            .Include(x => x.Facilities)
            .Include(x => x.Reviews)
            .Include(x => x.Announcements)
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId, cancellationToken);

        if (institution == null)
            return NotFound();

        return Ok(new InstitutionFullDetailsDto
        {
            Institution = ToDto(institution),
            Details = institution.Details == null ? null : Map<InstitutionDetail, InstitutionDetailDto>(institution.Details),
            Programs = institution.Programs.Select(Map<InstitutionProgram, InstitutionProgramDto>).ToList(),
            Staff = institution.Staff.Select(Map<InstitutionStaff, InstitutionStaffDto>).ToList(),
            Facilities = institution.Facilities.Select(Map<InstitutionFacility, InstitutionFacilityDto>).ToList(),
            Reviews = institution.Reviews.Select(Map<Review, ReviewDto>).ToList(),
            Announcements = institution.Announcements.Select(Map<InstitutionAnnouncement, InstitutionAnnouncementDto>).ToList()
        });
    }

    [HttpPut("my")]
    [Authorize(Roles = "Shkolla")]
    public async Task<IActionResult> UpdateMyInstitution([FromBody] InstitutionDto dto, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var entity = await context.Institutions
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId, cancellationToken);

        if (entity == null)
            return NotFound();

        CrudControllerBase<Institution, InstitutionDto>.Copy(dto, entity);

        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Shkolla")]
    public async Task<ActionResult<InstitutionDto>> Create([FromBody] InstitutionDto dto, CancellationToken cancellationToken)
    {
        var entity = Map<InstitutionDto, Institution>(dto);
        entity.InstitutionId = 0;

        await context.Institutions.AddAsync(entity, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = entity.InstitutionId }, ToDto(entity));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Shkolla")]
    public async Task<IActionResult> Update(int id, [FromBody] InstitutionDto dto, CancellationToken cancellationToken)
    {
        var entity = await context.Institutions.FindAsync([id], cancellationToken);

        if (entity == null)
            return NotFound();

        CrudControllerBase<Institution, InstitutionDto>.Copy(dto, entity);

        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var entity = await context.Institutions.FindAsync([id], cancellationToken);

        if (entity == null)
            return NotFound();

        context.Institutions.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private IQueryable<Institution> BaseQuery() =>
        context.Institutions
            .AsNoTracking()
            .Include(x => x.InstitutionType)
            .Include(x => x.Programs);

    private static InstitutionDto ToDto(Institution institution)
    {
        var dto = Map<Institution, InstitutionDto>(institution);
        dto.InstitutionTypeName = institution.InstitutionType?.Name;
        return dto;
    }

    private static TTarget Map<TSource, TTarget>(TSource source)
        where TSource : class, new()
        where TTarget : class, new()
    {
        var target = new TTarget();
        CrudControllerBase<TSource, TTarget>.Copy(source, target);
        return target;
    }
}