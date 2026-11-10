export type Role = "CUSTOMER" | "ORGANIZER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
};

// Matches the ProblemDetail JSON from GlobalExceptionHandler.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<AuthResponse | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    return new ApiError(res.status, body.detail ?? res.statusText, body.fieldErrors ?? {});
  } catch {
    return new ApiError(res.status, res.statusText || "Request failed");
  }
}

// Single-flight: if several calls need a refresh at the same time, they all share one request.
// Two parallel refreshes would send the same cookie twice, and the backend's reuse detection
// would treat the second one as a stolen token and log the user out everywhere.
export function refreshSession(): Promise<AuthResponse | null> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          accessToken = null;
          return null;
        }
        const session: AuthResponse = await res.json();
        accessToken = session.accessToken;
        return session;
      })
      .catch(() => {
        accessToken = null;
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(path, { ...init, headers });

  // Access token expired (15 min): get a new one once, then retry the original call.
  if (res.status === 401 && retry && !path.startsWith("/api/auth/")) {
    const session = await refreshSession();
    if (session) {
      return apiFetch<T>(path, init, false);
    }
  }

  if (!res.ok) {
    throw await toApiError(res);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}