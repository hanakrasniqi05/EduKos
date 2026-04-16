using EduKos.Application.DTOs.Auth;
using EduKos.Application.Interfaces.Auth;
using MediatR;

namespace EduKos.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var dto = new LoginRequestDto
        {
            Email = request.Email,
            Password = request.Password
        };

        return await _authService.LoginAsync(dto, cancellationToken);
    }
}