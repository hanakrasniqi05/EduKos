using System.ComponentModel.DataAnnotations;

namespace EduKos.Application.DTOs.Education;

public class UserDto
{
    public int UserId { get; set; }
    [Required, EmailAddress, MaxLength(255)] public string Email { get; set; } = default!;
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(50)] public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
}

public class RoleDto
{
    public int RoleId { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = default!;
}

public class InstitutionTypeDto
{
    public int InstitutionTypeId { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = default!;
}

public class InstitutionDto
{
    public int InstitutionId { get; set; }
    [Required] public int InstitutionTypeId { get; set; }
    public int? OwnerUserId { get; set; }
    [Required, MaxLength(255)] public string Name { get; set; } = default!;
    public string? Description { get; set; }
    [MaxLength(255)] public string? Location { get; set; }
    [MaxLength(100)] public string? City { get; set; }
    [MaxLength(255)] public string? Address { get; set; }
    [MaxLength(255)] public string? Website { get; set; }
    [EmailAddress, MaxLength(255)] public string? Email { get; set; }
    [MaxLength(50)] public string? Phone { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? InstitutionTypeName { get; set; }
}

public class InstitutionDetailDto
{
    public int InstitutionDetailId { get; set; }
    [Required] public int InstitutionId { get; set; }
    public string? AgeGroups { get; set; }
    public string? DailySchedule { get; set; }
    public bool? OutdoorSpaces { get; set; }
    public string? SecurityInfo { get; set; }
    public string? GradesOffered { get; set; }
    public string? Curriculum { get; set; }
    public string? ExtracurricularActivities { get; set; }
    public int? ClassSize { get; set; }
    public string? Directions { get; set; }
    public string? AdmissionInfo { get; set; }
    public string? Departments { get; set; }
    public string? ECTSInfo { get; set; }
    public string? ExchangePrograms { get; set; }
}

public class InstitutionProgramDto
{
    public int ProgramId { get; set; }
    [Required] public int InstitutionId { get; set; }
    [Required, MaxLength(255)] public string Name { get; set; } = default!;
    [MaxLength(100)] public string? Level { get; set; }
    public string? Description { get; set; }
    [MaxLength(100)] public string? Duration { get; set; }
    public decimal? TuitionFee { get; set; }
    public int? ECTS { get; set; }
}

public class InstitutionStaffDto
{
    public int StaffId { get; set; }
    [Required] public int InstitutionId { get; set; }
    [Required, MaxLength(150)] public string FullName { get; set; } = default!;
    [MaxLength(150)] public string? Position { get; set; }
    public int? PhotoFileId { get; set; }
}

public class InstitutionFacilityDto
{
    public int FacilityId { get; set; }
    [Required] public int InstitutionId { get; set; }
    [Required, MaxLength(150)] public string Name { get; set; } = default!;
    public string? Description { get; set; }
}

public class InstitutionAnnouncementDto
{
    public int AnnouncementId { get; set; }
    [Required] public int InstitutionId { get; set; }
    [Required, MaxLength(255)] public string Title { get; set; } = default!;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    [Required] public int InstitutionId { get; set; }
    [Range(1, 5)] public int? TeachingQualityRating { get; set; }
    [Range(1, 5)] public int? FacilitiesRating { get; set; }
    [Range(1, 5)] public int? DifficultyRating { get; set; }
    [Range(1, 5)] public int? StaffRating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SavedInstitutionDto
{
    public int SavedInstitutionId { get; set; }
    public int UserId { get; set; }
    [Required] public int InstitutionId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RecommendationDto
{
    public int RecommendationId { get; set; }
    [Required] public int UserId { get; set; }
    [Required] public int InstitutionId { get; set; }
    public decimal? MatchScore { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NotificationDto
{
    public int NotificationId { get; set; }
    [Required] public int UserId { get; set; }
    [Required, MaxLength(255)] public string Title { get; set; } = default!;
    [Required] public string Message { get; set; } = default!;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApplicationDto
{
    public int ApplicationId { get; set; }
    [Required] public int InstitutionId { get; set; }
    public int? UserId { get; set; }
    [Required, MaxLength(150)] public string FullName { get; set; } = default!;
    [Required, EmailAddress, MaxLength(255)] public string Email { get; set; } = default!;
    [Required, MaxLength(50)] public string Phone { get; set; } = default!;
    [Required, MaxLength(100)] public string EducationLevel { get; set; } = default!;
    [MaxLength(255)] public string? SelectedProgram { get; set; }
    public string? Message { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
    public string? InstitutionName { get; set; }
}

public class ApplicationStatusUpdateDto
{
    [Required, MaxLength(50)] public string Status { get; set; } = default!;
}

public class FileDto
{
    public int FileId { get; set; }
    public int? UploadedByUserId { get; set; }
    [Required, MaxLength(255)] public string FileName { get; set; } = default!;
    [Required, MaxLength(500)] public string FileUrl { get; set; } = default!;
    [MaxLength(100)] public string? FileType { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SettingDto
{
    public int SettingId { get; set; }
    [Required, MaxLength(150)] public string SettingKey { get; set; } = default!;
    [MaxLength(500)] public string? SettingValue { get; set; }
}

public class InstitutionSearchRequestDto
{
    public string? Name { get; set; }
    public string? City { get; set; }
    public string? Category { get; set; }
    public int? InstitutionTypeId { get; set; }
    public string? Program { get; set; }
    public bool? IsApproved { get; set; }
    public decimal? MinTuitionFee { get; set; }
    public decimal? MaxTuitionFee { get; set; }
    public double? MinRating { get; set; }
    public string? Language { get; set; }
    public string? InstitutionOwnership { get; set; }
}

public class SaveInstitutionRequestDto
{
    [Required] public int InstitutionId { get; set; }
}

public class InstitutionFullDetailsDto
{
    public InstitutionDto Institution { get; set; } = default!;
    public InstitutionDetailDto? Details { get; set; }
    public IList<InstitutionProgramDto> Programs { get; set; } = new List<InstitutionProgramDto>();
    public IList<InstitutionStaffDto> Staff { get; set; } = new List<InstitutionStaffDto>();
    public IList<InstitutionFacilityDto> Facilities { get; set; } = new List<InstitutionFacilityDto>();
    public IList<ReviewDto> Reviews { get; set; } = new List<ReviewDto>();
    public IList<InstitutionAnnouncementDto> Announcements { get; set; } = new List<InstitutionAnnouncementDto>();
}

public class UserProfileUpdateDto
{
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(50)] public string? PhoneNumber { get; set; }
}

public class CreateProgramRequestDto
{
    [Required, MaxLength(255)]
    public string Name { get; set; } = default!;

    [MaxLength(100)]
    public string? Level { get; set; }

    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Duration { get; set; }

    public decimal? TuitionFee { get; set; }

    public int? ECTS { get; set; }
}

public class UpdateProgramRequestDto
{
    [MaxLength(255)]
    public string? Name { get; set; }

    [MaxLength(100)]
    public string? Level { get; set; }

    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Duration { get; set; }

    public decimal? TuitionFee { get; set; }

    public int? ECTS { get; set; }
}

public class CreateStaffRequestDto
{
    [Required, MaxLength(150)]
    public string FullName { get; set; } = default!;

    [MaxLength(150)]
    public string? Position { get; set; }

    public int? PhotoFileId { get; set; }
}

public class UpdateStaffRequestDto
{
    [MaxLength(150)]
    public string? FullName { get; set; }

    [MaxLength(150)]
    public string? Position { get; set; }

    public int? PhotoFileId { get; set; }
}

public class CreateFacilityRequestDto
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = default!;

    public string? Description { get; set; }
}

public class UpdateFacilityRequestDto
{
    [MaxLength(150)]
    public string? Name { get; set; }

    public string? Description { get; set; }
}

public class CreateAnnouncementRequestDto
{
    [Required, MaxLength(255)]
    public string Title { get; set; } = default!;

    public string? Content { get; set; }
}

public class UpdateAnnouncementRequestDto
{
    [MaxLength(255)]
    public string? Title { get; set; }

    public string? Content { get; set; }
}
