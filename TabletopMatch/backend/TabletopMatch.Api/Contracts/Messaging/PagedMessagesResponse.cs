namespace TabletopMatch.Api.Contracts.Messaging;

public class PagedMessagesResponse
{
    public IReadOnlyList<MessageResponse> Items { get; set; } =
        Array.Empty<MessageResponse>();

    public long? NextCursor { get; set; }

    public bool HasMore { get; set; }
}