import { useEffect, useState } from "react";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { EditProfileForm } from "./components/EditProfileForm";
import { useAuth } from "./hooks/useAuth";
import { getProfiles } from "./services/profileService";
import type { PlayerProfile } from "./types/PlayerProfile";

function App() {
  const { user, isLoading, logout } = useAuth();
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    getProfiles()
      .then((data) => {
        setProfiles(data);
        setProfileError(null);
      })
      .catch((error) => {
        console.error(error);
        setProfileError("Failed to load players.");
      });
  }, [user]);

  if (isLoading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>TabletopMatch</h1>

      {user ? (
        <section>
          <h2>Welcome, {user.displayName}</h2>
          <p>{user.email}</p>
          <p>{user.city}</p>
          {user.bio && <p>{user.bio}</p>}

          <EditProfileForm />

          <button type="button" onClick={() => void logout()}>
            Log out
          </button>
        </section>
      ) : (
        <>
          <LoginForm />
          <RegisterForm />
        </>
      )}

      <section>
        <h2>Players</h2>

        {profileError && <p role="alert">{profileError}</p>}

        {profiles.map((profile) => (
          <article key={profile.id}>
            <h3>{profile.displayName}</h3>
            <p>{profile.city}</p>
            {profile.bio && <p>{profile.bio}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;