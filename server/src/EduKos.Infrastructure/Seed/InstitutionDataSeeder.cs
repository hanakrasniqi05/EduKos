using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using EduKos.Infrastructure.Seed.Models;
using Microsoft.EntityFrameworkCore;

namespace EduKos.Infrastructure.Seed;

internal static class InstitutionDataSeeder
{
    private static readonly string[] LegacySeedNames =
    [
        "Shkolla Fillore Hasan Prishtina",
        "Kolegji AAB",
        "Gjimnazi Xhevdet Doda",
    ];

    public static async Task SeedAsync(
        AppDbContext context,
        string filePath,
        CancellationToken cancellationToken)
    {
        var items = await JsonSeedFile.ReadAsync<List<InstitutionSeedModel>>(
            filePath,
            cancellationToken);
        if (items.Count == 0) return;

        var typeIds = await context.InstitutionTypes.ToDictionaryAsync(
            type => type.Name,
            type => type.InstitutionTypeId,
            cancellationToken);
        var fallbackOwnerId = await FindOwnerId(
            context,
            "shkolla@edukos.com",
            null,
            cancellationToken);

        foreach (var item in items)
        {
            if (!typeIds.TryGetValue(item.InstitutionTypeName, out var typeId)) continue;

            var ownerId = await FindOwnerId(
                context,
                item.OwnerEmail,
                fallbackOwnerId,
                cancellationToken);
            var institution = await FindOrCreateInstitution(
                context,
                item,
                typeId,
                ownerId,
                cancellationToken);

            EnsureDetails(context, institution, item);
            await EnsurePrograms(context, institution.InstitutionId, item, cancellationToken);
            await EnsureFacilities(context, institution.InstitutionId, item, cancellationToken);
            await EnsureStaff(context, institution.InstitutionId, item, cancellationToken);
            await EnsureAnnouncements(context, institution.InstitutionId, item, cancellationToken);
        }

        await MarkLegacySeeds(context, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task<int?> FindOwnerId(
        AppDbContext context,
        string? email,
        int? fallback,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(email)) return fallback;

        return await context.Users
            .Where(user => user.Email == email.Trim().ToLowerInvariant())
            .Select(user => (int?)user.UserId)
            .FirstOrDefaultAsync(cancellationToken) ?? fallback;
    }

    private static async Task<Institution> FindOrCreateInstitution(
        AppDbContext context,
        InstitutionSeedModel item,
        int typeId,
        int? ownerId,
        CancellationToken cancellationToken)
    {
        var institution = await context.Institutions
            .Include(entity => entity.Details)
            .FirstOrDefaultAsync(
                entity => entity.Name == item.Name && entity.City == item.City,
                cancellationToken);

        if (institution == null)
        {
            institution = new Institution
            {
                InstitutionTypeId = typeId,
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
                IsSeeded = true,
            };
            context.Institutions.Add(institution);
            await context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            institution.IsSeeded = true;
            institution.IsApproved = item.IsApproved;
        }

        return institution;
    }

    private static void EnsureDetails(
        AppDbContext context,
        Institution institution,
        InstitutionSeedModel item)
    {
        if (item.Details == null || institution.Details != null) return;

        var details = item.Details;
        context.InstitutionDetails.Add(new InstitutionDetail
        {
            InstitutionId = institution.InstitutionId,
            AgeGroups = details.AgeGroups,
            DailySchedule = details.DailySchedule,
            OutdoorSpaces = details.OutdoorSpaces,
            SecurityInfo = details.SecurityInfo,
            GradesOffered = details.GradesOffered,
            Curriculum = details.Curriculum,
            ExtracurricularActivities = details.ExtracurricularActivities,
            ClassSize = details.ClassSize,
            Directions = details.Directions,
            AdmissionInfo = details.AdmissionInfo,
            Departments = details.Departments,
            ECTSInfo = details.ECTSInfo,
            ExchangePrograms = details.ExchangePrograms,
        });
    }

    private static async Task EnsurePrograms(
        AppDbContext context,
        int institutionId,
        InstitutionSeedModel item,
        CancellationToken cancellationToken)
    {
        foreach (var program in item.Programs)
        {
            if (await context.InstitutionPrograms.AnyAsync(
                entity => entity.InstitutionId == institutionId && entity.Name == program.Name,
                cancellationToken)) continue;

            context.InstitutionPrograms.Add(new InstitutionProgram
            {
                InstitutionId = institutionId,
                Name = program.Name,
                Level = program.Level,
                Description = program.Description,
                Duration = program.Duration,
                TuitionFee = program.TuitionFee,
                ECTS = program.ECTS,
            });
        }
    }

    private static async Task EnsureFacilities(
        AppDbContext context,
        int institutionId,
        InstitutionSeedModel item,
        CancellationToken cancellationToken)
    {
        foreach (var facility in item.Facilities)
        {
            if (await context.InstitutionFacilities.AnyAsync(
                entity => entity.InstitutionId == institutionId && entity.Name == facility.Name,
                cancellationToken)) continue;

            context.InstitutionFacilities.Add(new InstitutionFacility
            {
                InstitutionId = institutionId,
                Name = facility.Name,
                Description = facility.Description,
            });
        }
    }

    private static async Task EnsureStaff(
        AppDbContext context,
        int institutionId,
        InstitutionSeedModel item,
        CancellationToken cancellationToken)
    {
        foreach (var staff in item.Staff)
        {
            if (await context.InstitutionStaff.AnyAsync(
                entity => entity.InstitutionId == institutionId && entity.FullName == staff.FullName,
                cancellationToken)) continue;

            context.InstitutionStaff.Add(new InstitutionStaff
            {
                InstitutionId = institutionId,
                FullName = staff.FullName,
                Position = staff.Position,
            });
        }
    }

    private static async Task EnsureAnnouncements(
        AppDbContext context,
        int institutionId,
        InstitutionSeedModel item,
        CancellationToken cancellationToken)
    {
        foreach (var announcement in item.Announcements)
        {
            if (await context.InstitutionAnnouncements.AnyAsync(
                entity => entity.InstitutionId == institutionId &&
                          entity.Title == announcement.Title,
                cancellationToken)) continue;

            context.InstitutionAnnouncements.Add(new InstitutionAnnouncement
            {
                InstitutionId = institutionId,
                Title = announcement.Title,
                Content = announcement.Content,
            });
        }
    }

    private static async Task MarkLegacySeeds(
        AppDbContext context,
        CancellationToken cancellationToken)
    {
        var institutions = await context.Institutions
            .Where(entity => LegacySeedNames.Contains(entity.Name))
            .ToListAsync(cancellationToken);

        foreach (var institution in institutions)
        {
            institution.IsSeeded = true;
        }
    }
}
