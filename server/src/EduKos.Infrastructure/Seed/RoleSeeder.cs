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
        await SeedInstitutionsAsync(context);
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
        else
        {
            user.FirstName = firstName;
            user.LastName = lastName;
            user.IsActive = true;
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, password);
        }

        var role = await context.Roles.FirstAsync(x => x.Name == roleName);
        var hasRole = await context.UserRoles.AnyAsync(x => x.UserId == user.UserId && x.RoleId == role.RoleId);

        if (!hasRole)
        {
            await context.UserRoles.AddAsync(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedInstitutionsAsync(AppDbContext context)
    {
        if (await context.Institutions.AnyAsync())
            return;

        var shkollaUserId = await context.Users
            .Where(x => x.Email == "shkolla@edukos.com")
            .Select(x => (int?)x.UserId)
            .FirstOrDefaultAsync();

        var types = await context.InstitutionTypes.ToDictionaryAsync(x => x.Name, x => x.InstitutionTypeId);

        await context.Institutions.AddRangeAsync(
            new Institution
            {
                InstitutionTypeId = types["Shkolla fillore"],
                OwnerUserId = shkollaUserId,
                Name = "Shkolla Fillore Hasan Prishtina",
                Description = "Shkolle fillore me fokus ne edukim cilesor dhe aktivitete jashteshkollore.",
                City = "Prishtine",
                Address = "Rr. Agim Ramadani, Prishtine",
                Email = "info@hasanprishtina.edu",
                Phone = "+383 38 123 456",
                IsApproved = true,
                IsSeeded = true
            },
            new Institution
            {
                InstitutionTypeId = types["Fakultete"],
                OwnerUserId = shkollaUserId,
                Name = "Kolegji AAB",
                Description = "Institucion i arsimit te larte me programe bachelor dhe master.",
                City = "Prishtine",
                Address = "Zona Industriale, Prishtine",
                Website = "www.aab-edu.net",
                Email = "info@aab-edu.net",
                Phone = "+383 38 100 200",
                IsApproved = true,
                IsSeeded = true
            },
            new Institution
            {
                InstitutionTypeId = types["Shkolla e mesme"],
                OwnerUserId = shkollaUserId,
                Name = "Gjimnazi Xhevdet Doda",
                Description = "Gjimnaz i pergjithshem per pergatitje universitare.",
                City = "Prishtine",
                Address = "Lakrishte, Prishtine",
                Phone = "+383 38 789 012",
                IsApproved = true,
                IsSeeded = true
            });

        await context.SaveChangesAsync();
    }
}
