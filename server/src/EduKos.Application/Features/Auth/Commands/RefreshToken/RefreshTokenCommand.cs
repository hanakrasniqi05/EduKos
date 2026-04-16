using EduKos.Application.DTOs.Auth;
using MediatR;

namespace EduKos.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<AuthResponseDto>
{
    public string RefreshToken { get; set; } = default!;
}