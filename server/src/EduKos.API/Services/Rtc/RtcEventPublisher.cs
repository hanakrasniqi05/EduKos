using System.Net.Http.Json;

namespace EduKos.API.Services.Rtc;

public sealed class RtcEventPublisher(HttpClient httpClient, IConfiguration configuration, ILogger<RtcEventPublisher> logger)
    : IRtcEventPublisher
{
    public async Task PublishAsync(
        string eventName,
        IEnumerable<int> recipientUserIds,
        object payload,
        CancellationToken cancellationToken)
    {
        var recipients = recipientUserIds.Distinct().ToArray();
        if (recipients.Length == 0)
            return;

        var secret = configuration["Rtc:InternalSecret"];
        using var request = new HttpRequestMessage(HttpMethod.Post, "internal/events")
        {
            Content = JsonContent.Create(new
            {
                eventName,
                recipientUserIds = recipients,
                payload
            })
        };

        request.Headers.Add("X-RTC-Internal-Secret", secret);

        try
        {
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
                logger.LogWarning("RTC event {EventName} returned {StatusCode}.", eventName, response.StatusCode);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "RTC event {EventName} could not be delivered.", eventName);
        }
    }
}
