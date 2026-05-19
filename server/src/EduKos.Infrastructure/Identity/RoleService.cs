using EduKos.Application.Interfaces.Auth;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduKos.Infrastructure.Identity;

public class RoleService : IRoleService
{
    private readonly AppDbContext _context;

    public RoleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task AssignRoleAsync(string userId, string role)
    {
        if (!int.TryParse(userId, out var id))
            throw new ArgumentException("Invalid user id.", nameof(userId));

        var userExists = await _context.Users.AnyAsync(x => x.UserId == id);
        if (!userExists)
            throw new Exception("User not found");

        var roleEntity = await _context.Roles.FirstOrDefaultAsync(x => x.Name == role)
            ?? throw new Exception("Role not found");

        var alreadyAssigned = await _context.UserRoles
            .AnyAsync(x => x.UserId == id && x.RoleId == roleEntity.RoleId);

        if (!alreadyAssigned)
        {
            await _context.UserRoles.AddAsync(new UserRole { UserId = id, RoleId = roleEntity.RoleId });
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IList<string>> GetUserRolesAsync(string userId)
    {
        if (!int.TryParse(userId, out var id))
            throw new ArgumentException("Invalid user id.", nameof(userId));

        return await _context.UserRoles
            .Where(x => x.UserId == id)
            .Select(x => x.Role.Name)
            .ToListAsync();
    }

    public async Task<bool> RoleExistsAsync(string role)
    {
        return await _context.Roles.AnyAsync(x => x.Name == role);
    }

    public async Task CreateRoleAsync(string role)
    {
        if (!await _context.Roles.AnyAsync(x => x.Name == role))
        {
            await _context.Roles.AddAsync(new Role { Name = role });
            await _context.SaveChangesAsync();
        }
    }
}
