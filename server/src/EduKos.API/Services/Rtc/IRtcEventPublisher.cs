namespace EduKos.API.Services.Rtc;

public interface IRtcEventPublisher
{
    Task PublishAsync(string eventName, IEnumerable<int> recipientUserIds, object payload, CancellationToken cancellationToken);
}
