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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}