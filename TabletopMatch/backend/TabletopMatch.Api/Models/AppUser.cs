using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace TabletopMatch.Api.Models;

public class AppUser : IdentityUser
{
    [JsonIgnore]
    public PlayerProfile PlayerProfile { get; set; } = null!;

    [JsonIgnore]
    public ICollection<ConversationParticipant> ConversationParticipants
    { get; set; } = new List<ConversationParticipant>();

    [JsonIgnore]
    public ICollection<Message> SentMessages { get; set; } =
        new List<Message>();
}