export type AuthUser = {
  email: string;
  profileId: number;
  displayName: string;
  city: string;
  bio: string | null;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
  city: string;
  bio?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};