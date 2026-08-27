import { Outlet } from "react-router";
import { Navigation } from "../components/Navigation";

export function MainLayout() {
  return (
    <>
      <Navigation />

      <main className="site-main">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </>
  );
}