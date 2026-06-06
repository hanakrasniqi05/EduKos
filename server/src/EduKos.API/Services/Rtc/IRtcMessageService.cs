using EduKos.Domain.Entities;

namespace EduKos.API.Services.Rtc;

public interface IRtcMessageService
{
    Task<IReadOnlyList<Message>> GetMessagesAsync(
        int userId,
        IReadOnlyCollection<string> roles,
        int conversationId,
        CancellationToken cancellationToken);

    Task<Message> SendMessageAsync(
        int userId,
        IReadOnlyCollection<string> roles,
        int conversationId,
        string body,
        CancellationToken cancellationToken);
}
