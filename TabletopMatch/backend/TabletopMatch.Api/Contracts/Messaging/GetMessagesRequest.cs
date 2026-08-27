using System.ComponentModel.DataAnnotations;

namespace TabletopMatch.Api.Contracts.Messaging;

public class GetMessagesRequest
{
    [Range(1, long.MaxValue)]
    public long? BeforeMessageId { get; set; }

    [Range(1, 100)]
    public int PageSize { get; set; } = 50;
}