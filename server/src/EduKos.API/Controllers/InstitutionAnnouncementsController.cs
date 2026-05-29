using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKos.Domain.Entities;
using System.Security.Claims;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/institution-announcements")]
[Authorize(Roles = "Shkolla,Admin")]
public class InstitutionAnnouncementsController(AppDbContext context) : ControllerBase
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
    public async Task<IActionResult> GetMyAnnouncements()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var institution = await context.Institutions
            .FirstOrDefaultAsync(x => x.OwnerUserId == userId);

        if (institution == null) return NotFound();

        var announcements = await context.InstitutionAnnouncements
            .Where(x => x.InstitutionId == institution.InstitutionId)
            .ToListAsync();

        return Ok(announcements);
    }

    [HttpPost]
    public async Task<IActionResult> Create(InstitutionAnnouncement entity)
    {
        entity.InstitutionId = (await GetInstitutionId())!.Value;

        context.InstitutionAnnouncements.Add(entity);
        await context.SaveChangesAsync();

        return Ok(entity);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, InstitutionAnnouncement dto)
    {
        var item = await context.InstitutionAnnouncements.FindAsync(id);
        if (item == null) return NotFound();

        item.Title = dto.Title;
        item.Content = dto.Content;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await context.InstitutionAnnouncements.FindAsync(id);
        if (item == null) return NotFound();

        context.InstitutionAnnouncements.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }
}