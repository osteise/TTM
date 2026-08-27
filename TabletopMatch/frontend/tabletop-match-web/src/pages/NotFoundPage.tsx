import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="not-found__code">404</p>

      <h1>Page not found</h1>

      <p className="not-found__description">
        The page you requested does not exist or may have moved.
      </p>

      <Link className="button button--primary" to="/">
        Back to home
      </Link>
    </section>
  );
}