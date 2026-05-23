using EduKos.Application.DTOs.Auth;
using MediatR;

namespace EduKos.Application.Features.Auth.Commands.Register;

public class RegisterCommand : IRequest<AuthResponseDto>
{
    public string Email { get; set; } = default!;

    public string Password { get; set; } = default!;

    public string ConfirmPassword { get; set; } = default!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? PhoneNumber { get; set; }

    public string Role { get; set; } = default!;

    public string? InstitutionName { get; set; }

    public int? InstitutionTypeId { get; set; }

    public string? City { get; set; }

    public string? Website { get; set; }
}
