using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TabletopMatch.Api.Contracts.Messaging;
using TabletopMatch.Api.Services.Messaging;

namespace TabletopMatch.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/conversations")]
public class ConversationsController : ControllerBase
{
    private readonly IMessagingService _messagingService;

    public ConversationsController(
        IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    [HttpPost("direct/messages")]
    public async Task<ActionResult<MessageResponse>> SendDirectMessage(
        SendDirectMessageRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var message =
                await _messagingService.SendDirectMessageAsync(
                    currentUserId,
                    request.ParticipantProfileId,
                    request.Content,
                    cancellationToken);

            if (message is null)
            {
                return NotFound(new
                {
                    message = "The player profile was not found."
                });
            }

            return StatusCode(
                StatusCodes.Status201Created,
                message);
        }
        catch (MessagingValidationException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpGet]
    public async Task<
        ActionResult<IReadOnlyList<ConversationResponse>>>
        GetConversations(CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var conversations =
            await _messagingService.GetConversationsAsync(
                currentUserId,
                cancellationToken);

        return Ok(conversations);
    }

    [HttpGet("{conversationId:guid}/messages")]
    public async Task<ActionResult<PagedMessagesResponse>>
        GetMessages(
            Guid conversationId,
            [FromQuery] GetMessagesRequest request,
            CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result = await _messagingService.GetMessagesAsync(
                currentUserId,
                conversationId,
                request.BeforeMessageId,
                request.PageSize,
                cancellationToken);

            if (result is null)
            {
                return NotFound(new
                {
                    message = "The conversation was not found."
                });
            }

            return Ok(result);
        }
        catch (MessagingValidationException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPost("{conversationId:guid}/messages")]
    public async Task<ActionResult<MessageResponse>> SendMessage(
        Guid conversationId,
        SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var message = await _messagingService.SendMessageAsync(
                currentUserId,
                conversationId,
                request.Content,
                cancellationToken);

            if (message is null)
            {
                return NotFound(new
                {
                    message = "The conversation was not found."
                });
            }

            return StatusCode(
                StatusCodes.Status201Created,
                message);
        }
        catch (MessagingValidationException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}