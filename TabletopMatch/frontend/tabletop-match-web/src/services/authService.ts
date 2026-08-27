import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/Auth";

const AUTH_API_URL = "http://localhost:5252/api/auth";

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data.message === "string") {
      return data.message;
    }

    if (Array.isArray(data.errors)) {
      return data.errors.join(" ");
    }
  } catch {
    // The response did not contain JSON.
  }

  return "Something went wrong.";
}

export async function register(
  request: RegisterRequest,
): Promise<AuthUser> {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function login(
  request: LoginRequest,
): Promise<AuthUser> {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(`${AUTH_API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${AUTH_API_URL}/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}