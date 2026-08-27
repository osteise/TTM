import { createContext } from "react";
import type { UpdatePlayerProfileRequest } from "../types/PlayerProfile";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/Auth";

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  register: (request: RegisterRequest) => Promise<void>;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    request: UpdatePlayerProfileRequest,
  ) => Promise<void>;
};

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);