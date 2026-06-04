using System.Text.Json;
using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EduKos.Infrastructure.Seed;

public static class DemoDataSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task SeedAsync(AppDbContext context, CancellationToken cancellationToken = default)
    {
        var dataDirectory = Path.Combine(AppContext.BaseDirectory, "Seed", "Data");

        if (!Directory.Exists(dataDirectory))
        {
            return;
        }

        await SeedStudentsAsync(context, Path.Combine(dataDirectory, "students.json"), cancellationToken);
        await SeedInstitutionOwnersAsync(context, Path.Combine(dataDirectory, "institution-owners.json"), cancellationToken);
        await SeedInstitutionsAsync(context, Path.Combine(dataDirectory, "institutions.json"), cancellationToken);
    }

    private static async Task SeedStudentsAsync(
        AppDbContext context,
        string filePath,
        CancellationToken cancellationToken)
    {
        var students = await ReadJsonAsync<List<StudentSeedDto>>(filePath, cancellationToken);
        if (students.Count == 0)
        {
            return;
        }

        var studentRole = await context.Roles
            .FirstAsync(role => role.Name == AppRoles.Nxenes, cancellationToken);

        var passwordHasher = new PasswordHasher<User>();

        foreach (var student in students)
        {
            var email = student.Email.Trim().ToLowerInvariant();
            var user = await context.Users
                .Include(x => x.UserRoles)
                .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    FirstName = student.FirstName,
                    LastName = student.LastName,
                    PhoneNumber = student.PhoneNumber,
                    IsActive = true,
                };

                user.PasswordHash = passwordHasher.HashPassword(user, student.Password);
                await context.Users.AddAsync(user, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);
            }

            var hasRole = await context.UserRoles.AnyAsync(
                x => x.UserId == user.UserId && x.RoleId == studentRole.RoleId,
                cancellationToken);

            if (!hasRole)
            {
                await context.UserRoles.AddAsync(
                    new UserRole { UserId = user.UserId, RoleId = studentRole.RoleId },
                    cancellationToken);
            }

            if (student.Profile != null &&
                !await context.UserProfiles.AnyAsync(x => x.UserId == user.UserId, cancellationToken))
            {
                await context.UserProfiles.AddAsync(
                    new UserProfile
                    {
                        UserId = user.UserId,
                        Bio = student.Profile.Bio,
                        City = student.Profile.City,
                    },
                    cancellationToken);
            }

            foreach (var education in student.EducationHistory)
            {
                var exists = await context.UserEducationHistory.AnyAsync(
                    x => x.UserId == user.UserId &&
                         x.SchoolName == education.SchoolName &&
                         x.EducationLevel == education.EducationLevel,
                    cancellationToken);

                if (!exists)
                {
                    await context.UserEducationHistory.AddAsync(
                        new UserEducationHistory
                        {
                            UserId = user.UserId,
                            SchoolName = education.SchoolName,
                            EducationLevel = education.EducationLevel,
                            FieldOfStudy = education.FieldOfStudy,
                            StartYear = education.StartYear,
                            EndYear = education.EndYear,
                        },
                        cancellationToken);
                }
            }

            foreach (var interest in student.Interests.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                var exists = await context.UserInterests.AnyAsync(
                    x => x.UserId == user.UserId && x.InterestName == interest,
                    cancellationToken);

                if (!exists)
                {
                    await context.UserInterests.AddAsync(
                        new UserInterest { UserId = user.UserId, InterestName = interest },
                        cancellationToken);
                }
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedInstitutionOwnersAsync(
        AppDbContext context,
        string filePath,
        CancellationToken cancellationToken)
    {
        var owners = await ReadJsonAsync<List<InstitutionOwnerSeedDto>>(filePath, cancellationToken);
        if (owners.Count == 0)
        {
            return;
        }

        var institutionRole = await context.Roles
            .FirstAsync(role => role.Name == AppRoles.Shkolla, cancellationToken);

        var passwordHasher = new PasswordHasher<User>();

        foreach (var owner in owners)
        {
            var email = owner.Email.Trim().ToLowerInvariant();
            var user = await context.Users
                .Include(x => x.UserRoles)
                .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

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
                await context.Users.AddAsync(user, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);
            }

            var hasRole = await context.UserRoles.AnyAsync(
                x => x.UserId == user.UserId && x.RoleId == institutionRole.RoleId,
                cancellationToken);

            if (!hasRole)
            {
                await context.UserRoles.AddAsync(
                    new UserRole { UserId = user.UserId, RoleId = institutionRole.RoleId },
                    cancellationToken);
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedInstitutionsAsync(
        AppDbContext context,
        string filePath,
        CancellationToken cancellationToken)
    {
        var institutions = await ReadJsonAsync<List<InstitutionSeedDto>>(filePath, cancellationToken);
        if (institutions.Count == 0)
        {
            return;
        }

        var types = await context.InstitutionTypes
            .ToDictionaryAsync(x => x.Name, x => x.InstitutionTypeId, cancellationToken);

        var fallbackOwnerId = await context.Users
            .Where(x => x.Email == "shkolla@edukos.com")
            .Select(x => (int?)x.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        foreach (var item in institutions)
        {
            if (!types.TryGetValue(item.InstitutionTypeName, out var institutionTypeId))
            {
                continue;
            }

            var ownerId = fallbackOwnerId;
            if (!string.IsNullOrWhiteSpace(item.OwnerEmail))
            {
                ownerId = await context.Users
                    .Where(x => x.Email == item.OwnerEmail.Trim().ToLowerInvariant())
                    .Select(x => (int?)x.UserId)
                    .FirstOrDefaultAsync(cancellationToken) ?? fallbackOwnerId;
            }

            var institution = await context.Institutions
                .Include(x => x.Details)
                .FirstOrDefaultAsync(
                    x => x.Name == item.Name && x.City == item.City,
                    cancellationToken);

            if (institution == null)
            {
                institution = new Institution
                {
                    InstitutionTypeId = institutionTypeId,
                    OwnerUserId = ownerId,
                    Name = item.Name,
                    Description = item.Description,
                    Location = item.Location,
                    City = item.City,
                    Address = item.Address,
                    Website = item.Website,
                    Email = item.Email,
                    Phone = item.Phone,
                    IsApproved = item.IsApproved,
                };

                await context.Institutions.AddAsync(institution, cancellationToken);
                await context.SaveChangesAsync(cancellationToken);
            }

            if (item.Details != null && institution.Details == null)
            {
                await context.InstitutionDetails.AddAsync(
                    new InstitutionDetail
                    {
                        InstitutionId = institution.InstitutionId,
                        AgeGroups = item.Details.AgeGroups,
                        DailySchedule = item.Details.DailySchedule,
                        OutdoorSpaces = item.Details.OutdoorSpaces,
                        SecurityInfo = item.Details.SecurityInfo,
                        GradesOffered = item.Details.GradesOffered,
                        Curriculum = item.Details.Curriculum,
                        ExtracurricularActivities = item.Details.ExtracurricularActivities,
                        ClassSize = item.Details.ClassSize,
                        Directions = item.Details.Directions,
                        AdmissionInfo = item.Details.AdmissionInfo,
                        Departments = item.Details.Departments,
                        ECTSInfo = item.Details.ECTSInfo,
                        ExchangePrograms = item.Details.ExchangePrograms,
                    },
                    cancellationToken);
            }

            foreach (var program in item.Programs)
            {
                var exists = await context.InstitutionPrograms.AnyAsync(
                    x => x.InstitutionId == institution.InstitutionId && x.Name == program.Name,
                    cancellationToken);

                if (!exists)
                {
                    await context.InstitutionPrograms.AddAsync(
                        new InstitutionProgram
                        {
                            InstitutionId = institution.InstitutionId,
                            Name = program.Name,
                            Level = program.Level,
                            Description = program.Description,
                            Duration = program.Duration,
                            TuitionFee = program.TuitionFee,
                            ECTS = program.ECTS,
                        },
                        cancellationToken);
                }
            }

            foreach (var facility in item.Facilities)
            {
                var exists = await context.InstitutionFacilities.AnyAsync(
                    x => x.InstitutionId == institution.InstitutionId && x.Name == facility.Name,
                    cancellationToken);

                if (!exists)
                {
                    await context.InstitutionFacilities.AddAsync(
                        new InstitutionFacility
                        {
                            InstitutionId = institution.InstitutionId,
                            Name = facility.Name,
                            Description = facility.Description,
                        },
                        cancellationToken);
                }
            }

            foreach (var staff in item.Staff)
            {
                var exists = await context.InstitutionStaff.AnyAsync(
                    x => x.InstitutionId == institution.InstitutionId && x.FullName == staff.FullName,
                    cancellationToken);

                if (!exists)
                {
                    await context.InstitutionStaff.AddAsync(
                        new InstitutionStaff
                        {
                            InstitutionId = institution.InstitutionId,
                            FullName = staff.FullName,
                            Position = staff.Position,
                        },
                        cancellationToken);
                }
            }

            foreach (var announcement in item.Announcements)
            {
                var exists = await context.InstitutionAnnouncements.AnyAsync(
                    x => x.InstitutionId == institution.InstitutionId && x.Title == announcement.Title,
                    cancellationToken);

                if (!exists)
                {
                    await context.InstitutionAnnouncements.AddAsync(
                        new InstitutionAnnouncement
                        {
                            InstitutionId = institution.InstitutionId,
                            Title = announcement.Title,
                            Content = announcement.Content,
                        },
                        cancellationToken);
                }
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task<T> ReadJsonAsync<T>(string filePath, CancellationToken cancellationToken)
        where T : new()
    {
        if (!File.Exists(filePath))
        {
            return new T();
        }

        await using var stream = File.OpenRead(filePath);
        return await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions, cancellationToken) ?? new T();
    }

    private sealed record StudentSeedDto
    {
        public string Email { get; init; } = default!;
        public string Password { get; init; } = "Student123!";
        public string? FirstName { get; init; }
        public string? LastName { get; init; }
        public string? PhoneNumber { get; init; }
        public UserProfileSeedDto? Profile { get; init; }
        public List<UserEducationHistorySeedDto> EducationHistory { get; init; } = [];
        public List<string> Interests { get; init; } = [];
    }

    private sealed record UserProfileSeedDto
    {
        public string? Bio { get; init; }
        public string? City { get; init; }
    }

    private sealed record UserEducationHistorySeedDto
    {
        public string? SchoolName { get; init; }
        public string? EducationLevel { get; init; }
        public string? FieldOfStudy { get; init; }
        public int? StartYear { get; init; }
        public int? EndYear { get; init; }
    }

    private sealed record InstitutionOwnerSeedDto
    {
        public string Email { get; init; } = default!;
        public string Password { get; init; } = "Shkolla123!";
        public string? FirstName { get; init; }
        public string? LastName { get; init; }
        public string? PhoneNumber { get; init; }
    }

    private sealed record InstitutionSeedDto
    {
        public string InstitutionTypeName { get; init; } = default!;
        public string? OwnerEmail { get; init; }
        public string Name { get; init; } = default!;
        public string? Description { get; init; }
        public string? Location { get; init; }
        public string? City { get; init; }
        public string? Address { get; init; }
        public string? Website { get; init; }
        public string? Email { get; init; }
        public string? Phone { get; init; }
        public bool IsApproved { get; init; } = true;
        public InstitutionDetailSeedDto? Details { get; init; }
        public List<InstitutionProgramSeedDto> Programs { get; init; } = [];
        public List<InstitutionFacilitySeedDto> Facilities { get; init; } = [];
        public List<InstitutionStaffSeedDto> Staff { get; init; } = [];
        public List<InstitutionAnnouncementSeedDto> Announcements { get; init; } = [];
    }

    private sealed record InstitutionDetailSeedDto
    {
        public string? AgeGroups { get; init; }
        public string? DailySchedule { get; init; }
        public bool? OutdoorSpaces { get; init; }
        public string? SecurityInfo { get; init; }
        public string? GradesOffered { get; init; }
        public string? Curriculum { get; init; }
        public string? ExtracurricularActivities { get; init; }
        public int? ClassSize { get; init; }
        public string? Directions { get; init; }
        public string? AdmissionInfo { get; init; }
        public string? Departments { get; init; }
        public string? ECTSInfo { get; init; }
        public string? ExchangePrograms { get; init; }
    }

    private sealed record InstitutionProgramSeedDto
    {
        public string Name { get; init; } = default!;
        public string? Level { get; init; }
        public string? Description { get; init; }
        public string? Duration { get; init; }
        public decimal? TuitionFee { get; init; }
        public int? ECTS { get; init; }
    }

    private sealed record InstitutionFacilitySeedDto
    {
        public string Name { get; init; } = default!;
        public string? Description { get; init; }
    }

    private sealed record InstitutionStaffSeedDto
    {
        public string FullName { get; init; } = default!;
        public string? Position { get; init; }
    }

    private sealed record InstitutionAnnouncementSeedDto
    {
        public string Title { get; init; } = default!;
        public string? Content { get; init; }
    }
}
