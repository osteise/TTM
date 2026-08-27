import { useEffect, useState } from "react";
import { getProfiles } from "../services/profileService";
import type { PlayerProfile } from "../types/PlayerProfile";

export function PlayersPage() {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfiles()
      .then((data) => {
        setProfiles(data);
        setError(null);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load players.");
      });
  }, []);

  return (
    <section>
      <h1>Players</h1>

      {error && <p role="alert">{error}</p>}

      {profiles.map((profile) => (
        <article key={profile.id}>
          <h2>{profile.displayName}</h2>
          <p>{profile.city}</p>
          {profile.bio && <p>{profile.bio}</p>}
        </article>
      ))}
    </section>
  );
}