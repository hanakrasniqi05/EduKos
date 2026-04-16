using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace EduKos.Application.DependencyInjection;

public static class ServiceRegistration
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // MediatR
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(assembly));

        // FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}