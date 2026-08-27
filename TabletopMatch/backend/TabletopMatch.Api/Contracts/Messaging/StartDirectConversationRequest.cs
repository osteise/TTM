using System.ComponentModel.DataAnnotations;

namespace TabletopMatch.Api.Contracts.Messaging;

public class StartDirectConversationRequest
{
    [Range(1, int.MaxValue)]
    public int ParticipantProfileId { get; set; }
}