using EduKos.Application.DTOs.Auth;
using MediatR;

namespace EduKos.Application.Features.Auth.Commands.Register;

public class RegisterCommand : IRequest<AuthResponseDto>
{
    public string Email { get; set; } = default!;

    public string Password { get; set; } = default!;

    public string ConfirmPassword { get; set; } = default!;

    public string Role { get; set; } = default!;
}