import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getProfiles } from "../services/profileService";
import type { PlayerProfile } from "../types/PlayerProfile";

export function PlayersPage() {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    getProfiles()
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setProfiles(data);
        setError(null);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        console.error(error);
        setError("Failed to load players.");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="page-header">
        <h1>Players</h1>
        <p>Find tabletop players in the community.</p>
      </div>

      {isLoading && (
        <p
          className="status-message status-message--neutral"
          role="status"
        >
          Loading players...
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

      {!isLoading && !error && profiles.length === 0 && (
        <p className="empty-state">
          No player profiles have been created yet.
        </p>
      )}

      {!isLoading && !error && profiles.length > 0 && (
        <div className="profile-grid">
          {profiles.map((profile) => (
            <article className="profile-card" key={profile.id}>
              <Link
                className="profile-card__link"
                to={`/players/${profile.id}`}
                aria-label={`View profile for ${profile.displayName}`}
              >
                <header className="profile-card__header">
                  <div
                    className="profile-avatar"
                    aria-hidden="true"
                  >
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2>{profile.displayName}</h2>
                    <p className="profile-card__location">
                      {profile.city}
                    </p>
                  </div>
                </header>

                {profile.bio ? (
                  <p className="profile-card__bio">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="profile-card__bio profile-card__bio--empty">
                    No bio added yet.
                  </p>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}