import { Link, Navigate } from "react-router";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <p
        className="status-message status-message--neutral loading-message"
        role="status"
      >
        Checking your account...
      </p>
    );
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <section>
      <h1>Log in</h1>

      <div className="auth-panel">
        <LoginForm />

        <p className="auth-prompt">
          Don&apos;t have an account?{" "}
          <Link to="/register">Create one</Link>.
        </p>
      </div>
    </section>
  );
}