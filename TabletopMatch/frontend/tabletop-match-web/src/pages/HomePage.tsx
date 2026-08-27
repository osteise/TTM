import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <section className="home-page">
      <div className="home-hero">
        <p className="eyebrow">Tabletop community</p>

        <h1>Find people to play with.</h1>

        <p className="home-hero__description">
          Discover tabletop players in your area and build
          connections around the games you enjoy.
        </p>

        <div className="home-hero__actions">
          <Link
            className="button button--primary"
            to="/players"
          >
            Browse players
          </Link>

          {!isLoading &&
            (user ? (
              <Link
                className="button button--secondary"
                to="/profile"
              >
                View my profile
              </Link>
            ) : (
              <Link
                className="button button--secondary"
                to="/register"
              >
                Create account
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}