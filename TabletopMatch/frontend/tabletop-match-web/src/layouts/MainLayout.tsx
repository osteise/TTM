import { Outlet } from "react-router";
import { Navigation } from "../components/Navigation";

export function MainLayout() {
  return (
    <>
      <Navigation />

      <main>
        <Outlet />
      </main>
    </>
  );
}