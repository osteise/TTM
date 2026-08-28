import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getConversations } from "../services/messagingService";
import type { Conversation } from "../types/Messaging";

function formatActivityTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getConversationName(
  conversation: Conversation,
  currentProfileId: number,
) {
  const otherParticipants = conversation.participants.filter(
    (participant) =>
      participant.profileId !== currentProfileId,
  );

  if (otherParticipants.length === 0) {
    return "Conversation";
  }

  return otherParticipants
    .map((participant) => participant.displayName)
    .join(", ");
}

export function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadConversations() {
      try {
        const data = await getConversations();

        if (!isCancelled) {
          setConversations(data);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load conversations.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadConversations();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section className="messages-page">
      <div className="page-header">
        <h1>Messages</h1>
        <p>
          Continue conversations with other tabletop players.
        </p>
      </div>

      {isLoading && (
        <p
          className="status-message status-message--neutral loading-message"
          role="status"
        >
          Loading conversations...
        </p>
      )}

      {error && (
        <p
          className="status-message status-message--error"
          role="alert"
        >
          {error}
        </p>
      )}

      {!isLoading &&
        !error &&
        conversations.length === 0 && (
          <div className="messages-empty-state">
            <h2>No conversations yet</h2>
            <p>
              Visit a player profile to start a conversation.
            </p>
          </div>
        )}

      {!isLoading &&
        !error &&
        conversations.length > 0 &&
        user && (
          <ul className="conversation-list">
            {conversations.map((conversation) => {
              const conversationName = getConversationName(
                conversation,
                user.profileId,
              );

              const lastMessage = conversation.lastMessage;

              const senderLabel =
                lastMessage?.senderProfileId === user.profileId
                  ? "You"
                  : lastMessage?.senderDisplayName;

              return (
                <li
                  className="conversation-list__item"
                  key={conversation.id}
                >
                  <article className="conversation-summary">
                    <div
                      className="conversation-avatar"
                      aria-hidden="true"
                    >
                      {conversationName.charAt(0).toUpperCase()}
                    </div>

                    <div className="conversation-summary__content">
                      <div className="conversation-summary__header">
                        <h2>{conversationName}</h2>

                        <time
                          dateTime={conversation.lastActivityAt}
                        >
                          {formatActivityTime(
                            conversation.lastActivityAt,
                          )}
                        </time>
                      </div>

                      {lastMessage ? (
                        <p>
                          <strong>{senderLabel}:</strong>{" "}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="muted-text">
                          No messages sent yet.
                        </p>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
    </section>
  );
}