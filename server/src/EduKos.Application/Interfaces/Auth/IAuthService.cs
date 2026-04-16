namespace EduKos.Application.Interfaces.Auth;

using EduKos.Application.DTOs.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);

    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}