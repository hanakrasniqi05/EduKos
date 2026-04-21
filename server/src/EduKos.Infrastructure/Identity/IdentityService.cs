using EduKos.Application.DTOs.Auth;
using EduKos.Application.Interfaces.Auth;
using Microsoft.AspNetCore.Identity;

namespace EduKos.Infrastructure.Identity;

public class IdentityService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, request.Role);

        var roles = await _userManager.GetRolesAsync(user);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email!,
            AccessToken = await _tokenService.GenerateAccessTokenAsync(user.Id, user.Email!, roles),
            RefreshToken = await _tokenService.GenerateRefreshTokenAsync(),
            Roles = roles
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        throw new KeyNotFoundException("User does not exist");

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

        if (!result.Succeeded)
            throw new Exception("Invalid credentials");

        var roles = await _userManager.GetRolesAsync(user);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email!,
            AccessToken = await _tokenService.GenerateAccessTokenAsync(user.Id, user.Email!, roles),
            RefreshToken = await _tokenService.GenerateRefreshTokenAsync(),
            Roles = roles
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var isValid = await _tokenService.ValidateRefreshTokenAsync(refreshToken);

        if (!isValid)
            throw new Exception("Invalid refresh token");

        // In real system you'd resolve user from refresh token store
        throw new NotImplementedException("Refresh token user resolution comes later with persistence");
    }
}