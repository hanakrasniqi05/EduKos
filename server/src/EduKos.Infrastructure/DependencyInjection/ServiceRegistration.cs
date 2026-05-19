using EduKos.Application.Interfaces.Auth;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Identity;
using EduKos.Infrastructure.Persistence;
using EduKos.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EduKos.Infrastructure.DependencyInjection;

public static class ServiceRegistration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<PasswordHasher<User>>();
        services.AddScoped<IAuthService, IdentityService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IRoleService, RoleService>();

        return services;
    }
}
