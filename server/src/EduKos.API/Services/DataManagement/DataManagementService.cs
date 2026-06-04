using System.Globalization;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Services.DataManagement;

public class DataManagementService(AppDbContext context, PasswordHasher<User> passwordHasher) : IDataManagementService
{
    public async Task<DataExportResult> ExportAsync(string entity, string format, CancellationToken cancellationToken)
    {
        var normalizedEntity = NormalizeEntity(entity);
        var normalizedFormat = NormalizeFormat(format);
        var rows = await GetRows(normalizedEntity, cancellationToken);
        var fileName = $"{normalizedEntity}-{DateTime.UtcNow:yyyyMMddHHmmss}.{Extension(normalizedFormat)}";

        return normalizedFormat switch
        {
            "json" => new DataExportResult(TabularFileService.WriteJson(rows), "application/json", fileName),
            "csv" => new DataExportResult(TabularFileService.WriteCsv(rows), "text/csv", fileName),
            "excel" => new DataExportResult(
                TabularFileService.WriteExcel(rows, normalizedEntity),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName),
            _ => throw new InvalidOperationException("Supported formats are csv, excel, and json.")
        };
    }

    public async Task<ImportResult> ImportAsync(string entity, string format, IFormFile file, CancellationToken cancellationToken)
    {
        var normalizedEntity = NormalizeEntity(entity);
        var normalizedFormat = NormalizeFormat(format);
        var rows = normalizedFormat switch
        {
            "json" => await TabularFileService.ReadJson(file, cancellationToken),
            "csv" => await TabularFileService.ReadCsv(file, cancellationToken),
            "excel" => await TabularFileService.ReadExcel(file, cancellationToken),
            _ => throw new InvalidOperationException("Supported formats are csv, excel, and json.")
        };

        var result = normalizedEntity switch
        {
            "users" => await ImportUsers(rows, cancellationToken),
            "institutions" => await ImportInstitutions(rows, cancellationToken),
            "applications" => await ImportApplications(rows, cancellationToken),
            "programs" => await ImportPrograms(rows, cancellationToken),
            "staff-facilities" => await ImportStaffFacilities(rows, cancellationToken),
            _ => throw new InvalidOperationException("Unknown data entity.")
        };

        await context.SaveChangesAsync(cancellationToken);
        return result;
    }

    private async Task<IReadOnlyList<Dictionary<string, string?>>> GetRows(string entity, CancellationToken cancellationToken)
    {
        return entity switch
        {
            "users" => (await context.Users.AsNoTracking().Include(x => x.UserRoles).ThenInclude(x => x.Role).OrderBy(x => x.UserId).ToListAsync(cancellationToken))
                .Select(UserRow)
                .ToList(),
            "institutions" => (await context.Institutions.AsNoTracking().Include(x => x.InstitutionType).OrderBy(x => x.InstitutionId).ToListAsync(cancellationToken))
                .Select(InstitutionRow)
                .ToList(),
            "applications" => (await context.Applications.AsNoTracking().Include(x => x.Institution).OrderBy(x => x.ApplicationId).ToListAsync(cancellationToken))
                .Select(ApplicationRow)
                .ToList(),
            "programs" => (await context.InstitutionPrograms.AsNoTracking().Include(x => x.Institution).OrderBy(x => x.ProgramId).ToListAsync(cancellationToken))
                .Select(ProgramRow)
                .ToList(),
            "staff-facilities" => await GetStaffFacilitiesRows(cancellationToken),
            _ => throw new InvalidOperationException("Unknown data entity.")
        };
    }

    private async Task<IReadOnlyList<Dictionary<string, string?>>> GetStaffFacilitiesRows(CancellationToken cancellationToken)
    {
        var staff = await context.InstitutionStaff
            .AsNoTracking()
            .Include(x => x.Institution)
            .OrderBy(x => x.StaffId)
            .ToListAsync(cancellationToken);

        var facilities = await context.InstitutionFacilities
            .AsNoTracking()
            .Include(x => x.Institution)
            .OrderBy(x => x.FacilityId)
            .ToListAsync(cancellationToken);

        return staff.Select(StaffRow).Concat(facilities.Select(FacilityRow)).ToList();
    }

    private async Task<ImportResult> ImportUsers(IReadOnlyList<Dictionary<string, string?>> rows, CancellationToken cancellationToken)
    {
        var result = new ImportResult();
        foreach (var row in rows)
        {
            var email = Value(row, "email");
            if (string.IsNullOrWhiteSpace(email))
            {
                result.Skipped++;
                continue;
            }

            var user = await context.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
            if (user == null)
            {
                var password = Value(row, "password");
                if (string.IsNullOrWhiteSpace(password))
                {
                    result.Skipped++;
                    continue;
                }

                user = new User { Email = email };
                user.PasswordHash = passwordHasher.HashPassword(user, password);
                await context.Users.AddAsync(user, cancellationToken);
                result.Created++;
            }
            else
            {
                result.Updated++;
            }

            user.FirstName = Value(row, "firstName");
            user.LastName = Value(row, "lastName");
            user.PhoneNumber = Value(row, "phoneNumber");
            user.IsActive = BoolValue(row, "isActive") ?? true;
        }

        return result;
    }

    private async Task<ImportResult> ImportInstitutions(IReadOnlyList<Dictionary<string, string?>> rows, CancellationToken cancellationToken)
    {
        var result = new ImportResult();
        foreach (var row in rows)
        {
            var name = Value(row, "name");
            if (string.IsNullOrWhiteSpace(name))
            {
                result.Skipped++;
                continue;
            }

            var id = IntValue(row, "institutionId");
            var institution = id.HasValue
                ? await context.Institutions.FirstOrDefaultAsync(x => x.InstitutionId == id.Value, cancellationToken)
                : await context.Institutions.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

            if (institution == null)
            {
                institution = new Institution();
                await context.Institutions.AddAsync(institution, cancellationToken);
                result.Created++;
            }
            else
            {
                result.Updated++;
            }

            institution.Name = name;
            institution.InstitutionTypeId = IntValue(row, "institutionTypeId") ?? institution.InstitutionTypeId;
            institution.OwnerUserId = IntValue(row, "ownerUserId");
            institution.Description = Value(row, "description");
            institution.Location = Value(row, "location");
            institution.City = Value(row, "city");
            institution.Address = Value(row, "address");
            institution.Website = Value(row, "website");
            institution.Email = Value(row, "email");
            institution.Phone = Value(row, "phone");
            institution.IsApproved = BoolValue(row, "isApproved") ?? institution.IsApproved;
        }

        return result;
    }

    private async Task<ImportResult> ImportApplications(IReadOnlyList<Dictionary<string, string?>> rows, CancellationToken cancellationToken)
    {
        var result = new ImportResult();
        foreach (var row in rows)
        {
            var institutionId = IntValue(row, "institutionId");
            var fullName = Value(row, "fullName");
            var email = Value(row, "email");
            var phone = Value(row, "phone");
            var educationLevel = Value(row, "educationLevel");

            if (!institutionId.HasValue || string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(educationLevel))
            {
                result.Skipped++;
                continue;
            }

            var id = IntValue(row, "applicationId");
            var application = id.HasValue
                ? await context.Applications.FirstOrDefaultAsync(x => x.ApplicationId == id.Value, cancellationToken)
                : null;

            if (application == null)
            {
                application = new InstitutionApplication();
                await context.Applications.AddAsync(application, cancellationToken);
                result.Created++;
            }
            else
            {
                result.Updated++;
            }

            application.InstitutionId = institutionId.Value;
            application.UserId = IntValue(row, "userId");
            application.FullName = fullName;
            application.Email = email;
            application.Phone = phone;
            application.EducationLevel = educationLevel;
            application.SelectedProgram = Value(row, "selectedProgram");
            application.Message = Value(row, "message");
            application.DocumentFileId = IntValue(row, "documentFileId");
            application.Status = Value(row, "status") ?? "pending";
        }

        return result;
    }

    private async Task<ImportResult> ImportPrograms(IReadOnlyList<Dictionary<string, string?>> rows, CancellationToken cancellationToken)
    {
        var result = new ImportResult();
        foreach (var row in rows)
        {
            var institutionId = IntValue(row, "institutionId");
            var name = Value(row, "name");

            if (!institutionId.HasValue || string.IsNullOrWhiteSpace(name))
            {
                result.Skipped++;
                continue;
            }

            var id = IntValue(row, "programId");
            var program = id.HasValue
                ? await context.InstitutionPrograms.FirstOrDefaultAsync(x => x.ProgramId == id.Value, cancellationToken)
                : await context.InstitutionPrograms.FirstOrDefaultAsync(x => x.InstitutionId == institutionId.Value && x.Name == name, cancellationToken);

            if (program == null)
            {
                program = new InstitutionProgram();
                await context.InstitutionPrograms.AddAsync(program, cancellationToken);
                result.Created++;
            }
            else
            {
                result.Updated++;
            }

            program.InstitutionId = institutionId.Value;
            program.Name = name;
            program.Level = Value(row, "level");
            program.Description = Value(row, "description");
            program.Duration = Value(row, "duration");
            program.TuitionFee = DecimalValue(row, "tuitionFee");
            program.ECTS = IntValue(row, "ects");
        }

        return result;
    }

    private async Task<ImportResult> ImportStaffFacilities(IReadOnlyList<Dictionary<string, string?>> rows, CancellationToken cancellationToken)
    {
        var result = new ImportResult();
        foreach (var row in rows)
        {
            var recordType = Value(row, "recordType")?.Trim().ToLowerInvariant();
            var institutionId = IntValue(row, "institutionId");
            var name = Value(row, "name");

            if (!institutionId.HasValue || string.IsNullOrWhiteSpace(name))
            {
                result.Skipped++;
                continue;
            }

            if (recordType == "staff")
            {
                await ImportStaff(row, institutionId.Value, name, result, cancellationToken);
            }
            else if (recordType == "facility")
            {
                await ImportFacility(row, institutionId.Value, name, result, cancellationToken);
            }
            else
            {
                result.Skipped++;
            }
        }

        return result;
    }

    private async Task ImportStaff(Dictionary<string, string?> row, int institutionId, string name, ImportResult result, CancellationToken cancellationToken)
    {
        var id = IntValue(row, "id");
        var item = id.HasValue
            ? await context.InstitutionStaff.FirstOrDefaultAsync(x => x.StaffId == id.Value, cancellationToken)
            : await context.InstitutionStaff.FirstOrDefaultAsync(x => x.InstitutionId == institutionId && x.FullName == name, cancellationToken);

        if (item == null)
        {
            item = new InstitutionStaff();
            await context.InstitutionStaff.AddAsync(item, cancellationToken);
            result.Created++;
        }
        else
        {
            result.Updated++;
        }

        item.InstitutionId = institutionId;
        item.FullName = name;
        item.Position = Value(row, "description");
        item.PhotoFileId = IntValue(row, "photoFileId");
    }

    private async Task ImportFacility(Dictionary<string, string?> row, int institutionId, string name, ImportResult result, CancellationToken cancellationToken)
    {
        var id = IntValue(row, "id");
        var item = id.HasValue
            ? await context.InstitutionFacilities.FirstOrDefaultAsync(x => x.FacilityId == id.Value, cancellationToken)
            : await context.InstitutionFacilities.FirstOrDefaultAsync(x => x.InstitutionId == institutionId && x.Name == name, cancellationToken);

        if (item == null)
        {
            item = new InstitutionFacility();
            await context.InstitutionFacilities.AddAsync(item, cancellationToken);
            result.Created++;
        }
        else
        {
            result.Updated++;
        }

        item.InstitutionId = institutionId;
        item.Name = name;
        item.Description = Value(row, "description");
    }

    private static Dictionary<string, string?> UserRow(User user) => new()
    {
        ["userId"] = user.UserId.ToString(CultureInfo.InvariantCulture),
        ["email"] = user.Email,
        ["firstName"] = user.FirstName,
        ["lastName"] = user.LastName,
        ["phoneNumber"] = user.PhoneNumber,
        ["isActive"] = user.IsActive.ToString(CultureInfo.InvariantCulture),
        ["createdAt"] = user.CreatedAt.ToString("O", CultureInfo.InvariantCulture),
        ["roles"] = string.Join("|", user.UserRoles.Select(r => r.Role.Name))
    };

    private static Dictionary<string, string?> InstitutionRow(Institution institution) => new()
    {
        ["institutionId"] = institution.InstitutionId.ToString(CultureInfo.InvariantCulture),
        ["institutionTypeId"] = institution.InstitutionTypeId.ToString(CultureInfo.InvariantCulture),
        ["institutionTypeName"] = institution.InstitutionType.Name,
        ["ownerUserId"] = institution.OwnerUserId.HasValue ? institution.OwnerUserId.Value.ToString(CultureInfo.InvariantCulture) : null,
        ["name"] = institution.Name,
        ["description"] = institution.Description,
        ["location"] = institution.Location,
        ["city"] = institution.City,
        ["address"] = institution.Address,
        ["website"] = institution.Website,
        ["email"] = institution.Email,
        ["phone"] = institution.Phone,
        ["isApproved"] = institution.IsApproved.ToString(CultureInfo.InvariantCulture),
        ["createdAt"] = institution.CreatedAt.ToString("O", CultureInfo.InvariantCulture)
    };

    private static Dictionary<string, string?> ApplicationRow(InstitutionApplication application) => new()
    {
        ["applicationId"] = application.ApplicationId.ToString(CultureInfo.InvariantCulture),
        ["institutionId"] = application.InstitutionId.ToString(CultureInfo.InvariantCulture),
        ["institutionName"] = application.Institution.Name,
        ["userId"] = application.UserId.HasValue ? application.UserId.Value.ToString(CultureInfo.InvariantCulture) : null,
        ["fullName"] = application.FullName,
        ["email"] = application.Email,
        ["phone"] = application.Phone,
        ["educationLevel"] = application.EducationLevel,
        ["selectedProgram"] = application.SelectedProgram,
        ["message"] = application.Message,
        ["documentFileId"] = application.DocumentFileId.HasValue ? application.DocumentFileId.Value.ToString(CultureInfo.InvariantCulture) : null,
        ["status"] = application.Status,
        ["createdAt"] = application.CreatedAt.ToString("O", CultureInfo.InvariantCulture)
    };

    private static Dictionary<string, string?> ProgramRow(InstitutionProgram program) => new()
    {
        ["programId"] = program.ProgramId.ToString(CultureInfo.InvariantCulture),
        ["institutionId"] = program.InstitutionId.ToString(CultureInfo.InvariantCulture),
        ["institutionName"] = program.Institution.Name,
        ["name"] = program.Name,
        ["level"] = program.Level,
        ["description"] = program.Description,
        ["duration"] = program.Duration,
        ["tuitionFee"] = program.TuitionFee.HasValue ? program.TuitionFee.Value.ToString(CultureInfo.InvariantCulture) : null,
        ["ects"] = program.ECTS.HasValue ? program.ECTS.Value.ToString(CultureInfo.InvariantCulture) : null
    };

    private static Dictionary<string, string?> StaffRow(InstitutionStaff staff) => new()
    {
        ["recordType"] = "staff",
        ["id"] = staff.StaffId.ToString(CultureInfo.InvariantCulture),
        ["institutionId"] = staff.InstitutionId.ToString(CultureInfo.InvariantCulture),
        ["institutionName"] = staff.Institution.Name,
        ["name"] = staff.FullName,
        ["description"] = staff.Position,
        ["photoFileId"] = staff.PhotoFileId.HasValue ? staff.PhotoFileId.Value.ToString(CultureInfo.InvariantCulture) : null
    };

    private static Dictionary<string, string?> FacilityRow(InstitutionFacility facility) => new()
    {
        ["recordType"] = "facility",
        ["id"] = facility.FacilityId.ToString(CultureInfo.InvariantCulture),
        ["institutionId"] = facility.InstitutionId.ToString(CultureInfo.InvariantCulture),
        ["institutionName"] = facility.Institution.Name,
        ["name"] = facility.Name,
        ["description"] = facility.Description,
        ["photoFileId"] = null
    };

    private static string NormalizeEntity(string entity) =>
        entity.Trim().ToLowerInvariant().Replace("_", "-");

    private static string NormalizeFormat(string format) =>
        format.Trim().ToLowerInvariant() switch
        {
            "xlsx" => "excel",
            "csv" => "csv",
            "json" => "json",
            "excel" => "excel",
            _ => format.Trim().ToLowerInvariant()
        };

    private static string Extension(string format) => format == "excel" ? "xlsx" : format;

    private static string? Value(Dictionary<string, string?> row, string key) =>
        row.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value) ? value.Trim() : null;

    private static int? IntValue(Dictionary<string, string?> row, string key) =>
        int.TryParse(Value(row, key), NumberStyles.Integer, CultureInfo.InvariantCulture, out var value) ? value : null;

    private static decimal? DecimalValue(Dictionary<string, string?> row, string key) =>
        decimal.TryParse(Value(row, key), NumberStyles.Number, CultureInfo.InvariantCulture, out var value) ? value : null;

    private static bool? BoolValue(Dictionary<string, string?> row, string key) =>
        bool.TryParse(Value(row, key), out var value) ? value : null;
}
