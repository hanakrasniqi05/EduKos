using System.Security.Claims;
using EduKos.Application.DTOs.Education;
using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Nxenes)]
public class SavedInstitutionsController(AppDbContext context) : CrudControllerBase<SavedInstitution, SavedInstitutionDto>(context)
{
    protected override DbSet<SavedInstitution> Set => Context.SavedInstitutions;
    protected override int GetId(SavedInstitution entity) => entity.SavedInstitutionId;
    protected override void SetId(SavedInstitution entity, int id) => entity.SavedInstitutionId = id;

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<SavedInstitutionDto>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var saved = await Context.SavedInstitutions
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);

        return Ok(saved.Select(MapToDto));
    }

    [HttpGet("mine/institutions")]
    public async Task<ActionResult<IEnumerable<InstitutionDto>>> GetMyInstitutions(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var institutions = await Context.SavedInstitutions
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Include(x => x.Institution)
            .ThenInclude(x => x.InstitutionType)
            .Select(x => x.Institution)
            .ToListAsync(cancellationToken);

        return Ok(institutions.Select(institution =>
        {
            var dto = new InstitutionDto();
            Copy(institution, dto);
            dto.InstitutionTypeName = institution.InstitutionType.Name;
            return dto;
        }));
    }

    [HttpPost("save")]
    public async Task<ActionResult<SavedInstitutionDto>> Save([FromBody] SaveInstitutionRequestDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var saved = await Context.SavedInstitutions
            .FirstOrDefaultAsync(x => x.UserId == userId && x.InstitutionId == dto.InstitutionId, cancellationToken);

        if (saved == null)
        {
            saved = new SavedInstitution { UserId = userId, InstitutionId = dto.InstitutionId };
            await Context.SavedInstitutions.AddAsync(saved, cancellationToken);
            await Context.SaveChangesAsync(cancellationToken);
        }

        return Ok(MapToDto(saved));
    }

    [HttpDelete("unsave/{institutionId:int}")]
    public async Task<IActionResult> Unsave(int institutionId, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var saved = await Context.SavedInstitutions
            .FirstOrDefaultAsync(x => x.UserId == userId && x.InstitutionId == institutionId, cancellationToken);

        if (saved == null)
            return NotFound();

        Context.SavedInstitutions.Remove(saved);
        await Context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : throw new UnauthorizedAccessException("Invalid user.");
    }
}
