using System.ComponentModel.DataAnnotations;
using TabletopMatch.Api.Models;

namespace TabletopMatch.Api.Contracts.Messaging;

public class SendDirectMessageRequest
{
    [Range(1, int.MaxValue)]
    public int ParticipantProfileId { get; set; }

    [Required]
    [MaxLength(Message.MaxContentLength)]
    public string Content { get; set; } = string.Empty;
}