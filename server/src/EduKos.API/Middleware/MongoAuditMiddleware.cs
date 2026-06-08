using System.Diagnostics;
using System.Security.Claims;
using EduKos.API.Services.NoSql;

namespace EduKos.API.Middleware;

public sealed class MongoAuditMiddleware(
    RequestDelegate next,
    ILogger<MongoAuditMiddleware> logger)
{
    private static readonly HashSet<string> AuditedMethods =
        new(StringComparer.OrdinalIgnoreCase) { "POST", "PUT", "PATCH", "DELETE" };

    public async Task InvokeAsync(HttpContext context, INoSqlDataService noSqlDataService)
    {
        var stopwatch = Stopwatch.StartNew();
        var userId = GetUserId(context.User);

        try
        {
            await next(context);
            stopwatch.Stop();

            if (userId.HasValue && AuditedMethods.Contains(context.Request.Method))
                await SaveActivityAsync(context, noSqlDataService, userId.Value, stopwatch.ElapsedMilliseconds);

            if (context.Response.StatusCode >= StatusCodes.Status400BadRequest)
                await SaveHttpErrorAsync(context, noSqlDataService, userId, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception exception)
        {
            stopwatch.Stop();
            var metadata = CreateMetadata(context, stopwatch.ElapsedMilliseconds);
            metadata["statusCode"] = StatusCodes.Status500InternalServerError.ToString();

            await TryWriteAsync(
                () => noSqlDataService.AddLogAsync(
                    "Error",
                    exception.Message,
                    context.Request.Path,
                    userId,
                    metadata,
                    CancellationToken.None));
            throw;
        }
    }

    private Task SaveActivityAsync(
        HttpContext context,
        INoSqlDataService service,
        int userId,
        long elapsedMilliseconds) =>
        TryWriteAsync(() => service.AddActivityAsync(
            userId,
            context.Request.Method,
            context.Request.RouteValues["controller"]?.ToString(),
            context.Request.RouteValues["id"]?.ToString(),
            CreateMetadata(context, elapsedMilliseconds),
            CancellationToken.None));

    private Task SaveHttpErrorAsync(
        HttpContext context,
        INoSqlDataService service,
        int? userId,
        long elapsedMilliseconds) =>
        TryWriteAsync(() => service.AddLogAsync(
            "Warning",
            $"API request returned HTTP {context.Response.StatusCode}.",
            context.Request.Path,
            userId,
            CreateMetadata(context, elapsedMilliseconds),
            CancellationToken.None));

    private async Task TryWriteAsync(Func<Task> write)
    {
        try
        {
            await write();
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Mongo audit data could not be saved.");
        }
    }

    private static Dictionary<string, string> CreateMetadata(HttpContext context, long elapsedMilliseconds) =>
        new()
        {
            ["method"] = context.Request.Method,
            ["path"] = context.Request.Path,
            ["statusCode"] = context.Response.StatusCode.ToString(),
            ["durationMs"] = elapsedMilliseconds.ToString()
        };

    private static int? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var userId) ? userId : null;
    }
}
