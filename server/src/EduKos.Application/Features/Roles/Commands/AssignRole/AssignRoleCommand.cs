using MediatR;

namespace EduKos.Application.Features.Roles.Commands.AssignRole;

public class AssignRoleCommand : IRequest
{
    public string UserId { get; set; } = default!;

    public string Role { get; set; } = default!;
}