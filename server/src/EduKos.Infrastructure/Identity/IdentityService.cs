using EduKos.Application.DTOs.Auth;
using EduKos.Application.Interfaces.Auth;
using EduKos.Domain.Constants;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace EduKos.Infrastructure.Identity;

public class IdentityService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly int _refreshTokenDays;
    private readonly int _accessTokenMinutes;

    public IdentityService(
        AppDbContext context,
        PasswordHasher<User> passwordHasher,
        ITokenService tokenService,
        Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokenDays = int.TryParse(configuration["Jwt:RefreshTokenDays"], out var days) ? days : 7;
        _accessTokenMinutes = int.TryParse(configuration["Jwt:AccessTokenMinutes"], out var minutes) ? minutes : 60;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        if (!string.Equals(request.Password, request.ConfirmPassword, StringComparison.Ordinal))
            throw new InvalidOperationException("Password confirmation does not match.");

        if (await _context.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
            throw new InvalidOperationException("A user with this email already exists.");

        var roleName = AppRoles.AllRoles.Contains(request.Role) && request.Role != AppRoles.Admin
            ? request.Role
            : AppRoles.Nxenes;

        var role = await _context.Roles.FirstOrDefaultAsync(x => x.Name == roleName, cancellationToken)
            ?? throw new InvalidOperationException($"Role '{roleName}' is not configured.");

        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            IsActive = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        user.UserRoles.Add(new UserRole { RoleId = role.RoleId });

        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (roleName == AppRoles.Shkolla && !string.IsNullOrWhiteSpace(request.InstitutionName) && request.InstitutionTypeId.HasValue)
        {
            await _context.Institutions.AddAsync(new Institution
            {
                InstitutionTypeId = request.InstitutionTypeId.Value,
                OwnerUserId = user.UserId,
                Name = request.InstitutionName.Trim(),
                City = request.City?.Trim(),
                Website = request.Website?.Trim(),
                Email = user.Email,
                Phone = user.PhoneNumber,
                IsApproved = false
            }, cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);
        }

        return await BuildAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);

        if (user == null)
            throw new KeyNotFoundException("User does not exist");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("User account is inactive.");

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
            throw new Exception("Invalid credentials");

        return await BuildAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var refreshTokenHash = _tokenService.HashRefreshToken(refreshToken);
        var token = await _context.RefreshTokens
            .Include(x => x.User)
            .ThenInclude(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Token == refreshTokenHash, cancellationToken);

        if (token == null || token.RevokedAt != null || token.ExpiresAt <= DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        if (!token.User.IsActive)
            throw new UnauthorizedAccessException("User account is inactive.");

        token.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await BuildAuthResponseAsync(token.User, cancellationToken);
    }

    public async Task RevokeTokenAsync(string refreshToken, int userId, CancellationToken cancellationToken = default)
    {
        var refreshTokenHash = _tokenService.HashRefreshToken(refreshToken);
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == refreshTokenHash && x.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Refresh token not found.");

        token.RevokedAt ??= DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(User user, CancellationToken cancellationToken)
    {
    var roles = user.UserRoles.Select(x => x.Role.Name).ToList();
    if (roles.Count == 0)
    {
        roles = await _context.UserRoles
            .Where(x => x.UserId == user.UserId)
            .Select(x => x.Role.Name)
            .ToListAsync(cancellationToken);
    }
    var institution = await _context.Institutions
        .Where(x => x.OwnerUserId == user.UserId)
        .Select(x => new
        {
            x.IsApproved
        })
        .FirstOrDefaultAsync(cancellationToken);

    var isInstitutionUser = roles.Contains(AppRoles.Shkolla);
    bool institutionExists = institution != null;
    bool institutionIsApproved = institution?.IsApproved ?? false;
    bool institutionIsDeleted = isInstitutionUser && !institutionExists;

    var refreshTokenValue = await _tokenService.GenerateRefreshTokenAsync();
    var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenDays);

    _context.RefreshTokens.Add(new EduKos.Domain.Entities.RefreshToken
    {
        UserId = user.UserId,
        Token = _tokenService.HashRefreshToken(refreshTokenValue),
        ExpiresAt = refreshTokenExpiresAt
    });

    await _context.SaveChangesAsync(cancellationToken);

    return new AuthResponseDto
    {
        UserId = user.UserId.ToString(),
        Email = user.Email,
        AccessToken = await _tokenService.GenerateAccessTokenAsync(
            user.UserId.ToString(),
            user.Email,
            roles
        ),
        RefreshToken = refreshTokenValue,
        AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_accessTokenMinutes),
        RefreshTokenExpiresAt = refreshTokenExpiresAt,
        Roles = roles,
        InstitutionExists = institutionExists,
        InstitutionIsApproved = institutionIsApproved,
        InstitutionIsDeleted = institutionIsDeleted
    };
}
}
