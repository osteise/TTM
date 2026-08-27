import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>The page you requested could not be found.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}