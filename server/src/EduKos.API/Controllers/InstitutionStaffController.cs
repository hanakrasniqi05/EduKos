using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKos.Domain.Entities;
using EduKos.Application.DTOs.Education;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-staff")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionStaffController(AppDbContext context) : ControllerBase
{
    private int GetUserId()
        => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : throw new UnauthorizedAccessException("Invalid user.");

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

        return Ok(staff.Select(Map));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateStaffRequestDto dto)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var entity = new InstitutionStaff
        {
            InstitutionId = institutionId.Value,
            FullName = dto.FullName,
            Position = dto.Position,
            PhotoFileId = dto.PhotoFileId
        };

        context.InstitutionStaff.Add(entity);
        await context.SaveChangesAsync();

        return Ok(Map(entity));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateStaffRequestDto dto)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var staff = await context.InstitutionStaff
            .FirstOrDefaultAsync(x => x.StaffId == id && x.InstitutionId == institutionId.Value);
        if (staff == null) return NotFound();

        if (dto.FullName is not null) staff.FullName = dto.FullName;
        if (dto.Position is not null) staff.Position = dto.Position;
        staff.PhotoFileId = dto.PhotoFileId;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var staff = await context.InstitutionStaff
            .FirstOrDefaultAsync(x => x.StaffId == id && x.InstitutionId == institutionId.Value);
        if (staff == null) return NotFound();

        context.InstitutionStaff.Remove(staff);
        await context.SaveChangesAsync();

        return NoContent();
    }

    private static InstitutionStaffDto Map(InstitutionStaff entity)
        => new()
        {
            StaffId = entity.StaffId,
            InstitutionId = entity.InstitutionId,
            FullName = entity.FullName,
            Position = entity.Position,
            PhotoFileId = entity.PhotoFileId
        };
}
