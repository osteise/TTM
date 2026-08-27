namespace TabletopMatch.Api.Services.Messaging;

public class MessagingValidationException : Exception
{
    public MessagingValidationException(string message)
        : base(message)
    {
    }
}