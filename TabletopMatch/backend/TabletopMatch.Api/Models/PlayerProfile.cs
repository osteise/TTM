namespace TabletopMatch.Api.Models;

public class PlayerProfile
{
    public int Id { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string? Bio { get; set; }

    public string City { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}