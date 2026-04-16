using EduKos.Application.Interfaces.Auth;
using MediatR;

namespace EduKos.Application.Features.Roles.Commands.AssignRole;

public class AssignRoleCommandHandler : IRequestHandler<AssignRoleCommand>
{
    private readonly IRoleService _roleService;

    public AssignRoleCommandHandler(IRoleService roleService)
    {
        _roleService = roleService;
    }

    public async Task Handle(AssignRoleCommand request, CancellationToken cancellationToken)
    {
        await _roleService.AssignRoleAsync(request.UserId, request.Role);
    }
}