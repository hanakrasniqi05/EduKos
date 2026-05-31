using EduKos.API.DTOs;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{
    private readonly AppDbContext _context;

    public HomeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<HomeStatsDto>> GetStats()
    {
        var stats = new HomeStatsDto
        {
            Institutions = await _context.Institutions.CountAsync(),
            Programs = await _context.InstitutionPrograms.CountAsync(),
            Users = await _context.Users.CountAsync()
        };

        return Ok(stats);
    }
}