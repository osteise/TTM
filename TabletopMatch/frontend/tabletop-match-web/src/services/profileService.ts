import type { PlayerProfile } from "../types/PlayerProfile";

const API_URL = "http://localhost:5252/api/profiles";

export type CreatePlayerProfile = {
  displayName: string;
  city: string;
};

export async function getProfiles(): Promise<PlayerProfile[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }

  return response.json();
}

export async function createProfile(
  profile: CreatePlayerProfile
): Promise<PlayerProfile> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Failed to create profile");
  }

  return response.json();
}