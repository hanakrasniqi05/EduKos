using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKos.Domain.Entities;
using EduKos.Application.DTOs.Education;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-announcements")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionAnnouncementsController(AppDbContext context) : ControllerBase
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
    public async Task<IActionResult> GetMyAnnouncements()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var institution = await context.Institutions
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId);

        if (institution == null) return NotFound();

        var announcements = await context.InstitutionAnnouncements
            .Where(x => x.InstitutionId == institution.InstitutionId)
            .ToListAsync();

        return Ok(announcements.Select(Map));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAnnouncementRequestDto dto)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var entity = new InstitutionAnnouncement
        {
            InstitutionId = institutionId.Value,
            Title = dto.Title,
            Content = dto.Content
        };

        context.InstitutionAnnouncements.Add(entity);
        await context.SaveChangesAsync();

        return Ok(Map(entity));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateAnnouncementRequestDto dto)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var item = await context.InstitutionAnnouncements
            .FirstOrDefaultAsync(x => x.AnnouncementId == id && x.InstitutionId == institutionId.Value);
        if (item == null) return NotFound();

        if (dto.Title is not null) item.Title = dto.Title;
        if (dto.Content is not null) item.Content = dto.Content;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var institutionId = await GetInstitutionId();
        if (institutionId == null) return NotFound();

        var item = await context.InstitutionAnnouncements
            .FirstOrDefaultAsync(x => x.AnnouncementId == id && x.InstitutionId == institutionId.Value);
        if (item == null) return NotFound();

        context.InstitutionAnnouncements.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }

    private static InstitutionAnnouncementDto Map(InstitutionAnnouncement entity)
        => new()
        {
            AnnouncementId = entity.AnnouncementId,
            InstitutionId = entity.InstitutionId,
            Title = entity.Title,
            Content = entity.Content,
            CreatedAt = entity.CreatedAt
        };
}
