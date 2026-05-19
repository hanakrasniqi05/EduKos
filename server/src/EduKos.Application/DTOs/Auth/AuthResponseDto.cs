namespace EduKos.Application.DTOs.Auth;

public class AuthResponseDto
{
    public string UserId { get; set; } = default!;

    public string Email { get; set; } = default!;

    public string AccessToken { get; set; } = default!;

    public string RefreshToken { get; set; } = default!;

    public DateTime AccessTokenExpiresAt { get; set; }

    public DateTime RefreshTokenExpiresAt { get; set; }

    public IList<string> Roles { get; set; } = new List<string>();
}
