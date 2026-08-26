import { useEffect, useState } from "react";
import type { PlayerProfile } from "./types/PlayerProfile";
import {
  createProfile,
  getProfiles,
} from "./services/profileService";

function App() {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    getProfiles()
      .then((data) => setProfiles(data))
      .catch((error) => console.error(error));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const newProfile = await createProfile({
        displayName,
        city,
      });

      setProfiles((currentProfiles) => [
        ...currentProfiles,
        newProfile,
      ]);

      setDisplayName("");
      setCity("");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main>
      <h1>TabletopMatch</h1>

      <h2>Create profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="displayName">Display name</label>

          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="city">City</label>

          <input
            id="city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>

        <button type="submit">Create profile</button>
      </form>

      <h2>Players</h2>
      {profiles.map((profile) => (
        <div key={profile.id}>
          <h3>{profile.displayName}</h3>
          <p>{profile.city}</p>
        </div>
      ))}
    </main>
  );
}

export default App;