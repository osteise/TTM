import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function RegisterForm() {
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        email,
        password,
        displayName,
        city,
        bio: bio || undefined,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="nickname"
          maxLength={50}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-city">City</label>
        <input
          id="register-city"
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          autoComplete="address-level2"
          maxLength={100}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-bio">Bio</label>
        <textarea
          id="register-bio"
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

      <button
        className="button button--primary"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>
  );
}