namespace TabletopMatch.Api.Models;

public class ConversationParticipant
{
    public Guid ConversationId { get; set; }

    public string UserId { get; set; } = string.Empty;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public long? LastReadMessageId { get; set; }

    public Conversation Conversation { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}