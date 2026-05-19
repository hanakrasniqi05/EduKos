using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EduKos.Infrastructure.Seed;

public class RoleSeeder
{
    public static async Task SeedRolesAsync(AppDbContext context)
    {
        foreach (var role in AppRoles.AllRoles)
        {
            if (!await context.Roles.AnyAsync(x => x.Name == role))
            {
                await context.Roles.AddAsync(new Role { Name = role });
            }
        }

        foreach (var type in new[] { "Cerdhe", "Shkolla fillore", "Shkolla e mesme", "Fakultete" })
        {
            if (!await context.InstitutionTypes.AnyAsync(x => x.Name == type))
            {
                await context.InstitutionTypes.AddAsync(new InstitutionType { Name = type });
            }
        }

        await context.SaveChangesAsync();
        await SeedUserAsync(context, "admin@edukos.com", "Admin", "EduKos", AppRoles.Admin, "Admin123!");
        await SeedUserAsync(context, "nxenes@edukos.com", "Nxenes", "EduKos", AppRoles.Nxenes, "Nxenes123!");
        await SeedUserAsync(context, "shkolla@edukos.com", "Shkolla", "EduKos", AppRoles.Shkolla, "Shkolla123!");
    }

    private static async Task SeedUserAsync(
        AppDbContext context,
        string email,
        string firstName,
        string lastName,
        string roleName,
        string password)
    {
        var user = await context.Users
            .Include(x => x.UserRoles)
            .FirstOrDefaultAsync(x => x.Email == email);

        if (user == null)
        {
            user = new User
            {
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                IsActive = true
            };

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, password);
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();
        }

        var role = await context.Roles.FirstAsync(x => x.Name == roleName);
        var hasRole = await context.UserRoles.AnyAsync(x => x.UserId == user.UserId && x.RoleId == role.RoleId);

        if (!hasRole)
        {
            await context.UserRoles.AddAsync(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
        }

        await context.SaveChangesAsync();
    }
}
