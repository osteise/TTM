import { EditProfileForm } from "../components/EditProfileForm";
import { useAuth } from "../hooks/useAuth";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section>
      <h1>My profile</h1>

      <h2>{user.displayName}</h2>
      <p>{user.email}</p>
      <p>{user.city}</p>
      {user.bio && <p>{user.bio}</p>}

      <EditProfileForm />
    </section>
  );
}