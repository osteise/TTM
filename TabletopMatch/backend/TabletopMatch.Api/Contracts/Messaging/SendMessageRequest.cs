using System.ComponentModel.DataAnnotations;
using TabletopMatch.Api.Models;

namespace TabletopMatch.Api.Contracts.Messaging;

public class SendMessageRequest
{
    [Required]
    [MaxLength(Message.MaxContentLength)]
    public string Content { get; set; } = string.Empty;
}