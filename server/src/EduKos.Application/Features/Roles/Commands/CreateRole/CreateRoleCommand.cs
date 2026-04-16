using MediatR;

namespace EduKos.Application.Features.Roles.Commands.CreateRole;

public class CreateRoleCommand : IRequest
{
    public string Role { get; set; } = default!;
}