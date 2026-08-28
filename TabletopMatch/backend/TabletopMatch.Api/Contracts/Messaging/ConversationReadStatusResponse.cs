namespace TabletopMatch.Api.Contracts.Messaging;

public class ConversationReadStatusResponse
{
    public Guid ConversationId { get; set; }

    public long LastReadMessageId { get; set; }

    public int UnreadCount { get; set; }
}