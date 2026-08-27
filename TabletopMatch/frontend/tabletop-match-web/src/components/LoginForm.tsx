import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function LoginForm() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
        rememberMe,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="form-field checkbox-field">
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) =>
              setRememberMe(event.target.checked)
            }
          />
          Remember me
        </label>
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
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}