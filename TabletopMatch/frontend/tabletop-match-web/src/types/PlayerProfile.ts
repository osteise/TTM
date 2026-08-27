export type PlayerProfile = {
  id: number;
  displayName: string;
  city: string;
  bio: string | null;
  createdAt: string;
};

export type UpdatePlayerProfileRequest = {
  displayName: string;
  city: string;
  bio: string | null;
};