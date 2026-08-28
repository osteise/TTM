import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PlayersPage } from "./pages/PlayersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlayerProfilePage } from "./pages/PlayerProfilePage";
import { MessagesPage } from "./pages/MessagesPage";
import { ConversationPage } from "./pages/ConversationPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route
          path="/players/:profileId"
          element={<PlayerProfilePage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route
            path="/messages/:conversationId"
            element={<ConversationPage />}
          />
        </Route>


        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;