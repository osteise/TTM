import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function EditProfileForm() {
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(
    user?.displayName ?? "",
  );
  const [city, setCity] = useState(user?.city ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user === null) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await updateProfile({
        displayName,
        city,
        bio: bio.trim() || null,
      });

      setSuccessMessage("Profile updated.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Edit profile</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="edit-display-name">
            Display name
          </label>
          <input
            id="edit-display-name"
            type="text"
            value={displayName}
            onChange={(event) =>
              setDisplayName(event.target.value)
            }
            maxLength={50}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-city">City</label>
          <input
            id="edit-city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={500}
          />
        </div>

        {error && <p role="alert">{error}</p>}
        {successMessage && <p>{successMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}