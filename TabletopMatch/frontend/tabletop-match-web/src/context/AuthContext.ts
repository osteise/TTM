import { createContext } from "react";
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
};

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);