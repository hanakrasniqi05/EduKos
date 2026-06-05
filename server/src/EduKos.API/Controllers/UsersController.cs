using EduKos.Application.DTOs.Education;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController(AppDbContext context, PasswordHasher<User> passwordHasher) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await context.Users
            .AsNoTracking()
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .ToListAsync(cancellationToken);

        return Ok(users.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await context.Users
            .AsNoTracking()
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.UserId == id, cancellationToken);

        return user == null ? NotFound() : Ok(ToDto(user));
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] UserCreateRequest request, CancellationToken cancellationToken)
    {
        if (await context.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
            return Conflict(new { message = "Email already exists." });

        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            IsActive = request.IsActive
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        await context.Users.AddAsync(user, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = user.UserId }, ToDto(user));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserUpdateRequest request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FindAsync([id], cancellationToken);
        if (user == null)
            return NotFound();

        user.IsActive = request.IsActive;
        
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var user = await context.Users.FindAsync([id], cancellationToken);
        if (user == null)
            return NotFound();

        var currentAdminId = GetCurrentUserId();
        if (user.UserId == currentAdminId)
            return BadRequest(new { message = "Nuk mund të fshini llogarinë tuaj." });

        var hasApplications = await context.Applications.AnyAsync(a => a.UserId == id, cancellationToken);
        var hasReviews = await context.Reviews.AnyAsync(r => r.UserId == id, cancellationToken);
        var hasSavedInstitutions = await context.SavedInstitutions.AnyAsync(s => s.UserId == id, cancellationToken);
        
        if (hasApplications || hasReviews || hasSavedInstitutions)
        {
            user.IsActive = false;
            await context.SaveChangesAsync(cancellationToken);
            return Ok(new { message = "Përdoruesi u çaktivizua sepse ka të dhëna të lidhura." });
        }

        context.Users.Remove(user);
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return userIdClaim != null && int.TryParse(userIdClaim.Value, out var id) ? id : 0;
    }

    private static UserDto ToDto(User user) => new()
    {
        UserId = user.UserId,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        PhoneNumber = user.PhoneNumber,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        Roles = user.UserRoles.Select(x => x.Role.Name).ToList()
    };
}

public class UserCreateRequest : UserDto
{
    public string Password { get; set; } = default!;
}

public class UserUpdateRequest
{
    public bool IsActive { get; set; }
}