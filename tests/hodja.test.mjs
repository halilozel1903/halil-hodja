import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  loadProfile,
  parseOptions,
  validateUsername,
} from "../lib/hodja/github.mjs";
import { handleApi, clearCache } from "../lib/hodja/api.mjs";
import { renderCard, cardOptions, themes } from "../lib/hodja/cards.mjs";
const user = {
  login: "test-user",
  name: 'A <script>alert("x")</script> & friend',
  public_repos: 4,
  followers: 7,
  avatar_url: "",
  html_url: "https://github.com/test-user",
};
const repo = (name, language, extra = {}) => ({
  name,
  language,
  owner: { login: "test-user" },
  stargazers_count: 3,
  forks_count: 2,
  size: 10,
  private: false,
  fork: false,
  archived: false,
  ...extra,
});
const fixture = [
  repo("one", "Kotlin"),
  repo("two", "Swift"),
  repo("fork", "JavaScript", { fork: true }),
  repo("old", "Java", { archived: true }),
  repo("private", "Python", { private: true }),
];
function mock(list = fixture) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    const path = new URL(url).pathname;
    if (path.endsWith("/languages"))
      return Response.json(
        path.includes("/one/") ? { Kotlin: 300, Java: 100 } : { Swift: 600 },
      );
    if (path.endsWith("/repos")) return Response.json(list);
    return Response.json(user);
  };
  return { calls, fetcher };
}
const params = (value) =>
  parseOptions(new URLSearchParams({ username: "test-user", ...value }));
const req = (query = "", path = "/api/profile", method = "GET") =>
  new Request(`https://cards.example${path}?username=test-user&${query}`, {
    method,
  });
beforeEach(clearCache);

test("validates usernames and normalizes case before any upstream request", () => {
  assert.equal(validateUsername("Test-User"), "test-user");
  for (const invalid of [
    "",
    "-user",
    "user-",
    "a--b",
    "../foo",
    "foo?token=secret",
    "a".repeat(40),
  ])
    assert.throws(() => validateUsername(invalid));
});
test("filters public owned repositories and reports primary languages without inflating hidden ones", async () => {
  const { fetcher, calls } = mock();
  const p = await loadProfile(params({}), { fetcher });
  assert.deepEqual(p.stats, { repos: 2, stars: 6, forks: 4, followers: 7 });
  assert.equal(p.languages[0].percent, 50);
  assert.equal(p.scope.scanned, 4);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].init.redirect, "manual");
});
test("applies fork, archive and case-insensitive repository exclusions together", async () => {
  const { fetcher } = mock();
  const p = await loadProfile(
    params({ forks: "true", archived: "true", exclude: "ONE, one" }),
    { fetcher },
  );
  assert.equal(p.stats.repos, 3);
  assert.equal(
    p.languages.some((l) => l.name === "Kotlin"),
    false,
  );
});
test("byte metric sums actual language bytes and discloses sample size", async () => {
  const { fetcher, calls } = mock();
  const p = await loadProfile(params({ metric: "bytes" }), { fetcher });
  assert.equal(p.scope.languageSample, 2);
  assert.deepEqual(
    p.languages.map((l) => [l.name, l.percent]),
    [
      ["Swift", 60],
      ["Kotlin", 30],
      ["Java", 10],
    ],
  );
  assert.equal(calls.length, 4);
});
test("byte mode bounds language requests to twenty eligible nonempty repositories", async () => {
  const { fetcher, calls } = mock(
    Array.from({ length: 30 }, (_, i) => repo(`repo-${i}`, "Swift")),
  );
  const p = await loadProfile(params({ metric: "bytes" }), { fetcher });
  assert.equal(p.scope.languageSample, 20);
  assert.equal(p.stats.repos, 30);
  assert.equal(calls.length, 22);
});
test("follows repository pagination and marks a capped profile as partial", async () => {
  let pages = 0;
  const fetcher = async (url) =>
    new URL(url).pathname.endsWith("/repos")
      ? (pages++,
        Response.json([repo(`page-${pages}`, "Kotlin")], {
          headers: { link: '<https://api.github.com/next>; rel="next"' },
        }))
      : Response.json(user);
  const p = await loadProfile(params({}), { fetcher });
  assert.equal(pages, 10);
  assert.equal(p.stats.repos, 10);
  assert.equal(p.scope.truncated, true);
});
test("deduplicates simultaneous profile requests and reuses data for theme and card variants", async () => {
  const { fetcher, calls } = mock();
  const responses = await Promise.all([
    handleApi(req(), { fetcher }),
    handleApi(req("theme=paper", "/api/card"), { fetcher }),
  ]);
  assert.equal(responses[0].status, 200);
  assert.match(await responses[1].text(), /<svg/);
  assert.equal(calls.length, 2);
  await handleApi(req("theme=rose&type=languages", "/api/card"), { fetcher });
  assert.equal(calls.length, 2);
  await handleApi(req("forks=true"), { fetcher });
  assert.equal(calls.length, 4);
});
test("invalid users never hit GitHub; errors are not cached", async () => {
  const { fetcher, calls } = mock();
  const r = await handleApi(
    new Request("https://cards.example/api/profile?username=../bad"),
    { fetcher },
  );
  assert.equal(r.status, 400);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(calls.length, 0);
});
test("404, upstream outage and rate limiting keep their meaning with retry metadata", async () => {
  for (const [status, expected, extra] of [
    [404, 404, {}],
    [500, 502, {}],
    [403, 429, { "x-ratelimit-remaining": "0", "retry-after": "90" }],
  ]) {
    const r = await handleApi(req(), {
      fetcher: async () => new Response("", { status, headers: extra }),
    });
    assert.equal(r.status, expected);
    assert.equal(r.headers.get("cache-control"), "no-store");
    if (expected === 429) assert.equal(r.headers.get("retry-after"), "90");
  }
});
test("SVG generation escapes profile text and never rescales visible language percentages", async () => {
  const p = await loadProfile(params({}), mock());
  p.languages = [
    { name: "A <unsafe>", percent: 30 },
    { name: "B", percent: 20 },
    { name: "C", percent: 50 },
  ];
  for (const theme of Object.keys(themes))
    for (const type of ["stats", "languages", "overview"]) {
      const svg = renderCard(p, { theme, type, count: 2 });
      assert.ok(!svg.includes("<script>"));
      assert.match(svg, /role="img"/);
      if (type !== "stats") {
        assert.match(svg, /Other 50.0%/);
        assert.match(svg, /30.0%/);
      }
    }
});
test("handles empty language data and clamps invalid rendering options", async () => {
  const p = await loadProfile(params({}), mock([]));
  assert.match(renderCard(p, { type: "languages" }), /No language data yet/);
  assert.deepEqual(
    cardOptions(new URLSearchParams("langs_count=NaN&theme=evil&type=evil")),
    { theme: "midnight", locale: "en", count: 4, type: "stats" },
  );
});
test("serves SVG aliases, CORS, HEAD, and method errors with correct content types", async () => {
  const { fetcher } = mock();
  const r = await handleApi(req("theme=paper", "/api/top-langs/"), { fetcher });
  assert.match(r.headers.get("content-type"), /image\/svg\+xml/);
  assert.equal(r.headers.get("access-control-allow-origin"), "*");
  assert.match(await r.text(), /Top languages/);
  const head = await handleApi(req("", "/api/card", "HEAD"), { fetcher });
  assert.equal(await head.text(), "");
  assert.equal((await handleApi(req("", "/api/profile", "POST"))).status, 405);
  assert.equal((await handleApi(req("", "/api/missing"))).status, 404);
});
test("server-side token is sent only upstream, never in public profile output", async () => {
  const { fetcher, calls } = mock();
  const r = await handleApi(req(), { fetcher, token: "test-secret" });
  assert.equal(calls[0].init.headers.Authorization, "Bearer test-secret");
  assert.ok(!(await r.text()).includes("test-secret"));
});

test("edge cache preserves dataset age instead of granting a fresh hour to old data", async () => {
  const p = await loadProfile(params({}), mock());
  p.updatedAt = new Date(Date.now() - 1800 * 1000).toISOString();
  const edgeCache = {
    match: async () => Response.json(p),
    put: async () => assert.fail("Should reuse edge data"),
  };
  const r = await handleApi(req(), {
    edgeCache,
    fetcher: async () => assert.fail("Should not fetch GitHub"),
  });
  const maxAge = Number(
    r.headers.get("cache-control").match(/s-maxage=(\d+)/)[1],
  );
  assert.ok(maxAge <= 1800 && maxAge >= 1798);
  assert.equal(r.headers.get("x-hodja-updated-at"), p.updatedAt);
});

test("a failed language fetch never becomes a successful partial dataset", async () => {
  const m = mock();
  const fetcher = async (url, init) =>
    url.endsWith("/languages")
      ? new Response("", { status: 500 })
      : m.fetcher(url, init);
  const r = await handleApi(req("metric=bytes"), { fetcher });
  assert.equal(r.status, 502);
  assert.equal(r.headers.get("cache-control"), "no-store");
});

test("unavailable platform edge cache cannot turn a valid GitHub response into an error", async () => {
  const { fetcher, calls } = mock();
  const edgeCache = {
    match: async () => {
      throw new Error("Cache API unavailable");
    },
    put: async () => {
      throw new Error("Cache API unavailable");
    },
  };
  const r = await handleApi(req(), { fetcher, edgeCache });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).stats.repos, 2);
  await handleApi(req("theme=paper", "/api/card"), { fetcher, edgeCache });
  assert.equal(calls.length, 2);
});
