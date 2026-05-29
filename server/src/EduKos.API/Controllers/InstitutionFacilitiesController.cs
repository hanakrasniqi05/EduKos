using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKos.Domain.Entities;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-facilities")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionFacilitiesController(AppDbContext context) : ControllerBase
{
    private int GetUserId()
        => int.Parse(User.FindFirst("sub")?.Value ?? "0");

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

        return Ok(facilities);
    }

    [HttpPost]
    public async Task<IActionResult> Create(InstitutionFacility entity)
    {
        var institutionId = await GetInstitutionId();
        entity.InstitutionId = institutionId!.Value;

        context.InstitutionFacilities.Add(entity);
        await context.SaveChangesAsync();

        return Ok(entity);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, InstitutionFacility dto)
    {
        var item = await context.InstitutionFacilities.FindAsync(id);
        if (item == null) return NotFound();

        item.Name = dto.Name;
        item.Description = dto.Description;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await context.InstitutionFacilities.FindAsync(id);
        if (item == null) return NotFound();

        context.InstitutionFacilities.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }
}