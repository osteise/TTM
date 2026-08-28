import { NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function Navigation() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="site-header">
      <nav
        className="site-navigation"
        aria-label="Main navigation"
      >
        <NavLink className="site-brand" to="/" end>
          TabletopMatch
        </NavLink>

        <ul className="navigation-list">
          <li>
            <NavLink className="navigation-link" to="/" end>
              Home
            </NavLink>
          </li>

          <li>
            <NavLink className="navigation-link" to="/players">
              Players
            </NavLink>
          </li>

          {!isLoading &&
            (user ? (
              <>
                <li>
                  <NavLink
                    className="navigation-link"
                    to="/messages"
                  >
                    Messages
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="navigation-link"
                    to="/profile"
                  >
                    My profile
                  </NavLink>
                </li>

                <li>
                  <button
                    className="navigation-button"
                    type="button"
                    onClick={() => void logout()}
                  >
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink
                  className="navigation-link"
                  to="/login"
                >
                  Log in
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
}