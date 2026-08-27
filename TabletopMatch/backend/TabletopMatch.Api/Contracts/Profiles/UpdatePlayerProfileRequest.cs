using System.ComponentModel.DataAnnotations;

namespace TabletopMatch.Api.Contracts.Profiles;

public class UpdatePlayerProfileRequest
{
    [Required]
    [MaxLength(50)]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Bio { get; set; }

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;
}