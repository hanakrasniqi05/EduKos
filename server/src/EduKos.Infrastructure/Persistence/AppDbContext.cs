using EduKos.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduKos.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<InstitutionApplication> Applications => Set<InstitutionApplication>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<RealtimeNotification> RealtimeNotifications => Set<RealtimeNotification>();
    public DbSet<ApplicationStatusUpdate> ApplicationStatusUpdates => Set<ApplicationStatusUpdate>();
    public DbSet<Setting> Settings => Set<Setting>();
    public DbSet<FileAsset> Files => Set<FileAsset>();
    public DbSet<InstitutionType> InstitutionTypes => Set<InstitutionType>();
    public DbSet<Institution> Institutions => Set<Institution>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserEducationHistory> UserEducationHistory => Set<UserEducationHistory>();
    public DbSet<UserInterest> UserInterests => Set<UserInterest>();
    public DbSet<SavedInstitution> SavedInstitutions => Set<SavedInstitution>();
    public DbSet<InstitutionDetail> InstitutionDetails => Set<InstitutionDetail>();
    public DbSet<InstitutionContact> InstitutionContacts => Set<InstitutionContact>();
    public DbSet<InstitutionFacility> InstitutionFacilities => Set<InstitutionFacility>();
    public DbSet<InstitutionStaff> InstitutionStaff => Set<InstitutionStaff>();
    public DbSet<InstitutionProgram> InstitutionPrograms => Set<InstitutionProgram>();
    public DbSet<InstitutionAnnouncement> InstitutionAnnouncements => Set<InstitutionAnnouncement>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Recommendation> Recommendations => Set<Recommendation>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        builder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
        });

        builder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
        });

        builder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.UserRoleId);
            entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();
            entity.HasOne(e => e.User).WithMany(e => e.UserRoles).HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.Role).WithMany(e => e.UserRoles).HasForeignKey(e => e.RoleId);
        });

        builder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
        });

        builder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => e.RolePermissionId);
            entity.HasIndex(e => new { e.RoleId, e.PermissionId }).IsUnique();
            entity.HasOne(e => e.Role).WithMany(e => e.RolePermissions).HasForeignKey(e => e.RoleId);
            entity.HasOne(e => e.Permission).WithMany(e => e.RolePermissions).HasForeignKey(e => e.PermissionId);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.RefreshTokenId);
            entity.Property(e => e.Token).HasMaxLength(500).IsRequired();
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User).WithMany(e => e.RefreshTokens).HasForeignKey(e => e.UserId);
        });

        builder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditLogId);
            entity.Property(e => e.Action).HasMaxLength(150).IsRequired();
            entity.Property(e => e.EntityName).HasMaxLength(150);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId);
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Message).HasColumnType("text").IsRequired();
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
        });

        builder.Entity<InstitutionApplication>(entity =>
        {
            entity.ToTable("Applications");
            entity.HasKey(e => e.ApplicationId);
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50).IsRequired();
            entity.Property(e => e.EducationLevel).HasMaxLength(100).IsRequired();
            entity.Property(e => e.SelectedProgram).HasMaxLength(255);
            entity.Property(e => e.Message).HasColumnType("text");
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("pending").IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.Institution).WithMany().HasForeignKey(e => e.InstitutionId);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.DocumentFile).WithMany().HasForeignKey(e => e.DocumentFileId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<Setting>(entity =>
        {
            entity.HasKey(e => e.SettingId);
            entity.HasIndex(e => e.SettingKey).IsUnique();
            entity.Property(e => e.SettingKey).HasMaxLength(150).IsRequired();
            entity.Property(e => e.SettingValue).HasMaxLength(500);
        });

        builder.Entity<FileAsset>(entity =>
        {
            entity.ToTable("Files");
            entity.HasKey(e => e.FileId);
            entity.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FileUrl).HasMaxLength(500).IsRequired();
            entity.Property(e => e.FileType).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.UploadedByUser).WithMany().HasForeignKey(e => e.UploadedByUserId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<InstitutionType>(entity =>
        {
            entity.HasKey(e => e.InstitutionTypeId);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
        });

        builder.Entity<Institution>(entity =>
        {
            entity.HasKey(e => e.InstitutionId);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.Website).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.IsApproved).HasDefaultValue(false);
            entity.Property(e => e.IsSeeded).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.InstitutionType).WithMany(e => e.Institutions).HasForeignKey(e => e.InstitutionTypeId);
            entity.HasOne(e => e.OwnerUser).WithMany().HasForeignKey(e => e.OwnerUserId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserProfileId);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.Bio).HasColumnType("text");
            entity.Property(e => e.City).HasMaxLength(100);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.ProfileImageFile).WithMany().HasForeignKey(e => e.ProfileImageFileId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<UserEducationHistory>(entity =>
        {
            entity.HasKey(e => e.EducationHistoryId);
            entity.Property(e => e.SchoolName).HasMaxLength(255);
            entity.Property(e => e.EducationLevel).HasMaxLength(100);
            entity.Property(e => e.FieldOfStudy).HasMaxLength(150);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
        });

        builder.Entity<UserInterest>(entity =>
        {
            entity.HasKey(e => e.UserInterestId);
            entity.Property(e => e.InterestName).HasMaxLength(150).IsRequired();
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
        });

        builder.Entity<SavedInstitution>(entity =>
        {
            entity.HasKey(e => e.SavedInstitutionId);
            entity.HasIndex(e => new { e.UserId, e.InstitutionId }).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Institution).WithMany().HasForeignKey(e => e.InstitutionId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<InstitutionDetail>(entity =>
        {
            entity.HasKey(e => e.InstitutionDetailId);
            entity.HasIndex(e => e.InstitutionId).IsUnique();
            entity.Property(e => e.SecurityInfo).HasColumnType("text");
            entity.Property(e => e.ExtracurricularActivities).HasColumnType("text");
            entity.Property(e => e.Directions).HasColumnType("text");
            entity.Property(e => e.AdmissionInfo).HasColumnType("text");
            entity.Property(e => e.Departments).HasColumnType("text");
            entity.Property(e => e.ECTSInfo).HasColumnType("text");
            entity.Property(e => e.ExchangePrograms).HasColumnType("text");
            entity.HasOne(e => e.Institution).WithOne(e => e.Details).HasForeignKey<InstitutionDetail>(e => e.InstitutionId);
        });

        builder.Entity<InstitutionContact>(entity =>
        {
            entity.HasKey(e => e.ContactId);
            entity.Property(e => e.ContactType).HasMaxLength(100);
            entity.Property(e => e.ContactValue).HasMaxLength(255);
            entity.HasOne(e => e.Institution).WithMany().HasForeignKey(e => e.InstitutionId);
        });

        builder.Entity<InstitutionFacility>(entity =>
        {
            entity.HasKey(e => e.FacilityId);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Description).HasColumnType("text");
            entity.HasOne(e => e.Institution).WithMany(e => e.Facilities).HasForeignKey(e => e.InstitutionId);
        });

        builder.Entity<InstitutionStaff>(entity =>
        {
            entity.HasKey(e => e.StaffId);
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Position).HasMaxLength(150);
            entity.HasOne(e => e.Institution).WithMany(e => e.Staff).HasForeignKey(e => e.InstitutionId);
            entity.HasOne(e => e.PhotoFile).WithMany().HasForeignKey(e => e.PhotoFileId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<InstitutionProgram>(entity =>
        {
            entity.HasKey(e => e.ProgramId);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Level).HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Duration).HasMaxLength(100);
            entity.Property(e => e.TuitionFee).HasColumnType("decimal(10,2)");
            entity.HasOne(e => e.Institution).WithMany(e => e.Programs).HasForeignKey(e => e.InstitutionId);
        });

        builder.Entity<InstitutionAnnouncement>(entity =>
        {
            entity.HasKey(e => e.AnnouncementId);
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Content).HasColumnType("text");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.Institution).WithMany(e => e.Announcements).HasForeignKey(e => e.InstitutionId);
        });

        builder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId);
            entity.Property(e => e.Comment).HasColumnType("text");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Institution).WithMany(e => e.Reviews).HasForeignKey(e => e.InstitutionId);
        });

        builder.Entity<Recommendation>(entity =>
        {
            entity.HasKey(e => e.RecommendationId);
            entity.Property(e => e.MatchScore).HasColumnType("decimal(5,2)");
            entity.Property(e => e.Reason).HasColumnType("text");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Institution).WithMany().HasForeignKey(e => e.InstitutionId);
        });

        builder.Entity<Role>().HasData(
            new Role { RoleId = 1, Name = "Nxenes" },
            new Role { RoleId = 2, Name = "Shkolla" },
            new Role { RoleId = 3, Name = "Admin" });

        builder.Entity<InstitutionType>().HasData(
            new InstitutionType { InstitutionTypeId = 1, Name = "Cerdhe" },
            new InstitutionType { InstitutionTypeId = 2, Name = "Shkolla fillore" },
            new InstitutionType { InstitutionTypeId = 3, Name = "Shkolla e mesme" },
            new InstitutionType { InstitutionTypeId = 4, Name = "Fakultete" });
    }
}
