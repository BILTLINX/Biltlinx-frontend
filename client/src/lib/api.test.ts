import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, apiRequestWithMeta, buildQuery, clearCsrfToken, safeNextPath, setActiveOrganizationId } from "@/lib/api";

function jsonResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status: init.status ?? 200, headers: init.headers });
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  clearCsrfToken();
  setActiveOrganizationId(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildQuery", () => {
  it("skips empty values and joins arrays", () => {
    expect(buildQuery({ q: "villa", city: "", page: 2, skip: null, none: undefined, amenities: ["WiFi", "Pool"], open: false })).toBe(
      "?q=villa&page=2&amenities=WiFi%2CPool&open=false",
    );
  });

  it("returns an empty string when there is nothing to send", () => {
    expect(buildQuery({ a: undefined })).toBe("");
    expect(buildQuery(undefined)).toBe("");
  });
});

describe("safeNextPath", () => {
  it("accepts same-origin paths only", () => {
    expect(safeNextPath("/properties?x=1")).toBe("/properties?x=1");
    expect(safeNextPath("//evil.com")).toBeNull();
    expect(safeNextPath("https://evil.com")).toBeNull();
    expect(safeNextPath("/\\evil.com")).toBeNull();
    expect(safeNextPath("/auth/sign-in")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
  });
});

describe("apiRequest", () => {
  it("sends GET without a CSRF token", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const data = await apiRequest<{ ok: boolean }>("/things", { query: { page: 1 } });
    expect(data).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/things\?page=1$/);
    expect(init.method).toBe("GET");
    expect(init.headers["X-XSRF-TOKEN"]).toBeUndefined();
    expect(init.credentials).toBe("include");
  });

  it("adds the CSRF token, organization id and custom headers to a PUT", async () => {
    setActiveOrganizationId("org-1");
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: "csrf-1" }))
      .mockResolvedValueOnce(jsonResponse(undefined, { status: 204 }));
    await apiRequest("/things/1", { method: "PUT", body: { a: 1 }, headers: { "Idempotency-Key": "k1" } });
    const [, init] = fetchMock.mock.calls[1];
    expect(init.method).toBe("PUT");
    expect(init.headers).toMatchObject({
      "X-XSRF-TOKEN": "csrf-1",
      "X-Organization-Id": "org-1",
      "Idempotency-Key": "k1",
      "Content-Type": "application/json",
    });
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("lets a call override the organization header", async () => {
    setActiveOrganizationId("org-1");
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    await apiRequest("/things", { headers: { "X-Organization-Id": "org-2" } });
    expect(fetchMock.mock.calls[0][1].headers["X-Organization-Id"]).toBe("org-2");
  });

  it("exposes response headers such as Resource-ID", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: "t" }))
      .mockResolvedValueOnce(jsonResponse(undefined, { status: 201, headers: { "Resource-ID": "abc" } }));
    const response = await apiRequestWithMeta("/things", { method: "POST", body: {} });
    expect(response.status).toBe(201);
    expect(response.headers.get("Resource-ID")).toBe("abc");
  });

  it("throws ApiError with the server message and code", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ errors: [{ code: "bad_request", message: "Check-out must be after check-in." }] }, { status: 400 }));
    await expect(apiRequest("/stay/search")).rejects.toMatchObject({
      message: "Check-out must be after check-in.",
      status: 400,
      code: "bad_request",
    });
  });

  it("wraps network failures", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("failed"));
    const error = await apiRequest("/things").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });

  it("shares one refresh across concurrent 401s and retries each request", async () => {
    let refreshCalls = 0;
    fetchMock.mockImplementation(async (url: string, init: RequestInit & { headers: Record<string, string> }) => {
      if (url.endsWith("/auth/refresh")) {
        refreshCalls += 1;
        return jsonResponse(undefined, { status: 204 });
      }
      if (url.endsWith("/auth/csrf")) return jsonResponse({ token: "t" });
      const retried = fetchMock.mock.calls.filter(([u]) => String(u).endsWith(url.split("/").pop() as string)).length > 1;
      return retried ? jsonResponse({ ok: true }) : jsonResponse({ errors: [{ message: "no" }] }, { status: 401 });
    });
    const [a, b] = await Promise.all([apiRequest("/a"), apiRequest("/b")]);
    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
  });

  it("does not redirect on 401 when skipSignInRedirect is set", async () => {
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { pathname: "/home", search: "", assign } });
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/auth/refresh") ? jsonResponse(undefined, { status: 401 }) : jsonResponse({ errors: [{ message: "no" }] }, { status: 401 }),
    );
    await expect(apiRequest("/auth/me", { skipSignInRedirect: true })).rejects.toMatchObject({ status: 401 });
    expect(assign).not.toHaveBeenCalled();
  });
});
