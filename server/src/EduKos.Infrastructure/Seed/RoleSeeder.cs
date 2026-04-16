using EduKos.Domain.Constants;
using EduKos.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace EduKos.Infrastructure.Seed;

public class RoleSeeder
{
    public static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        foreach (var role in AppRoles.AllRoles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new ApplicationRole
                {
                    Name = role
                });
            }
        }
    }
}