using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TabletopMatch.Api.Contracts.Messaging;
using TabletopMatch.Api.Data;
using TabletopMatch.Api.Models;

namespace TabletopMatch.Api.Services.Messaging;

public class MessagingService : IMessagingService
{
    private const string DirectConversationKeyIndexName =
        "IX_Conversations_DirectConversationKey";

    private readonly AppDbContext _context;
    private readonly TimeProvider _timeProvider;

    public MessagingService(
        AppDbContext context,
        TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;
    }

    private async Task<ConversationResponse?>
        GetOrCreateDirectConversationAsync(
            string currentUserId,
            int participantProfileId,
            CancellationToken cancellationToken = default)
    {
        var participant = await _context.PlayerProfiles
            .AsNoTracking()
            .Where(profile => profile.Id == participantProfileId)
            .Select(profile => new
            {
                profile.UserId
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (participant is null)
        {
            return null;
        }

        if (string.Equals(
                currentUserId,
                participant.UserId,
                StringComparison.Ordinal))
        {
            throw new MessagingValidationException(
                "You cannot start a conversation with yourself.");
        }

        var directConversationKey = CreateDirectConversationKey(
            currentUserId,
            participant.UserId);

        var existingConversation = await LoadConversationByKeyAsync(
            currentUserId,
            directConversationKey,
            cancellationToken);

        if (existingConversation is not null)
        {
            return CreateConversationResponse(existingConversation);
        }

        var utcNow = GetUtcNow();

        var conversation = new Conversation
        {
            Type = ConversationType.Direct,
            DirectConversationKey = directConversationKey,
            CreatedAt = utcNow,
            LastActivityAt = utcNow
        };

        conversation.Participants.Add(new ConversationParticipant
        {
            UserId = currentUserId,
            JoinedAt = utcNow
        });

        conversation.Participants.Add(new ConversationParticipant
        {
            UserId = participant.UserId,
            JoinedAt = utcNow
        });

        _context.Conversations.Add(conversation);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (IsDirectConversationConflict(exception))
        {
            // Another request may have created the same direct
            // conversation after the initial lookup.
            _context.ChangeTracker.Clear();

            existingConversation = await LoadConversationByKeyAsync(
                currentUserId,
                directConversationKey,
                cancellationToken);

            if (existingConversation is null)
            {
                throw;
            }

            return CreateConversationResponse(existingConversation);
        }

        var createdConversation = await LoadConversationByKeyAsync(
            currentUserId,
            directConversationKey,
            cancellationToken);

        if (createdConversation is null)
        {
            throw new InvalidOperationException(
                "The conversation could not be loaded after creation.");
        }

        return CreateConversationResponse(createdConversation);
    }

    public async Task<MessageResponse?> SendDirectMessageAsync(
    string currentUserId,
    int participantProfileId,
    string content,
    CancellationToken cancellationToken = default)
    {
        var trimmedContent = ValidateMessageContent(content);

        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                cancellationToken);

        var conversation =
            await GetOrCreateDirectConversationAsync(
                currentUserId,
                participantProfileId,
                cancellationToken);

        if (conversation is null)
        {
            return null;
        }

        var message = await SendMessageAsync(
            currentUserId,
            conversation.Id,
            trimmedContent,
            cancellationToken);

        if (message is null)
        {
            throw new InvalidOperationException(
                "The direct conversation could not be loaded.");
        }

        await transaction.CommitAsync(cancellationToken);

        return message;
    }

    public async Task<IReadOnlyList<ConversationResponse>>
        GetConversationsAsync(
            string currentUserId,
            CancellationToken cancellationToken = default)
    {
        var conversations = await CreateConversationQuery(currentUserId)
            .Where(conversation => conversation.Messages.Any())
            .OrderByDescending(conversation =>
                conversation.LastActivityAt)
            .ToListAsync(cancellationToken);

        return conversations
            .Select(CreateConversationResponse)
            .ToList();
    }

    public async Task<PagedMessagesResponse?> GetMessagesAsync(
        string currentUserId,
        Guid conversationId,
        long? beforeMessageId,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        ValidatePagination(beforeMessageId, pageSize);

        var isParticipant = await _context.ConversationParticipants
            .AsNoTracking()
            .AnyAsync(
                participant =>
                    participant.ConversationId == conversationId &&
                    participant.UserId == currentUserId,
                cancellationToken);

        if (!isParticipant)
        {
            return null;
        }

        var query = _context.Messages
            .AsNoTracking()
            .Where(message =>
                message.ConversationId == conversationId)
            .Include(message => message.Sender)
                .ThenInclude(user => user.PlayerProfile)
            .AsQueryable();

        if (beforeMessageId.HasValue)
        {
            query = query.Where(message =>
                message.Id < beforeMessageId.Value);
        }

        var messages = await query
            .OrderByDescending(message => message.Id)
            .Take(pageSize + 1)
            .ToListAsync(cancellationToken);

        var hasMore = messages.Count > pageSize;

        if (hasMore)
        {
            messages.RemoveAt(pageSize);
        }

        long? nextCursor = hasMore && messages.Count > 0
            ? messages[^1].Id
            : null;

        // The database query retrieves the newest messages first.
        // Return the selected page in chronological order for the UI.
        messages.Reverse();

        return new PagedMessagesResponse
        {
            Items = messages
                .Select(CreateMessageResponse)
                .ToList(),
            NextCursor = nextCursor,
            HasMore = hasMore
        };
    }

    public async Task<MessageResponse?> SendMessageAsync(
        string currentUserId,
        Guid conversationId,
        string content,
        CancellationToken cancellationToken = default)
    {

        var trimmedContent = ValidateMessageContent(content);

        var conversation = await _context.Conversations
            .SingleOrDefaultAsync(
                item =>
                    item.Id == conversationId &&
                    item.Participants.Any(participant =>
                        participant.UserId == currentUserId),
                cancellationToken);

        if (conversation is null)
        {
            return null;
        }

        var senderProfile = await _context.PlayerProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(
                profile => profile.UserId == currentUserId,
                cancellationToken);

        if (senderProfile is null)
        {
            throw new InvalidOperationException(
                "The authenticated account does not have a player profile.");
        }

        var utcNow = GetUtcNow();

        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = currentUserId,
            Content = trimmedContent,
            SentAt = utcNow
        };

        conversation.LastActivityAt = utcNow;

        _context.Messages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        return new MessageResponse
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderProfileId = senderProfile.Id,
            SenderDisplayName = senderProfile.DisplayName,
            Content = message.Content,
            SentAt = message.SentAt
        };
    }

    private IQueryable<Conversation> CreateConversationQuery(
        string currentUserId)
    {
        return _context.Conversations
            .AsNoTracking()
            .Where(conversation =>
                conversation.Participants.Any(participant =>
                    participant.UserId == currentUserId))
            .Include(conversation => conversation.Participants)
                .ThenInclude(participant => participant.User)
                    .ThenInclude(user => user.PlayerProfile)
            .Include(conversation => conversation.Messages
                .OrderByDescending(message => message.Id)
                .Take(1))
                .ThenInclude(message => message.Sender)
                    .ThenInclude(user => user.PlayerProfile)
            .AsSplitQuery();
    }

    private Task<Conversation?> LoadConversationByKeyAsync(
        string currentUserId,
        string directConversationKey,
        CancellationToken cancellationToken)
    {
        return CreateConversationQuery(currentUserId)
            .SingleOrDefaultAsync(
                conversation =>
                    conversation.DirectConversationKey ==
                    directConversationKey,
                cancellationToken);
    }

    private static ConversationResponse CreateConversationResponse(
        Conversation conversation)
    {
        var lastMessage = conversation.Messages
            .OrderByDescending(message => message.Id)
            .FirstOrDefault();

        return new ConversationResponse
        {
            Id = conversation.Id,
            Type = conversation.Type.ToString(),
            CreatedAt = conversation.CreatedAt,
            LastActivityAt = conversation.LastActivityAt,
            Participants = conversation.Participants
                .Select(participant =>
                    new ConversationParticipantResponse
                    {
                        ProfileId =
                            participant.User.PlayerProfile.Id,
                        DisplayName =
                            participant.User.PlayerProfile.DisplayName
                    })
                .ToList(),
            LastMessage = lastMessage is null
                ? null
                : CreateMessageResponse(lastMessage)
        };
    }

    private static MessageResponse CreateMessageResponse(Message message)
    {
        return new MessageResponse
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderProfileId = message.Sender.PlayerProfile.Id,
            SenderDisplayName =
                message.Sender.PlayerProfile.DisplayName,
            Content = message.Content,
            SentAt = message.SentAt
        };
    }

    private static string CreateDirectConversationKey(
        string firstUserId,
        string secondUserId)
    {
        var first = string.CompareOrdinal(
                firstUserId,
                secondUserId) < 0
            ? firstUserId
            : secondUserId;

        var second = string.Equals(
                first,
                firstUserId,
                StringComparison.Ordinal)
            ? secondUserId
            : firstUserId;

        var keySource =
            $"{first.Length}:{first}{second.Length}:{second}";

        var hash = SHA256.HashData(
            Encoding.UTF8.GetBytes(keySource));

        return Convert.ToHexString(hash);
    }

    private static bool IsDirectConversationConflict(
        DbUpdateException exception)
    {
        return exception.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation,
            ConstraintName: DirectConversationKeyIndexName
        };
    }

    private static string ValidateMessageContent(string? content)
    {
        var trimmedContent = content?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(trimmedContent))
        {
            throw new MessagingValidationException(
                "Message content is required.");
        }

        if (trimmedContent.Length > Message.MaxContentLength)
        {
            throw new MessagingValidationException(
                $"Message content cannot exceed " +
                $"{Message.MaxContentLength} characters.");
        }

        return trimmedContent;
    }

    private static void ValidatePagination(
        long? beforeMessageId,
        int pageSize)
    {
        if (beforeMessageId <= 0)
        {
            throw new MessagingValidationException(
                "The message cursor must be greater than zero.");
        }

        if (pageSize is < 1 or > 100)
        {
            throw new MessagingValidationException(
                "Page size must be between 1 and 100.");
        }
    }

    private DateTime GetUtcNow()
    {
        return _timeProvider.GetUtcNow().UtcDateTime;
    }
}