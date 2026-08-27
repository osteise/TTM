import { NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function Navigation() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          TabletopMatch
        </NavLink>

        <ul>
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>

          <li>
            <NavLink to="/players">Players</NavLink>
          </li>

          {!isLoading &&
            (user ? (
              <>
                <li>
                  <NavLink to="/profile">My profile</NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => void logout()}
                  >
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login">Log in</NavLink>
                </li>
                <li>
                  <NavLink to="/register">
                    Create account
                  </NavLink>
                </li>
              </>
            ))}
        </ul>
      </nav>
    </header>
  );
}