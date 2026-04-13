namespace EduKos.Application.DTOs.Auth;

public record UpdateProfileDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
}

public record ChangePasswordDto
{
    public string CurrentPassword { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
}
