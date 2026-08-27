import type {
  PlayerProfile,
  UpdatePlayerProfileRequest,
} from "../types/PlayerProfile";

const API_URL = "http://localhost:5252/api/profiles";

export async function getProfiles(): Promise<PlayerProfile[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch profiles.");
  }

  return response.json();
}

export async function getProfile(
  id: number,
): Promise<PlayerProfile | null> {
  const response = await fetch(`${API_URL}/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch profile.");
  }

  return response.json();
}

export async function updateMyProfile(
  request: UpdatePlayerProfileRequest,
): Promise<PlayerProfile> {
  const response = await fetch(`${API_URL}/me`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.message ?? "Failed to update profile.",
    );
  }

  return response.json();
}