const UPSTREAM_ORIGIN = "https://jawadtech.vercel.app";
const UPSTREAM_ENDPOINT = `${UPSTREAM_ORIGIN}/x`;

export type UpstreamStatus = { count?: number; limit?: number; error?: unknown };

/**
 * Relays a request to the upstream bot backend. The upstream rejects foreign
 * origins, so the expected origin/referer are attached server-side. Nothing
 * about the upstream endpoint is ever exposed to the browser.
 */
export async function callUpstream<T>(action: string, payload: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(UPSTREAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: UPSTREAM_ORIGIN,
        Referer: `${UPSTREAM_ORIGIN}/`,
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
      },
      body: JSON.stringify({ a: action, b: payload }),
    });
  } catch {
    throw new Error("Backend is not responding. Please try again.");
  }

  if (!response.ok) {
    throw new Error("Backend is not responding. Please try again.");
  }

  let result: Record<string, unknown>;
  try {
    result = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new Error("Unexpected response from backend.");
  }

  if (typeof result["e"] === "string" && result["e"]) {
    throw new Error(result["e"] as string);
  }

  return result as T;
}
