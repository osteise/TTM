namespace TabletopMatch.Api.Contracts.Messaging;

public class MessageResponse
{
    public long Id { get; set; }

    public Guid ConversationId { get; set; }

    public int SenderProfileId { get; set; }

    public string SenderDisplayName { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }
}