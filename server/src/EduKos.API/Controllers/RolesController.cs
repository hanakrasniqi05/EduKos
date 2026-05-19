using EduKos.Application.Features.Roles.Commands.AssignRole;
using EduKos.Application.Features.Roles.Commands.CreateRole;
using EduKos.Application.DTOs.Education;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly AppDbContext _context;

    public RolesController(IMediator mediator, AppDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll(CancellationToken cancellationToken)
    {
        var roles = await _context.Roles.AsNoTracking().ToListAsync(cancellationToken);
        return Ok(roles.Select(x => new RoleDto { RoleId = x.RoleId, Name = x.Name }));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoleDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var role = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(x => x.RoleId == id, cancellationToken);
        return role == null ? NotFound() : Ok(new RoleDto { RoleId = role.RoleId, Name = role.Name });
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> Create([FromBody] RoleDto dto, CancellationToken cancellationToken)
    {
        var role = new Role { Name = dto.Name };
        await _context.Roles.AddAsync(role, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = role.RoleId }, new RoleDto { RoleId = role.RoleId, Name = role.Name });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] RoleDto dto, CancellationToken cancellationToken)
    {
        var role = await _context.Roles.FindAsync([id], cancellationToken);
        if (role == null)
            return NotFound();

        role.Name = dto.Name;
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var role = await _context.Roles.FindAsync([id], cancellationToken);
        if (role == null)
            return NotFound();

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignRole(AssignRoleCommand command)
    {
        await _mediator.Send(command);
        return Ok("Role assigned");
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateRole(CreateRoleCommand command)
    {
        await _mediator.Send(command);
        return Ok("Role created");
    }
}
