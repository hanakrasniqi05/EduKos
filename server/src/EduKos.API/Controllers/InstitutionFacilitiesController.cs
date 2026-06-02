using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKos.Domain.Entities;
using EduKos.Application.DTOs.Education;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-facilities")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionFacilitiesController(AppDbContext context) : ControllerBase
{
    private int GetUserId()
        => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : throw new UnauthorizedAccessException("Invalid user.");

    private async Task<int?> GetInstitutionId()
    {
        return await context.Institutions
            .Where(x => x.OwnerUserId == GetUserId())
            .Select(x => x.InstitutionId)
            .FirstOrDefaultAsync();
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyFacilities()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var institution = await context.Institutions
        .FirstOrDefaultAsync(x => x.OwnerUserId == userId);

        if (institution == null) return NotFound();

        var facilities = await context.InstitutionFacilities
            .Where(x => x.InstitutionId == institution.InstitutionId)
            .ToListAsync();

        return Ok(facilities.Select(Map));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFacilityRequestDto dto)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var entity = new InstitutionFacility
        {
            InstitutionId = institutionId.Value,
            Name = dto.Name,
            Description = dto.Description
        };

        context.InstitutionFacilities.Add(entity);
        await context.SaveChangesAsync();

        return Ok(Map(entity));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateFacilityRequestDto dto)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var item = await context.InstitutionFacilities
            .FirstOrDefaultAsync(x => x.FacilityId == id && x.InstitutionId == institutionId.Value);
        if (item == null) return NotFound();

        if (dto.Name is not null) item.Name = dto.Name;
        if (dto.Description is not null) item.Description = dto.Description;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var item = await context.InstitutionFacilities
            .FirstOrDefaultAsync(x => x.FacilityId == id && x.InstitutionId == institutionId.Value);
        if (item == null) return NotFound();

        context.InstitutionFacilities.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }

    private static InstitutionFacilityDto Map(InstitutionFacility entity)
        => new()
        {
            FacilityId = entity.FacilityId,
            InstitutionId = entity.InstitutionId,
            Name = entity.Name,
            Description = entity.Description
        };
}
