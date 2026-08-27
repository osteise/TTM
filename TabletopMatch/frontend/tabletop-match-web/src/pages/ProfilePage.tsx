import { EditProfileForm } from "../components/EditProfileForm";
import { useAuth } from "../hooks/useAuth";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section>
      <div className="page-header">
        <h1>My profile</h1>
        <p>Review and update your player profile.</p>
      </div>

      <article className="profile-summary">
        <header className="profile-summary__header">
          <div className="profile-avatar" aria-hidden="true">
            {user.displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{user.displayName}</h2>
            <p>Your account details</p>
          </div>
        </header>

        <dl className="profile-details">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>

          <div>
            <dt>City</dt>
            <dd>{user.city}</dd>
          </div>

          <div className="profile-details__bio">
            <dt>Bio</dt>
            <dd>
              {user.bio || (
                <span className="muted-text">
                  No bio added yet.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </article>

      <EditProfileForm />
    </section>
  );
}