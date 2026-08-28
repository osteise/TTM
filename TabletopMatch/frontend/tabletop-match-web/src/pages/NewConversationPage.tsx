import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router";
import { useAuth } from "../hooks/useAuth";
import {
  getConversations,
  sendDirectMessage,
} from "../services/messagingService";
import { getProfile } from "../services/profileService";
import {
  MESSAGE_MAX_LENGTH,
} from "../types/Messaging";
import type { PlayerProfile } from "../types/PlayerProfile";

type NewConversationRequestState = {
  profileId: string | undefined;
  profile: PlayerProfile | null;
  status: "loading" | "success" | "not-found" | "error";
  error: string | null;
};

export function NewConversationPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const id = Number(profileId);
  const hasValidProfileId =
    Boolean(profileId) && Number.isInteger(id) && id > 0;

  const currentProfileId = user?.profileId;
  const isOwnProfile =
    currentProfileId !== undefined &&
    id === currentProfileId;

  const [requestState, setRequestState] =
    useState<NewConversationRequestState>({
      profileId,
      profile: null,
      status: "loading",
      error: null,
    });

  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (
      !hasValidProfileId ||
      currentProfileId === undefined ||
      isOwnProfile
    ) {
      return;
    }

    let isCancelled = false;

    async function loadDraft() {
      try {
        const [profile, conversations] = await Promise.all([
          getProfile(id),
          getConversations(),
        ]);

        if (isCancelled) {
          return;
        }

        if (profile === null) {
          setRequestState({
            profileId,
            profile: null,
            status: "not-found",
            error: null,
          });

          return;
        }

        const existingConversation = conversations.find(
          (conversation) =>
            conversation.type === "Direct" &&
            conversation.participants.some(
              (participant) =>
                participant.profileId === profile.id,
            ),
        );

        if (existingConversation) {
          navigate(
            `/messages/${existingConversation.id}`,
            { replace: true },
          );

          return;
        }

        setRequestState({
          profileId,
          profile,
          status: "success",
          error: null,
        });
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        setRequestState({
          profileId,
          profile: null,
          status: "error",
          error:
            requestError instanceof Error
              ? requestError.message
              : "Failed to prepare the conversation.",
        });
      }
    }

    void loadDraft();

    return () => {
      isCancelled = true;
    };
  }, [
    currentProfileId,
    hasValidProfileId,
    id,
    isOwnProfile,
    navigate,
    profileId,
  ]);

  const isCurrentRequest =
    requestState.profileId === profileId;

  const status =
    !hasValidProfileId || isOwnProfile
      ? "not-found"
      : isCurrentRequest
        ? requestState.status
        : "loading";

  const profile =
    isCurrentRequest ? requestState.profile : null;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!profile || isSending) {
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
      const message = await sendDirectMessage(
        profile.id,
        trimmedContent,
      );

      navigate(`/messages/${message.conversationId}`, {
        replace: true,
      });
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
      <Link
        className="back-link"
        to={hasValidProfileId
          ? `/players/${id}`
          : "/players"}
      >
        ← Back to player profile
      </Link>

      {status === "loading" && (
        <p
          className="status-message status-message--neutral loading-message"
          role="status"
        >
          Preparing conversation...
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
          <h1>
            {isOwnProfile
              ? "Conversation unavailable"
              : "Player not found"}
          </h1>
          <p>
            {isOwnProfile
              ? "You cannot start a conversation with yourself."
              : "The requested player profile does not exist."}
          </p>
        </div>
      )}

      {status === "success" && profile && (
        <>
          <div className="page-header conversation-header">
            <h1>{profile.displayName}</h1>
            <p>
              Send a message to start this conversation.
            </p>
          </div>

          <form
            className="message-composer"
            onSubmit={handleSubmit}
          >
            <label htmlFor="new-message-content">
              Message
            </label>

            <textarea
              id="new-message-content"
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
              placeholder="Write your first message..."
              required
            />

            <p className="muted-text">
              The conversation will be created when you send
              this message.
            </p>

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
                {isSending
                  ? "Sending..."
                  : "Send message"}
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
        </>
      )}
    </section>
  );
}