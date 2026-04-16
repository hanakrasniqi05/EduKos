using EduKos.Application.Interfaces.Auth;
using Microsoft.AspNetCore.Identity;

namespace EduKos.Infrastructure.Identity;

public class RoleService : IRoleService
{
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RoleService(
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task AssignRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId)
                   ?? throw new Exception("User not found");

        await _userManager.AddToRoleAsync(user, role);
    }

    public async Task<IList<string>> GetUserRolesAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
                   ?? throw new Exception("User not found");

        return await _userManager.GetRolesAsync(user);
    }

    public async Task<bool> RoleExistsAsync(string role)
    {
        return await _roleManager.RoleExistsAsync(role);
    }

    public async Task CreateRoleAsync(string role)
    {
        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new ApplicationRole { Name = role });
        }
    }
}