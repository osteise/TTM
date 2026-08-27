import type { PlayerProfile } from "../types/PlayerProfile";

const API_URL = "http://localhost:5252/api/profiles";

export async function getProfiles(): Promise<PlayerProfile[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }

  return response.json();
}