import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/authService";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/Auth";
import { AuthContext } from "./AuthContext";
import { updateMyProfile } from "../services/profileService";
import type { UpdatePlayerProfileRequest } from "../types/PlayerProfile";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!isCancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function register(request: RegisterRequest) {
    const registeredUser = await registerRequest(request);
    setUser(registeredUser);
  }

  async function login(request: LoginRequest) {
    const loggedInUser = await loginRequest(request);
    setUser(loggedInUser);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  async function updateProfile(
    request: UpdatePlayerProfileRequest,
  ) {
    const updatedProfile = await updateMyProfile(request);

    setUser((currentUser) => {
      if (currentUser === null) {
        return null;
      }

      return {
        ...currentUser,
        displayName: updatedProfile.displayName,
        city: updatedProfile.city,
        bio: updatedProfile.bio,
      };
    });
  }

  return (
  <AuthContext.Provider
    value={{
      user,
      isLoading,
      register,
      login,
      logout,
      updateProfile,
    }}
  >
      {children}
    </AuthContext.Provider>
  );
}