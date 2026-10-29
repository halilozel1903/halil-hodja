import { GitHubError, parseOptions, loadProfile } from "./github.mjs";
import { cardOptions, renderCard, errorCard } from "./cards.mjs";

const memory = new Map();
const pending = new Map();
const TTL = 3600;
export async function handleApi(
  request,
  { token, fetcher, edgeCache, waitUntil, snapshotRepository } = {},
) {
  const url = new URL(request.url);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  };
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      },
    });
  if (!["GET", "HEAD"].includes(request.method))
    return Response.json(
      { error: "Method not allowed." },
      { status: 405, headers: { ...headers, Allow: "GET, HEAD, OPTIONS" } },
    );
  if (url.pathname === "/api/health")
    return Response.json(
      { name: "Halil Hodja", status: "ok", version: "1.2.0" },
      { headers },
    );
  const json = url.pathname === "/api/profile";
  if (
    ![
      "/api",
      "/api/",
      "/api/card",
      "/api/profile",
      "/api/top-langs",
      "/api/top-langs/",
    ].includes(url.pathname)
  )
    return Response.json(
      { error: "Endpoint not found." },
      { status: 404, headers },
    );
  try {
    const options = parseOptions(url.searchParams);
    const key = JSON.stringify(options);
    const cacheRequest = new Request(
      `${url.origin}/_hodja_cache/v7/${encodeURIComponent(key)}`,
    );
    let profile;
    const hit = memory.get(key);
    if (hit && hit.expires > Date.now()) profile = hit.data;
    else {
      let edge = null;
      if (edgeCache) {
        try {
          edge = await edgeCache.match(cacheRequest);
        } catch {
          // Some Worker dispatch environments do not expose the Cache API.
          // Caching is an optimization, never a requirement to read real data.
          console.warn("Edge cache read unavailable; using in-memory cache.");
        }
      }
      if (edge) profile = await edge.json();
      else {
        if (!pending.has(key))
          pending.set(
            key,
            loadProfile(options, { token, fetcher, snapshotRepository }),
          );
        try {
          profile = await pending.get(key);
        } finally {
          pending.delete(key);
        }
        if (edgeCache) {
          const task = (async () => {
            try {
              await edgeCache.put(
                cacheRequest,
                Response.json(profile, {
                  headers: { "Cache-Control": `public, max-age=${TTL}` },
                }),
              );
            } catch {
              console.warn(
                "Edge cache write unavailable; using in-memory cache.",
              );
            }
          })();
          if (waitUntil) waitUntil(task);
          else await task;
        }
      }
      if (memory.size >= 100) memory.delete(memory.keys().next().value);
      // Keep the original data timestamp, including when repopulating from edge cache.
      memory.set(key, {
        data: profile,
        expires: Math.min(
          Date.now() + TTL * 1000,
          Date.parse(profile.updatedAt) +
            (profile.scope.source === "github-snapshot" ? 86400 : TTL) * 1000,
        ),
      });
    }
    const age = Math.max(
      0,
      Math.floor((Date.now() - Date.parse(profile.updatedAt)) / 1000),
    );
    const remaining = Math.max(
      0,
      Math.min(
        TTL,
        (profile.scope.source === "github-snapshot" ? 86400 : TTL) - age,
      ),
    );
    headers["Cache-Control"] =
      `public, max-age=${Math.min(300, remaining)}, s-maxage=${remaining}`;
    headers["X-Hodja-Updated-At"] = profile.updatedAt;
    if (json)
      return new Response(
        request.method === "HEAD" ? null : JSON.stringify(profile),
        {
          headers: {
            ...headers,
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    const card = cardOptions(url.searchParams);
    if (url.pathname.includes("top-langs")) card.type = "languages";
    return new Response(
      request.method === "HEAD" ? null : renderCard(profile, card),
      {
        headers: {
          ...headers,
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        },
      },
    );
  } catch (error) {
    const known = error instanceof GitHubError;
    if (!known)
      console.error(
        "Profile request failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
    const status = known ? error.status : 500;
    const message = known
      ? error.message
      : "Something went wrong. Please try again later.";
    const errorHeaders = { ...headers, "Cache-Control": "no-store" };
    if (known && error.retryAfter)
      errorHeaders["Retry-After"] = error.retryAfter;
    return new Response(
      request.method === "HEAD"
        ? null
        : json
          ? JSON.stringify({ error: message })
          : errorCard(message),
      {
        status,
        headers: {
          ...errorHeaders,
          "Content-Type": json
            ? "application/json; charset=utf-8"
            : "image/svg+xml; charset=utf-8",
        },
      },
    );
  }
}

export function clearCache() {
  memory.clear();
  pending.clear();
}
