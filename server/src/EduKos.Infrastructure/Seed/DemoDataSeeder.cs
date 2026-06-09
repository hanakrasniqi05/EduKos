using EduKos.Infrastructure.Persistence;

namespace EduKos.Infrastructure.Seed;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        CancellationToken cancellationToken = default)
    {
        var dataDirectory = Path.Combine(AppContext.BaseDirectory, "Seed", "Data");
        if (!Directory.Exists(dataDirectory))
        {
            return;
        }

        await StudentDataSeeder.SeedAsync(
            context,
            Path.Combine(dataDirectory, "students.json"),
            cancellationToken);

        await InstitutionOwnerDataSeeder.SeedAsync(
            context,
            Path.Combine(dataDirectory, "institution-owners.json"),
            cancellationToken);

        await InstitutionDataSeeder.SeedAsync(
            context,
            Path.Combine(dataDirectory, "institutions.json"),
            cancellationToken);
    }
}
