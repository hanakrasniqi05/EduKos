using EduKos.API.Extensions;
using EduKos.API.Services.Rtc;
using EduKos.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduKos.API.Controllers.Rtc;

[ApiController]
[Route("api/rtc/conversations")]
[Authorize]
[ServiceFilter(typeof(RtcExceptionFilter))]
public sealed class RtcConversationsController(
    IRtcConversationService conversationService,
    IRtcMessageService messageService,
    IRtcConversationAccessPolicy accessPolicy,
    IRtcEventPublisher eventPublisher) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Nxenes")]
    public async Task<ActionResult<RtcConversationDto>> OpenInstitutionConversation(
        [FromBody] CreateInstitutionConversationRequest request,
        CancellationToken cancellationToken)
    {
        var conversation = await conversationService.OpenInstitutionConversationAsync(
            User.GetRequiredUserId(),
            request.InstitutionId,
            cancellationToken);

        return Ok(conversation.ToDto());
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Shkolla")]
    public async Task<ActionResult<RtcConversationDto>> OpenAdminConversation(
        CancellationToken cancellationToken)
    {
        var conversation = await conversationService.OpenAdminConversationAsync(
            User.GetRequiredUserId(),
            cancellationToken);

        return Ok(conversation.ToDto());
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RtcConversationDto>>> GetConversations(
        CancellationToken cancellationToken)
    {
        var conversations = await conversationService.GetConversationsAsync(
            User.GetRequiredUserId(),
            User.GetRoles(),
            cancellationToken);

        return Ok(conversations.Select(RtcDtoMapper.ToDto));
    }

    [HttpGet("{conversationId:int}/messages")]
    public async Task<ActionResult<IEnumerable<RtcMessageDto>>> GetMessages(
        int conversationId,
        CancellationToken cancellationToken)
    {
        var messages = await messageService.GetMessagesAsync(
            User.GetRequiredUserId(),
            User.GetRoles(),
            conversationId,
            cancellationToken);

        return Ok(messages.Select(RtcDtoMapper.ToDto));
    }

    [HttpPost("{conversationId:int}/messages")]
    public async Task<ActionResult<RtcMessageDto>> SendMessage(
        int conversationId,
        [FromBody] SendRtcMessageRequest request,
        CancellationToken cancellationToken)
    {
        var message = await messageService.SendMessageAsync(
            User.GetRequiredUserId(),
            User.GetRoles(),
            conversationId,
            request.Body,
            cancellationToken);

        var dto = message.ToDto();
        var recipients = await conversationService.GetParticipantUserIdsAsync(
            conversationId,
            cancellationToken);
        await eventPublisher.PublishAsync(
            RtcEventNames.ReceiveMessage,
            recipients,
            dto,
            cancellationToken);

        return Ok(dto);
    }

    [HttpGet("{conversationId:int}/access")]
    public async Task<IActionResult> CheckAccess(
        int conversationId,
        CancellationToken cancellationToken)
    {
        await accessPolicy.GetAccessibleConversationAsync(
            User.GetRequiredUserId(),
            User.GetRoles(),
            conversationId,
            tracked: false,
            cancellationToken);

        return NoContent();
    }
}
