import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getProfile } from "../services/profileService";
import type { PlayerProfile } from "../types/PlayerProfile";

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

export function PlayerProfilePage() {
  const { profileId } = useParams();

  const [profile, setProfile] =
    useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(profileId);

    setProfile(null);
    setError(null);
    setIsNotFound(false);

    if (!profileId || !Number.isInteger(id) || id <= 0) {
      setIsLoading(false);
      setIsNotFound(true);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);

    getProfile(id)
      .then((data) => {
        if (isCancelled) {
          return;
        }

        if (data === null) {
          setIsNotFound(true);
          return;
        }

        setProfile(data);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        console.error(error);
        setError("Failed to load the player profile.");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [profileId]);

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
          </article>
        </>
      )}
    </section>
  );
}