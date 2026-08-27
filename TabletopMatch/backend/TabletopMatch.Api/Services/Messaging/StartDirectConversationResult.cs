using TabletopMatch.Api.Contracts.Messaging;

namespace TabletopMatch.Api.Services.Messaging;

public class StartDirectConversationResult
{
    public ConversationResponse Conversation { get; set; } = null!;

    public bool WasCreated { get; set; }
}