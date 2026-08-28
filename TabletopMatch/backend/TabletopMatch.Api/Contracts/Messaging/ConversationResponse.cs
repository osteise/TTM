namespace TabletopMatch.Api.Contracts.Messaging;

public class ConversationResponse
{
    public Guid Id { get; set; }

    public string Type { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime LastActivityAt { get; set; }

    public int UnreadCount { get; set; }

    public IReadOnlyList<ConversationParticipantResponse> Participants
    { get; set; } = Array.Empty<ConversationParticipantResponse>();

    public MessageResponse? LastMessage { get; set; }
}