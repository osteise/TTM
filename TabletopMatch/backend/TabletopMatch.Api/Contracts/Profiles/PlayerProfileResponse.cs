namespace TabletopMatch.Api.Contracts.Profiles;

public class PlayerProfileResponse
{
    public int Id { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string? Bio { get; set; }

    public string City { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}