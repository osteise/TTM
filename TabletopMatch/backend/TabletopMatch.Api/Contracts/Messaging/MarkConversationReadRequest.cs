using System.ComponentModel.DataAnnotations;

namespace TabletopMatch.Api.Contracts.Messaging;

public class MarkConversationReadRequest
{
    [Range(1, long.MaxValue)]
    public long LastReadMessageId { get; set; }
}