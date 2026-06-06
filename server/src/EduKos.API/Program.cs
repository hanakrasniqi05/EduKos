using EduKos.Application.DependencyInjection;
using EduKos.Infrastructure.DependencyInjection;
using EduKos.Infrastructure.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using EduKos.API.Services.DataManagement;
using EduKos.API.Services.Rtc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IDataManagementService, DataManagementService>();
builder.Services.AddScoped<IRtcConversationAccessPolicy, RtcConversationAccessPolicy>();
builder.Services.AddScoped<IRtcConversationService, RtcConversationService>();
builder.Services.AddScoped<IRtcMessageService, RtcMessageService>();
builder.Services.AddScoped<IRtcNotificationService, RtcNotificationService>();
builder.Services.AddScoped<IRtcAlertService, RtcAlertService>();
builder.Services.AddScoped<RtcExceptionFilter>();
builder.Services.AddHttpClient<IRtcEventPublisher, RtcEventPublisher>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Rtc:BaseUrl"] ?? "http://localhost:5060/");
    client.Timeout = TimeSpan.FromSeconds(2);
});

builder.Services.AddOpenApi();

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

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
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var uploadsRoot = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(Path.Combine(uploadsRoot, "uploads"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options.Title = "EduKos API";
        options.Theme = ScalarTheme.Default;
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot)
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await RoleSeeder.SeedRolesAsync(context);
    await DemoDataSeeder.SeedAsync(context);
}

app.Run();
