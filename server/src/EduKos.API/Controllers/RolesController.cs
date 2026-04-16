using EduKos.Application.Features.Roles.Commands.AssignRole;
using EduKos.Application.Features.Roles.Commands.CreateRole;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RolesController(IMediator mediator)
    {
        _mediator = mediator;
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