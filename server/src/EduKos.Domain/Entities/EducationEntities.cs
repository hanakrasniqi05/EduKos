namespace EduKos.Domain.Entities;

public class User
{
    public int UserId { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

public class Role
{
    public int RoleId { get; set; }
    public string Name { get; set; } = default!;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class UserRole
{
    public int UserRoleId { get; set; }
    public int UserId { get; set; }
    public int RoleId { get; set; }

    public User User { get; set; } = default!;
    public Role Role { get; set; } = default!;
}

public class Permission
{
    public int PermissionId { get; set; }
    public string Name { get; set; } = default!;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission
{
    public int RolePermissionId { get; set; }
    public int RoleId { get; set; }
    public int PermissionId { get; set; }

    public Role Role { get; set; } = default!;
    public Permission Permission { get; set; } = default!;
}

public class RefreshToken
{
    public int RefreshTokenId { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive => RevokedAt == null && ExpiresAt > DateTime.UtcNow;

    public User User { get; set; } = default!;
}

public class AuditLog
{
    public int AuditLogId { get; set; }
    public int? UserId { get; set; }
    public string Action { get; set; } = default!;
    public string? EntityName { get; set; }
    public int? EntityId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class Notification
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = default!;
}

public class InstitutionApplication
{
    public int ApplicationId { get; set; }
    public int InstitutionId { get; set; }
    public int? UserId { get; set; }
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string EducationLevel { get; set; } = default!;
    public string? SelectedProgram { get; set; }
    public string? Message { get; set; }
    public int? DocumentFileId { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Institution Institution { get; set; } = default!;
    public User? User { get; set; }
    public FileAsset? DocumentFile { get; set; }
    public ICollection<ApplicationStatusUpdate> StatusUpdates { get; set; } = new List<ApplicationStatusUpdate>();
}

public class Setting
{
    public int SettingId { get; set; }
    public string SettingKey { get; set; } = default!;
    public string? SettingValue { get; set; }
}

public class FileAsset
{
    public int FileId { get; set; }
    public int? UploadedByUserId { get; set; }
    public string FileName { get; set; } = default!;
    public string FileUrl { get; set; } = default!;
    public string? FileType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? UploadedByUser { get; set; }
}

public class InstitutionType
{
    public int InstitutionTypeId { get; set; }
    public string Name { get; set; } = default!;

    public ICollection<Institution> Institutions { get; set; } = new List<Institution>();
}

public class Institution
{
    public int InstitutionId { get; set; }
    public int InstitutionTypeId { get; set; }
    public int? OwnerUserId { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Website { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsApproved { get; set; }
    public bool IsSeeded { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public InstitutionType InstitutionType { get; set; } = default!;
    public User? OwnerUser { get; set; }
    public InstitutionDetail? Details { get; set; }
    public ICollection<InstitutionProgram> Programs { get; set; } = new List<InstitutionProgram>();
    public ICollection<InstitutionStaff> Staff { get; set; } = new List<InstitutionStaff>();
    public ICollection<InstitutionFacility> Facilities { get; set; } = new List<InstitutionFacility>();
    public ICollection<InstitutionAnnouncement> Announcements { get; set; } = new List<InstitutionAnnouncement>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class UserProfile
{
    public int UserProfileId { get; set; }
    public int UserId { get; set; }
    public int? ProfileImageFileId { get; set; }
    public string? Bio { get; set; }
    public string? City { get; set; }
    public DateOnly? DateOfBirth { get; set; }

    public User User { get; set; } = default!;
    public FileAsset? ProfileImageFile { get; set; }
}

public class UserEducationHistory
{
    public int EducationHistoryId { get; set; }
    public int UserId { get; set; }
    public string? SchoolName { get; set; }
    public string? EducationLevel { get; set; }
    public string? FieldOfStudy { get; set; }
    public int? StartYear { get; set; }
    public int? EndYear { get; set; }

    public User User { get; set; } = default!;
}

public class UserInterest
{
    public int UserInterestId { get; set; }
    public int UserId { get; set; }
    public string InterestName { get; set; } = default!;

    public User User { get; set; } = default!;
}

public class SavedInstitution
{
    public int SavedInstitutionId { get; set; }
    public int UserId { get; set; }
    public int InstitutionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = default!;
    public Institution Institution { get; set; } = default!;
}

public class InstitutionDetail
{
    public int InstitutionDetailId { get; set; }
    public int InstitutionId { get; set; }
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

    public Institution Institution { get; set; } = default!;
}

public class InstitutionContact
{
    public int ContactId { get; set; }
    public int InstitutionId { get; set; }
    public string? ContactType { get; set; }
    public string? ContactValue { get; set; }

    public Institution Institution { get; set; } = default!;
}

public class InstitutionFacility
{
    public int FacilityId { get; set; }
    public int InstitutionId { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    public Institution Institution { get; set; } = default!;
}

public class InstitutionStaff
{
    public int StaffId { get; set; }
    public int InstitutionId { get; set; }
    public string FullName { get; set; } = default!;
    public string? Position { get; set; }
    public int? PhotoFileId { get; set; }

    public Institution Institution { get; set; } = default!;
    public FileAsset? PhotoFile { get; set; }
}

public class InstitutionProgram
{
    public int ProgramId { get; set; }
    public int InstitutionId { get; set; }
    public string Name { get; set; } = default!;
    public string? Level { get; set; }
    public string? Description { get; set; }
    public string? Duration { get; set; }
    public decimal? TuitionFee { get; set; }
    public int? ECTS { get; set; }

    public Institution Institution { get; set; } = default!;
}

public class InstitutionAnnouncement
{
    public int AnnouncementId { get; set; }
    public int InstitutionId { get; set; }
    public string Title { get; set; } = default!;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Institution Institution { get; set; } = default!;
}

public class Review
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public int InstitutionId { get; set; }
    public int? TeachingQualityRating { get; set; }
    public int? FacilitiesRating { get; set; }
    public int? DifficultyRating { get; set; }
    public int? StaffRating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = default!;
    public Institution Institution { get; set; } = default!;
}

public class Recommendation
{
    public int RecommendationId { get; set; }
    public int UserId { get; set; }
    public int InstitutionId { get; set; }
    public decimal? MatchScore { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = default!;
    public Institution Institution { get; set; } = default!;
}
