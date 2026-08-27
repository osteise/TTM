namespace TabletopMatch.Api.Models;

public class Conversation
{
    public const int DirectConversationKeyMaxLength = 64;

    public Guid Id { get; set; } = Guid.NewGuid();

    public ConversationType Type { get; set; }

    public string? DirectConversationKey { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

    public ICollection<ConversationParticipant> Participants { get; set; } =
        new List<ConversationParticipant>();

    public ICollection<Message> Messages { get; set; } =
        new List<Message>();
}