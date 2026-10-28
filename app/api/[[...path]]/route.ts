import { env } from "cloudflare:workers";
import { handleApi } from "@/lib/hodja/api.mjs";

export const dynamic = "force-dynamic";
function respond(request: Request) {
  return handleApi(request, {
    token: (env as Record<string, unknown>).GITHUB_TOKEN as string | undefined,
    edgeCache: (caches as CacheStorage & { default: Cache }).default,
  });
}
export const GET = respond;
export const HEAD = respond;
export const OPTIONS = respond;
export const POST = respond;
