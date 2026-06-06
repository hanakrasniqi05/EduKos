using EduKos.Application.DTOs.Auth;
using EduKos.Domain.Entities;

namespace EduKos.API.Services.Rtc;

public interface IRtcAlertService
{
    Task PublishNewApplicationAsync(
        InstitutionApplication application,
        CancellationToken cancellationToken);

    Task UpdateApplicationStatusAsync(
        InstitutionApplication application,
        int changedByUserId,
        string status,
        CancellationToken cancellationToken);

    Task PublishInstitutionRegistrationAsync(
        AuthResponseDto authResponse,
        CancellationToken cancellationToken);

    Task PublishInstitutionAnnouncementAsync(
        InstitutionAnnouncement announcement,
        CancellationToken cancellationToken);
}
