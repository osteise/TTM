namespace TabletopMatch.Api.Contracts.Auth;

public class AuthResponse
{
    public string Email { get; set; } = string.Empty;

    public int ProfileId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string? Bio { get; set; }
}