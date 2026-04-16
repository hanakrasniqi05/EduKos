using EduKos.Application.DTOs.Auth;
using MediatR;

namespace EduKos.Application.Features.Auth.Commands.Login;

public class LoginCommand : IRequest<AuthResponseDto>
{
    public string Email { get; set; } = default!;

    public string Password { get; set; } = default!;
}