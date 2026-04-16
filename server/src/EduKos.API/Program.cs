using EduKos.Application.DependencyInjection;
using EduKos.Infrastructure.DependencyInjection;
using EduKos.Infrastructure.Seed;
using EduKos.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// OpenAPI (required for Scalar)
builder.Services.AddOpenApi();

// DI Layers
builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

// JWT Authentication
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Dev tools
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // exposes /openapi/v1.json

    app.MapScalarApiReference(options =>
    {
        options.Title = "EduKos API";
        options.Theme = ScalarTheme.Default;
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed roles
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<Microsoft.AspNetCore.Identity.RoleManager<ApplicationRole>>();

    await RoleSeeder.SeedRolesAsync(roleManager);
}

app.Run();