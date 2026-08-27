import { Link, Navigate } from "react-router";
import { RegisterForm } from "../components/RegisterForm";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
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
      <h1>Create account</h1>

      <div className="auth-panel">
        <RegisterForm />

        <p className="auth-prompt">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>.
        </p>
      </div>
    </section>
  );
}