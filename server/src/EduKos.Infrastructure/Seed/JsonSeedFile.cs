using System.Text.Json;

namespace EduKos.Infrastructure.Seed;

internal static class JsonSeedFile
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task<T> ReadAsync<T>(
        string filePath,
        CancellationToken cancellationToken)
        where T : new()
    {
        if (!File.Exists(filePath))
        {
            return new T();
        }

        await using var stream = File.OpenRead(filePath);
        return await JsonSerializer.DeserializeAsync<T>(
            stream,
            Options,
            cancellationToken) ?? new T();
    }
}
