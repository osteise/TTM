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
    <section className="profile-edit-section">
      <h2>Edit profile</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
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
            autoComplete="nickname"
            maxLength={50}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="edit-city">City</label>
          <input
            id="edit-city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            autoComplete="address-level2"
            maxLength={100}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={500}
          />
        </div>

        {error && (
          <p
            className="status-message status-message--error"
            role="alert"
          >
            {error}
          </p>
        )}

        {successMessage && (
          <p
            className="status-message status-message--success"
            role="status"
          >
            {successMessage}
          </p>
        )}

        <button
          className="button button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}