namespace EduKos.Application.Interfaces.Auth;

public interface ITokenService
{
    Task<string> GenerateAccessTokenAsync(string userId, string email, IList<string> roles);

    Task<string> GenerateRefreshTokenAsync();

    Task<bool> ValidateRefreshTokenAsync(string refreshToken);

    Task RevokeRefreshTokenAsync(string refreshToken);
}