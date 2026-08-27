import { Navigate } from "react-router";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <section>
      <h1>Log in</h1>
      <LoginForm />
    </section>
  );
}