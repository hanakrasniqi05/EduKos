using EduKos.Application.Interfaces.Auth;
using MediatR;

namespace EduKos.Application.Features.Roles.Commands.CreateRole;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand>
{
    private readonly IRoleService _roleService;

    public CreateRoleCommandHandler(IRoleService roleService)
    {
        _roleService = roleService;
    }

    public async Task Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        await _roleService.CreateRoleAsync(request.Role);
    }
}