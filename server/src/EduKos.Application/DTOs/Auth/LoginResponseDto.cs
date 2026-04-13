namespace EduKos.Application.DTOs.Auth;

public record LoginResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public DateTime AccessTokenExpires { get; init; }
    public UserInfoDto User { get; init; } = null!;
}
