using EduKos.Application.DTOs.Education;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-programs")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionProgramsController(AppDbContext context)
    : ControllerBase
{
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<int?> GetInstitutionId()
    {
        var userId = GetUserId();
        return await context.Institutions
            .Where(x => x.OwnerUserId == userId)
            .Select(x => x.InstitutionId)
            .FirstOrDefaultAsync();
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyPrograms()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var institution = await context.Institutions
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId);

        if (institution == null) return NotFound();

        var programs = await context.InstitutionPrograms
            .Where(x => x.InstitutionId == institution.InstitutionId)
            .ToListAsync();

        return Ok(programs);
    }

    [HttpPost]
    public async Task<ActionResult<InstitutionProgramDto>> Create(InstitutionProgramDto dto, CancellationToken ct)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var entity = new InstitutionProgram
        {
            Name = dto.Name,
            Level = dto.Level,
            Description = dto.Description,
            Duration = dto.Duration,
            InstitutionId = institutionId.Value
        };

        context.InstitutionPrograms.Add(entity);
        await context.SaveChangesAsync(ct);

        return Ok(Map(entity));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, InstitutionProgramDto dto, CancellationToken ct)
    {
        var entity = await context.InstitutionPrograms.FindAsync(id);
        if (entity == null) return NotFound();

        entity.Name = dto.Name;
        entity.Level = dto.Level;
        entity.Description = dto.Description;
        entity.Duration = dto.Duration;

        await context.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entity = await context.InstitutionPrograms.FindAsync(id);
        if (entity == null) return NotFound();

        context.InstitutionPrograms.Remove(entity);
        await context.SaveChangesAsync(ct);
        return NoContent();
    }

    private static InstitutionProgramDto Map(InstitutionProgram e)
        => new()
        {
            ProgramId = e.ProgramId,
            InstitutionId = e.InstitutionId,
            Name = e.Name,
            Level = e.Level,
            Description = e.Description,
            Duration = e.Duration
        };
}