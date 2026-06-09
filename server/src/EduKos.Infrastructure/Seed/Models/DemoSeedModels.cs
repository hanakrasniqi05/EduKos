namespace EduKos.Infrastructure.Seed.Models;

internal sealed record StudentSeedModel
{
    public string Email { get; init; } = default!;
    public string Password { get; init; } = "Student123!";
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNumber { get; init; }
    public UserProfileSeedModel? Profile { get; init; }
    public List<UserEducationSeedModel> EducationHistory { get; init; } = [];
    public List<string> Interests { get; init; } = [];
}

internal sealed record UserProfileSeedModel
{
    public string? Bio { get; init; }
    public string? City { get; init; }
}

internal sealed record UserEducationSeedModel
{
    public string? SchoolName { get; init; }
    public string? EducationLevel { get; init; }
    public string? FieldOfStudy { get; init; }
    public int? StartYear { get; init; }
    public int? EndYear { get; init; }
}

internal sealed record InstitutionOwnerSeedModel
{
    public string Email { get; init; } = default!;
    public string Password { get; init; } = "Shkolla123!";
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNumber { get; init; }
}

internal sealed record InstitutionSeedModel
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
    public InstitutionDetailSeedModel? Details { get; init; }
    public List<InstitutionProgramSeedModel> Programs { get; init; } = [];
    public List<InstitutionFacilitySeedModel> Facilities { get; init; } = [];
    public List<InstitutionStaffSeedModel> Staff { get; init; } = [];
    public List<InstitutionAnnouncementSeedModel> Announcements { get; init; } = [];
}

internal sealed record InstitutionDetailSeedModel
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

internal sealed record InstitutionProgramSeedModel
{
    public string Name { get; init; } = default!;
    public string? Level { get; init; }
    public string? Description { get; init; }
    public string? Duration { get; init; }
    public decimal? TuitionFee { get; init; }
    public int? ECTS { get; init; }
}

internal sealed record InstitutionFacilitySeedModel
{
    public string Name { get; init; } = default!;
    public string? Description { get; init; }
}

internal sealed record InstitutionStaffSeedModel
{
    public string FullName { get; init; } = default!;
    public string? Position { get; init; }
}

internal sealed record InstitutionAnnouncementSeedModel
{
    public string Title { get; init; } = default!;
    public string? Content { get; init; }
}
