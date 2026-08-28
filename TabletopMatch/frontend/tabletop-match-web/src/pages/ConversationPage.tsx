import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../services/messagingService";
import type {
  Conversation,
  ConversationMessage,
} from "../types/Messaging";
import type { FormEvent } from "react";
import { MESSAGE_MAX_LENGTH } from "../types/Messaging";

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatMessageTime(value: string) {
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

type ConversationRequestState = {
  conversationId: string | undefined;
  conversation: Conversation | null;
  messages: ConversationMessage[];
  nextCursor: number | null;
  hasMore: boolean;
  status: "loading" | "success" | "not-found" | "error";
  error: string | null;
};

export function ConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();

  const hasValidConversationId =
    typeof conversationId === "string" &&
    guidPattern.test(conversationId);

  const [requestState, setRequestState] =
    useState<ConversationRequestState>({
      conversationId,
      conversation: null,
      messages: [],
      nextCursor: null,
      hasMore: false,
      status: "loading",
      error: null,
    });

  const [isLoadingOlder, setIsLoadingOlder] =
    useState(false);

  const [historyError, setHistoryError] = useState<
    string | null
  >(null);

  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!hasValidConversationId || !conversationId) {
      return;
    }

    let isCancelled = false;

    async function loadConversation(
      currentConversationId: string,
    ) {
      try {
        const [conversations, messagePage] =
          await Promise.all([
            getConversations(),
            getMessages(currentConversationId),
          ]);

        if (isCancelled) {
          return;
        }

        const conversation =
          conversations.find(
            (item) => item.id === currentConversationId,
          ) ?? null;

        if (conversation === null) {
          setRequestState({
            conversationId: currentConversationId,
            conversation: null,
            messages: [],
            nextCursor: null,
            hasMore: false,
            status: "not-found",
            error: null,
          });

          return;
        }

        setRequestState({
          conversationId: currentConversationId,
          conversation,
          messages: messagePage.items,
          nextCursor: messagePage.nextCursor,
          hasMore: messagePage.hasMore,
          status: "success",
          error: null,
        });
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        setRequestState({
          conversationId: currentConversationId,
          conversation: null,
          messages: [],
          nextCursor: null,
          hasMore: false,
          status: "error",
          error:
            requestError instanceof Error
              ? requestError.message
              : "Failed to load the conversation.",
        });
      }
    }

    void loadConversation(conversationId);

    return () => {
      isCancelled = true;
    };
  }, [conversationId, hasValidConversationId]);

  const isCurrentRequest =
    requestState.conversationId === conversationId;

  const status = !hasValidConversationId
    ? "not-found"
    : isCurrentRequest
      ? requestState.status
      : "loading";

  const conversation =
    isCurrentRequest ? requestState.conversation : null;

  const messages = isCurrentRequest
    ? requestState.messages
    : [];

  const nextCursor = isCurrentRequest
    ? requestState.nextCursor
    : null;

  const hasMore =
    isCurrentRequest && requestState.hasMore;

  async function loadOlderMessages() {
    if (
      !conversationId ||
      nextCursor === null ||
      isLoadingOlder
    ) {
      return;
    }

    setIsLoadingOlder(true);
    setHistoryError(null);

    try {
      const page = await getMessages(
        conversationId,
        nextCursor,
      );

      setRequestState((currentState) => {
        if (
          currentState.conversationId !== conversationId
        ) {
          return currentState;
        }

        const existingIds = new Set(
          currentState.messages.map((message) => message.id),
        );

        const olderMessages = page.items.filter(
          (message) => !existingIds.has(message.id),
        );

        return {
          ...currentState,
          messages: [
            ...olderMessages,
            ...currentState.messages,
          ],
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
        };
      });
    } catch (requestError) {
      setHistoryError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load older messages.",
      );
    } finally {
      setIsLoadingOlder(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!conversationId || isSending) {
      return;
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      setSendError("Message content is required.");
      return;
    }

    if (trimmedContent.length > MESSAGE_MAX_LENGTH) {
      setSendError(
        `Message content cannot exceed ${MESSAGE_MAX_LENGTH} characters.`,
      );
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const createdMessage = await sendMessage(
        conversationId,
        trimmedContent,
      );

      setRequestState((currentState) => {
        if (
          currentState.conversationId !== conversationId
        ) {
          return currentState;
        }

        const messageAlreadyExists =
          currentState.messages.some(
            (message) => message.id === createdMessage.id,
          );

        if (messageAlreadyExists) {
          return currentState;
        }

        return {
          ...currentState,
          messages: [
            ...currentState.messages,
            createdMessage,
          ],
          conversation: currentState.conversation
            ? {
              ...currentState.conversation,
              lastMessage: createdMessage,
              lastActivityAt: createdMessage.sentAt,
            }
            : null,
        };
      });

      setContent("");
    } catch (requestError) {
      setSendError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to send the message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="conversation-page">
      <Link className="back-link" to="/messages">
        ← Back to messages
      </Link>

      {status === "loading" && (
        <p
          className="status-message status-message--neutral loading-message"
          role="status"
        >
          Loading conversation...
        </p>
      )}

      {status === "error" && (
        <p
          className="status-message status-message--error"
          role="alert"
        >
          {requestState.error}
        </p>
      )}

      {status === "not-found" && (
        <div className="profile-state">
          <h1>Conversation not found</h1>
          <p>
            The conversation does not exist or you cannot
            access it.
          </p>
        </div>
      )}

      {status === "success" && conversation && user && (
        <>
          <div className="page-header conversation-header">
            <h1>
              {getConversationName(
                conversation,
                user.profileId,
              )}
            </h1>
            <p>Direct conversation</p>
          </div>

          {hasMore && (
            <div className="message-history-actions">
              <button
                className="button button--secondary"
                type="button"
                disabled={isLoadingOlder}
                onClick={() => void loadOlderMessages()}
              >
                {isLoadingOlder
                  ? "Loading..."
                  : "Load older messages"}
              </button>
            </div>
          )}

          {historyError && (
            <p
              className="status-message status-message--error"
              role="alert"
            >
              {historyError}
            </p>
          )}

          {messages.length === 0 ? (
            <div className="messages-empty-state">
              <h2>No messages yet</h2>
              <p>Send the first message to get started.</p>
            </div>
          ) : (
            <ol className="message-list">
              {messages.map((message) => {
                const isOwnMessage =
                  message.senderProfileId === user.profileId;

                <form
                  className="message-composer"
                  onSubmit={handleSubmit}
                >
                  <label htmlFor="message-content">
                    Message
                  </label>

                  <textarea
                    id="message-content"
                    name="content"
                    rows={4}
                    maxLength={MESSAGE_MAX_LENGTH}
                    value={content}
                    disabled={isSending}
                    onChange={(event) => {
                      setContent(event.target.value);

                      if (sendError) {
                        setSendError(null);
                      }
                    }}
                    placeholder="Write a message..."
                    required
                  />

                  <div className="message-composer__footer">
                    <span
                      className="message-character-count"
                      aria-live="polite"
                    >
                      {content.length} / {MESSAGE_MAX_LENGTH}
                    </span>

                    <button
                      className="button button--primary"
                      type="submit"
                      disabled={
                        isSending || content.trim().length === 0
                      }
                    >
                      {isSending ? "Sending..." : "Send message"}
                    </button>
                  </div>

                  {sendError && (
                    <p
                      className="status-message status-message--error"
                      role="alert"
                    >
                      {sendError}
                    </p>
                  )}
                </form>

                return (
                  <li
                    className={
                      isOwnMessage
                        ? "message-list__item message-list__item--own"
                        : "message-list__item"
                    }
                    key={message.id}
                  >
                    <article className="message-bubble">
                      <header className="message-bubble__header">
                        <strong>
                          {isOwnMessage
                            ? "You"
                            : message.senderDisplayName}
                        </strong>

                        <time dateTime={message.sentAt}>
                          {formatMessageTime(message.sentAt)}
                        </time>
                      </header>

                      <p>{message.content}</p>
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </section>
  );
}