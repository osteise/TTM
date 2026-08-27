using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace TabletopMatch.Api.Models;

public class AppUser : IdentityUser
{
    [JsonIgnore]
    public PlayerProfile PlayerProfile { get; set; } = null!;
}