using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using EduKos.Infrastructure.Seed.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EduKos.Infrastructure.Seed;

internal static class InstitutionOwnerDataSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        string filePath,
        CancellationToken cancellationToken)
    {
        var owners = await JsonSeedFile.ReadAsync<List<InstitutionOwnerSeedModel>>(
            filePath,
            cancellationToken);
        if (owners.Count == 0) return;

        var roleId = await context.Roles
            .Where(role => role.Name == AppRoles.Shkolla)
            .Select(role => role.RoleId)
            .SingleAsync(cancellationToken);
        var passwordHasher = new PasswordHasher<User>();

        foreach (var owner in owners)
        {
            var email = owner.Email.Trim().ToLowerInvariant();
            var user = await context.Users.FirstOrDefaultAsync(
                item => item.Email == email,
                cancellationToken);

            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    FirstName = owner.FirstName,
                    LastName = owner.LastName,
                    PhoneNumber = owner.PhoneNumber,
                    IsActive = true,
                };
                user.PasswordHash = passwordHasher.HashPassword(user, owner.Password);
                context.Users.Add(user);
                await context.SaveChangesAsync(cancellationToken);
            }

            if (!await context.UserRoles.AnyAsync(
                item => item.UserId == user.UserId && item.RoleId == roleId,
                cancellationToken))
            {
                context.UserRoles.Add(new UserRole
                {
                    UserId = user.UserId,
                    RoleId = roleId,
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
