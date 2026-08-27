using TabletopMatch.Api.Contracts.Messaging;

namespace TabletopMatch.Api.Services.Messaging;

public interface IMessagingService
{
    Task<StartDirectConversationResult?>
        GetOrCreateDirectConversationAsync(
            string currentUserId,
            int participantProfileId,
            CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ConversationResponse>> GetConversationsAsync(
        string currentUserId,
        CancellationToken cancellationToken = default);

    Task<PagedMessagesResponse?> GetMessagesAsync(
        string currentUserId,
        Guid conversationId,
        long? beforeMessageId,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<MessageResponse?> SendMessageAsync(
        string currentUserId,
        Guid conversationId,
        string content,
        CancellationToken cancellationToken = default);
}