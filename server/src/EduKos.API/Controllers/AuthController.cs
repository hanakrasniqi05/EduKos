using EduKos.Application.DTOs.Auth;
using EduKos.Application.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduKos.API.Controllers;

public class AuthController(IAuthService authService) : ApiControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponseDto<LoginResponseDto>>> Register([FromBody] RegisterRequestDto dto)
    {
        var result = await authService.RegisterAsync(dto);
        return Ok(ApiResponseDto<LoginResponseDto>.Ok(result, "Registered successfully."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponseDto<LoginResponseDto>>> Login([FromBody] LoginRequestDto dto)
    {
        var result = await authService.LoginAsync(dto);
        return Ok(ApiResponseDto<LoginResponseDto>.Ok(result, "Login successful."));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponseDto<LoginResponseDto>>> Refresh([FromBody] RefreshTokenRequestDto dto)
    {
        var result = await authService.RefreshTokenAsync(dto);
        return Ok(ApiResponseDto<LoginResponseDto>.Ok(result, "Token refreshed."));
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<ActionResult<ApiResponseDto<object>>> Revoke([FromBody] string refreshToken)
    {
        await authService.RevokeTokenAsync(refreshToken, CurrentUserId);
        return Ok(ApiResponseDto<object>.Ok(null!, "Token revoked."));
    }
}