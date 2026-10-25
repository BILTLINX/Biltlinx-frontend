const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[];

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipSignInRedirect?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

let csrfToken: string | null = null;
let activeOrganizationId: string | null = null;

export function clearCsrfToken() {
  csrfToken = null;
}

export function setActiveOrganizationId(id: string | null) {
  activeOrganizationId = id;
}

export function buildQuery(params: Record<string, QueryValue> | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(","));
    } else {
      search.set(key, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

async function getCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch(`${API_URL}/auth/csrf`, { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    csrfToken = data.token ?? null;
  } catch {
    csrfToken = null;
  }
  return csrfToken;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

const NO_REFRESH_PATHS = ["/auth/login", "/auth/login/mfa", "/auth/login/mfa/send-otp", "/auth/refresh", "/auth/logout"];

let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "X-Requested-With": "fetch" },
        credentials: "include",
      });
      if (res.ok) clearCsrfToken();
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export function signInPath(next?: string) {
  const target = next ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "");
  return safeNextPath(target) ? `/auth/sign-in?next=${encodeURIComponent(target)}` : "/auth/sign-in";
}

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value.startsWith("/auth")) return null;
  return value;
}

function redirectToSignIn() {
  clearCsrfToken();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
    window.location.assign(signInPath());
  }
}

export async function apiRequestWithMeta<T = void>(
  path: string,
  options: RequestOptions = {},
  hasRetried = false,
): Promise<ApiResponse<T>> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (activeOrganizationId) headers["X-Organization-Id"] = activeOrganizationId;
  if (method !== "GET") {
    const token = await getCsrfToken();
    if (token) headers["X-XSRF-TOKEN"] = token;
  }
  Object.assign(headers, options.headers);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${buildQuery(options.query)}`, {
      method,
      headers,
      credentials: "include",
      signal: options.signal,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  const text = await res.text();
  const data = text ? safeParse(text) : undefined;

  if (res.status === 401 && !hasRetried && !NO_REFRESH_PATHS.includes(path)) {
    if (await refreshSession()) return apiRequestWithMeta<T>(path, options, true);
    if (!options.skipSignInRedirect) redirectToSignIn();
  }

  if (!res.ok) {
    const first = (data as { errors?: { code?: string; message?: string }[] } | undefined)?.errors?.[0];
    throw new ApiError(first?.message ?? "Something went wrong. Please try again.", res.status, first?.code);
  }
  return { data: data as T, status: res.status, headers: res.headers };
}

export async function apiRequest<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  return (await apiRequestWithMeta<T>(path, options)).data;
}
