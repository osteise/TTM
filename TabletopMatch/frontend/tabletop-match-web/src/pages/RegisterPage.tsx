import { Navigate } from "react-router";
import { RegisterForm } from "../components/RegisterForm";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <section>
      <h1>Create account</h1>
      <RegisterForm />
    </section>
  );
}