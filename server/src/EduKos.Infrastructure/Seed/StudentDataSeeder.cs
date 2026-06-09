using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using EduKos.Infrastructure.Seed.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EduKos.Infrastructure.Seed;

internal static class StudentDataSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        string filePath,
        CancellationToken cancellationToken)
    {
        var students = await JsonSeedFile.ReadAsync<List<StudentSeedModel>>(
            filePath,
            cancellationToken);
        if (students.Count == 0) return;

        var roleId = await context.Roles
            .Where(role => role.Name == AppRoles.Nxenes)
            .Select(role => role.RoleId)
            .SingleAsync(cancellationToken);
        var passwordHasher = new PasswordHasher<User>();

        foreach (var student in students)
        {
            var user = await FindOrCreateUser(
                context,
                student,
                passwordHasher,
                cancellationToken);

            await EnsureRole(context, user.UserId, roleId, cancellationToken);
            await EnsureProfile(context, user.UserId, student, cancellationToken);
            await EnsureEducation(context, user.UserId, student, cancellationToken);
            await EnsureInterests(context, user.UserId, student, cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task<User> FindOrCreateUser(
        AppDbContext context,
        StudentSeedModel student,
        PasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken)
    {
        var email = student.Email.Trim().ToLowerInvariant();
        var user = await context.Users.FirstOrDefaultAsync(
            item => item.Email == email,
            cancellationToken);
        if (user != null) return user;

        user = new User
        {
            Email = email,
            FirstName = student.FirstName,
            LastName = student.LastName,
            PhoneNumber = student.PhoneNumber,
            IsActive = true,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, student.Password);
        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);
        return user;
    }

    private static async Task EnsureRole(
        AppDbContext context,
        int userId,
        int roleId,
        CancellationToken cancellationToken)
    {
        if (await context.UserRoles.AnyAsync(
            item => item.UserId == userId && item.RoleId == roleId,
            cancellationToken)) return;

        context.UserRoles.Add(new UserRole { UserId = userId, RoleId = roleId });
    }

    private static async Task EnsureProfile(
        AppDbContext context,
        int userId,
        StudentSeedModel student,
        CancellationToken cancellationToken)
    {
        if (student.Profile == null ||
            await context.UserProfiles.AnyAsync(item => item.UserId == userId, cancellationToken)) return;

        context.UserProfiles.Add(new UserProfile
        {
            UserId = userId,
            Bio = student.Profile.Bio,
            City = student.Profile.City,
        });
    }

    private static async Task EnsureEducation(
        AppDbContext context,
        int userId,
        StudentSeedModel student,
        CancellationToken cancellationToken)
    {
        foreach (var education in student.EducationHistory)
        {
            var exists = await context.UserEducationHistory.AnyAsync(
                item => item.UserId == userId &&
                        item.SchoolName == education.SchoolName &&
                        item.EducationLevel == education.EducationLevel,
                cancellationToken);
            if (exists) continue;

            context.UserEducationHistory.Add(new UserEducationHistory
            {
                UserId = userId,
                SchoolName = education.SchoolName,
                EducationLevel = education.EducationLevel,
                FieldOfStudy = education.FieldOfStudy,
                StartYear = education.StartYear,
                EndYear = education.EndYear,
            });
        }
    }

    private static async Task EnsureInterests(
        AppDbContext context,
        int userId,
        StudentSeedModel student,
        CancellationToken cancellationToken)
    {
        foreach (var interest in student.Interests.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (await context.UserInterests.AnyAsync(
                item => item.UserId == userId && item.InterestName == interest,
                cancellationToken)) continue;

            context.UserInterests.Add(new UserInterest
            {
                UserId = userId,
                InterestName = interest,
            });
        }
    }
}
