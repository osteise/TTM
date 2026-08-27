namespace TabletopMatch.Api.Models;

public class Message
{
    public const int MaxContentLength = 2000;

    public long Id { get; set; }

    public Guid ConversationId { get; set; }

    public string SenderId { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public Conversation Conversation { get; set; } = null!;

    public AppUser Sender { get; set; } = null!;
}