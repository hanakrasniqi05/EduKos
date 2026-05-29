using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKos.Domain.Entities;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-staff")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionStaffController(AppDbContext context) : ControllerBase
{
    private int GetUserId()
        => int.Parse(User.FindFirst("sub")?.Value ?? "0");

    private async Task<int?> GetInstitutionId()
    {
        var userId = GetUserId();
        return await context.Institutions
            .Where(x => x.OwnerUserId == userId)
            .Select(x => x.InstitutionId)
            .FirstOrDefaultAsync();
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyStaff()
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var staff = await context.InstitutionStaff
            .Where(x => x.InstitutionId == institutionId)
            .ToListAsync();

        return Ok(staff);
    }

    [HttpPost]
    public async Task<IActionResult> Create(InstitutionStaff entity)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        entity.InstitutionId = institutionId.Value;

        context.InstitutionStaff.Add(entity);
        await context.SaveChangesAsync();

        return Ok(entity);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, InstitutionStaff dto)
    {
        var staff = await context.InstitutionStaff.FindAsync(id);
        if (staff == null) return NotFound();

        staff.FullName = dto.FullName;
        staff.Position = dto.Position;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var staff = await context.InstitutionStaff.FindAsync(id);
        if (staff == null) return NotFound();

        context.InstitutionStaff.Remove(staff);
        await context.SaveChangesAsync();

        return NoContent();
    }
}