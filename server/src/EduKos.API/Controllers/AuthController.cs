using System.Security.Claims;
using EduKos.Application.Features.Auth.Commands.Login;
using EduKos.Application.Features.Auth.Commands.Register;
using EduKos.Application.Features.Auth.Commands.RefreshToken;
using EduKos.Application.Interfaces.Auth;
using EduKos.Application.DTOs.Education;
using EduKos.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduKos.API.Services.Rtc;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IAuthService _authService;
    private readonly AppDbContext _context;
    private readonly IRtcAlertService _rtcAlertService;

    public AuthController(
        IMediator mediator,
        IAuthService authService,
        AppDbContext context,
        IRtcAlertService rtcAlertService)
    {
        _mediator = mediator;
        _authService = authService;
        _context = context;
        _rtcAlertService = rtcAlertService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);

            await _rtcAlertService.PublishInstitutionRegistrationAsync(
                result,
                HttpContext.RequestAborted);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        try
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        catch (Exception ex) when (ex is UnauthorizedAccessException or KeyNotFoundException)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }
        catch (InvalidOperationException ex)
{
    return BadRequest(new { message = ex.Message });
}
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.RevokeTokenAsync(command.RefreshToken, CurrentUserId(), cancellationToken);
            return Ok(new { message = "Refresh token revoked" });
        }
        catch (Exception ex) when (ex is UnauthorizedAccessException or KeyNotFoundException)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }
    }

    [HttpPost("revoke-refresh-token")]
    [Authorize]
    public async Task<IActionResult> RevokeRefreshToken([FromBody] RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.RevokeTokenAsync(command.RefreshToken, CurrentUserId(), cancellationToken);
            return Ok(new { message = "Refresh token revoked" });
        }
        catch (Exception ex) when (ex is UnauthorizedAccessException or KeyNotFoundException)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId();
        var user = await _context.Users
            .AsNoTracking()
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        if (user == null)
            return NotFound();

        return Ok(new UserDto
        {
            UserId = user.UserId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Roles = user.UserRoles.Select(x => x.Role.Name).ToList()
        });
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMe([FromBody] UserProfileUpdateDto dto, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId();
        var user = await _context.Users.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        if (user == null)
            return NotFound();

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.PhoneNumber = dto.PhoneNumber;
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new UserDto
        {
            UserId = user.UserId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Roles = User.Claims
                .Where(x => x.Type == ClaimTypes.Role)
                .Select(x => x.Value)
                .ToList()
        });
    }

    private int CurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : throw new UnauthorizedAccessException("Invalid user.");
    }
}
