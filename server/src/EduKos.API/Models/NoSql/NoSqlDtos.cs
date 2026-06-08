using System.ComponentModel.DataAnnotations;
using EduKos.Infrastructure.Persistence;

namespace EduKos.API.Models.NoSql;

public sealed class CreateMongoNotificationRequest
{
    [Range(1, int.MaxValue)]
    public int UserId { get; init; }

    [Required]
    [StringLength(150)]
    public string Title { get; init; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Message { get; init; } = string.Empty;

    [StringLength(50)]
    public string Type { get; init; } = "general";
}

public sealed record MongoNotificationDto(
    string Id,
    int UserId,
    string Title,
    string Message,
    string Type,
    bool IsRead,
    DateTime CreatedAt);

public sealed record MongoActivityDto(
    string Id,
    int? UserId,
    string Action,
    string? EntityName,
    string? EntityId,
    DateTime CreatedAt,
    IReadOnlyDictionary<string, string> Details);

public sealed record MongoLogDto(
    string Id,
    string Level,
    string Message,
    string? Source,
    int? UserId,
    DateTime CreatedAt,
    IReadOnlyDictionary<string, string> Metadata);

public static class NoSqlDtoMapper
{
    public static MongoNotificationDto ToDto(this NotificationDocument document) =>
        new(
            document.Id ?? string.Empty,
            document.UserId,
            document.Title,
            document.Message,
            document.Type,
            document.IsRead,
            document.CreatedAt);

    public static MongoActivityDto ToDto(this ActivityHistoryDocument document) =>
        new(
            document.Id ?? string.Empty,
            document.UserId,
            document.Action,
            document.EntityName,
            document.EntityId,
            document.CreatedAt,
            document.Details);

    public static MongoLogDto ToDto(this LogDocument document) =>
        new(
            document.Id ?? string.Empty,
            document.Level,
            document.Message,
            document.Source,
            document.UserId,
            document.CreatedAt,
            document.Metadata);
}
