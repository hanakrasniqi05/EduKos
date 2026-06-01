using EduKos.Application.DTOs.Education;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionProfileController(AppDbContext context) : ControllerBase
{
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<Domain.Entities.Institution?> GetMyInstitution()
    {
        var userId = GetUserId();

        return await context.Institutions
            .Include(x => x.InstitutionType)
            .Include(x => x.Programs)
            .Include(x => x.Staff)
            .Include(x => x.Facilities)
            .Include(x => x.Announcements)
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId);
    }

    [HttpGet("my-profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var institution = await GetMyInstitution();

        if (institution == null)
            return NotFound();

        var dto = new InstitutionDto
        {
            InstitutionId = institution.InstitutionId,
            InstitutionTypeId = institution.InstitutionTypeId,
            OwnerUserId = institution.OwnerUserId,
            Name = institution.Name,
            Description = institution.Description,
            City = institution.City,
            Address = institution.Address,
            Website = institution.Website,
            Email = institution.Email,
            Phone = institution.Phone,
            IsApproved = institution.IsApproved,
            CreatedAt = institution.CreatedAt,
            InstitutionTypeName = institution.InstitutionType?.Name
        };
        return Ok(dto);
    }

    [HttpPut("my-profile")]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] InstitutionDto dto)
    {
        var institution = await GetMyInstitution();
        if (institution == null) return NotFound();

        institution.Name = dto.Name;
        institution.Description = dto.Description;
        institution.City = dto.City;
        institution.Address = dto.Address;
        institution.Email = dto.Email;
        institution.Phone = dto.Phone;
        institution.Website = dto.Website;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("my-profile/details")]
    public async Task<IActionResult> GetFullDetails()
    {
        var institution = await GetMyInstitution();
        if (institution == null) return NotFound();

        return Ok(institution);
    }
}