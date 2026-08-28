import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getProfile } from "../services/profileService";
import type { PlayerProfile } from "../types/PlayerProfile";
import { useAuth } from "../hooks/useAuth";

function formatMemberSince(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

type ProfileRequestState = {
  profileId: string | undefined;
  profile: PlayerProfile | null;
  status: "loading" | "success" | "not-found" | "error";
};

export function PlayerProfilePage() {
  const { profileId } = useParams();

  const { user } = useAuth();

  const id = Number(profileId);
  const hasValidProfileId =
    Boolean(profileId) && Number.isInteger(id) && id > 0;

  const [requestState, setRequestState] =
    useState<ProfileRequestState>({
      profileId,
      profile: null,
      status: "loading",
    });

  useEffect(() => {
    if (!hasValidProfileId) {
      return;
    }

    let isCancelled = false;

    getProfile(id)
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setRequestState({
          profileId,
          profile: data,
          status: data === null ? "not-found" : "success",
        });
      })
      .catch((requestError) => {
        if (isCancelled) {
          return;
        }

        console.error(requestError);

        setRequestState({
          profileId,
          profile: null,
          status: "error",
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [hasValidProfileId, id, profileId]);

  const isCurrentRequest =
    requestState.profileId === profileId;

  const status = !hasValidProfileId
    ? "not-found"
    : isCurrentRequest
      ? requestState.status
      : "loading";

  const profile =
    isCurrentRequest ? requestState.profile : null;

  const isLoading = status === "loading";
  const isNotFound = status === "not-found";
  const error =
    status === "error"
      ? "Failed to load the player profile."
      : null;

  return (
    <section>
      <Link className="back-link" to="/players">
        ← Back to players
      </Link>

      {isLoading && (
        <p
          className="status-message status-message--neutral loading-message"
          role="status"
        >
          Loading player profile...
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

      {!isLoading && isNotFound && (
        <div className="profile-state">
          <h1>Player not found</h1>
          <p>
            The requested player profile does not exist.
          </p>
        </div>
      )}

      {!isLoading && profile && (
        <>
          <div className="page-header">
            <h1>Player profile</h1>
            <p>Public information shared by this player.</p>
          </div>

          <article className="profile-summary">
            <header className="profile-summary__header">
              <div
                className="profile-avatar"
                aria-hidden="true"
              >
                {profile.displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>{profile.displayName}</h2>
                <p>{profile.city}</p>
              </div>
            </header>

            <dl className="profile-details">
              <div>
                <dt>City</dt>
                <dd>{profile.city}</dd>
              </div>

              <div>
                <dt>Member since</dt>
                <dd>
                  {formatMemberSince(profile.createdAt)}
                </dd>
              </div>

              <div className="profile-details__bio">
                <dt>Bio</dt>
                <dd>
                  {profile.bio || (
                    <span className="muted-text">
                      No bio added yet.
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            {user && profile.id !== user.profileId && (
              <div className="profile-summary__actions">
                <Link
                  className="button button--primary"
                  to={`/messages/new/${profile.id}`}
                >
                  Message player
                </Link>
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
}