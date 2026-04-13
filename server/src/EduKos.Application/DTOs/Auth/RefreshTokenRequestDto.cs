namespace EduKos.Application.DTOs.Auth;

public record RefreshTokenRequestDto
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
}
