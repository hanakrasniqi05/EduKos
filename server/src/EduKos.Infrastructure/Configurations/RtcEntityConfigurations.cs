using EduKos.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduKos.Infrastructure.Configurations;

public sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> entity)
    {
        entity.HasKey(item => item.ConversationId);
        entity.Property(item => item.Type).HasMaxLength(50).IsRequired();
        entity.Property(item => item.LastMessage).HasMaxLength(1000);
        entity.Property(item => item.CreatedAt).HasDefaultValueSql("GETDATE()");
        entity.Property(item => item.UpdatedAt).HasDefaultValueSql("GETDATE()");
        entity.HasIndex(item => new { item.Type, item.StudentUserId, item.InstitutionId })
            .IsUnique()
            .HasFilter("[Type] = 'student_institution' AND [StudentUserId] IS NOT NULL");
        entity.HasIndex(item => new { item.Type, item.InstitutionId, item.AdminUserId })
            .IsUnique()
            .HasFilter("[Type] = 'institution_admin' AND [AdminUserId] IS NOT NULL");
        entity.HasIndex(item => item.UpdatedAt);
        entity.HasOne(item => item.StudentUser)
            .WithMany()
            .HasForeignKey(item => item.StudentUserId)
            .OnDelete(DeleteBehavior.NoAction);
        entity.HasOne(item => item.Institution)
            .WithMany()
            .HasForeignKey(item => item.InstitutionId)
            .OnDelete(DeleteBehavior.NoAction);
        entity.HasOne(item => item.AdminUser)
            .WithMany()
            .HasForeignKey(item => item.AdminUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

public sealed class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> entity)
    {
        entity.HasKey(item => item.MessageId);
        entity.Property(item => item.Body).HasMaxLength(4000).IsRequired();
        entity.Property(item => item.CreatedAt).HasDefaultValueSql("GETDATE()");
        entity.HasIndex(item => new { item.ConversationId, item.CreatedAt });
        entity.HasOne(item => item.Conversation)
            .WithMany(conversation => conversation.Messages)
            .HasForeignKey(item => item.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.SenderUser)
            .WithMany()
            .HasForeignKey(item => item.SenderUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

public sealed class RealtimeNotificationConfiguration
    : IEntityTypeConfiguration<RealtimeNotification>
{
    public void Configure(EntityTypeBuilder<RealtimeNotification> entity)
    {
        entity.HasKey(item => item.RealtimeNotificationId);
        entity.Property(item => item.Type).HasMaxLength(100).IsRequired();
        entity.Property(item => item.Title).HasMaxLength(255).IsRequired();
        entity.Property(item => item.Message).HasMaxLength(1000).IsRequired();
        entity.Property(item => item.IsRead).HasDefaultValue(false);
        entity.Property(item => item.CreatedAt).HasDefaultValueSql("GETDATE()");
        entity.HasIndex(item => new { item.RecipientUserId, item.IsRead, item.CreatedAt });
        entity.HasOne(item => item.RecipientUser)
            .WithMany()
            .HasForeignKey(item => item.RecipientUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ApplicationStatusUpdateConfiguration
    : IEntityTypeConfiguration<ApplicationStatusUpdate>
{
    public void Configure(EntityTypeBuilder<ApplicationStatusUpdate> entity)
    {
        entity.HasKey(item => item.ApplicationStatusUpdateId);
        entity.Property(item => item.Status).HasMaxLength(50).IsRequired();
        entity.Property(item => item.CreatedAt).HasDefaultValueSql("GETDATE()");
        entity.HasIndex(item => new { item.ApplicationId, item.CreatedAt });
        entity.HasOne(item => item.Application)
            .WithMany(application => application.StatusUpdates)
            .HasForeignKey(item => item.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(item => item.ChangedByUser)
            .WithMany()
            .HasForeignKey(item => item.ChangedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
