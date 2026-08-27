namespace TabletopMatch.Api.Contracts.Messaging;

public class ConversationParticipantResponse
{
    public int ProfileId { get; set; }

    public string DisplayName { get; set; } = string.Empty;
}