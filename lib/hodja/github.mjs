import trackedProfiles from "../../data/profiles.json" with { type: "json" };

export class GitHubError extends Error {
  constructor(message, status = 502, retryAfter = null) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
export function validateUsername(value) {
  if (
    !value ||
    !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value) ||
    value.includes("--")
  )
    throw new GitHubError(
      "Enter a valid GitHub username (1–39 letters, numbers or single hyphens).",
      400,
    );
  return value.toLowerCase();
}
export function parseOptions(params) {
  return {
    username: validateUsername(params.get("username")),
    forks: params.get("forks") === "true",
    archived: params.get("archived") !== "false",
    metric: params.get("metric") === "repos" ? "repos" : "bytes",
    coverage: params.get("coverage") === "all" ? "all" : "legacy100",
    exclude: [
      ...new Set(
        (params.get("exclude") || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      ),
    ]
      .sort()
      .slice(0, 30),
  };
}
function client({ token, fetcher = fetch } = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Halil-Hodja/1.1",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return async (path, body) => {
    let response;
    try {
      response = await fetcher(`https://api.github.com${path}`, {
        headers: {
          ...headers,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        method: body ? "POST" : "GET",
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(15000),
        redirect: "manual",
      });
    } catch {
      throw new GitHubError(
        "GitHub could not be reached. Please try again shortly.",
        502,
      );
    }
    if (!response.ok) {
      if (response.status === 404)
        throw new GitHubError(
          "GitHub user not found. Check the username and try again.",
          404,
        );
      if (
        response.status === 429 ||
        (response.status === 403 &&
          (response.headers.get("x-ratelimit-remaining") === "0" ||
            response.headers.has("retry-after")))
      )
        throw new GitHubError(
          "GitHub rate limit reached. Full code-size scans need a server-side GitHub token or a scheduled public snapshot. No partial data was substituted.",
          429,
          response.headers.get("retry-after") ||
            String(
              Math.max(
                60,
                Number(response.headers.get("x-ratelimit-reset") || 0) -
                  Math.floor(Date.now() / 1000),
              ),
            ),
        );
      throw new GitHubError(
        "GitHub is temporarily unavailable. Please try again later.",
        502,
      );
    }
    const data = await response.json();
    if (data.errors?.length)
      throw new GitHubError(
        "GitHub could not complete the full repository query. No partial result was used.",
        502,
      );
    return {
      data,
      more: /rel="next"/.test(response.headers.get("link") || ""),
    };
  };
}

// Public-only query, including every language GitHub reports for each repo.
// Fetching 100 repositories together avoids hundreds of REST calls when a token is configured.
const query = `query PublicCode($login:String!,$after:String){
  repositoryOwner(login:$login){
    legacy:repositories(first:100,ownerAffiliations:[OWNER],privacy:PUBLIC,isFork:false){nodes{name}}
    repositories(first:100,after:$after,ownerAffiliations:[OWNER],privacy:PUBLIC,orderBy:{field:PUSHED_AT,direction:DESC}){
      pageInfo{hasNextPage endCursor}
      nodes{name createdAt isPrivate isFork isArchived stargazerCount forkCount pushedAt primaryLanguage{name}
        languages(first:100){pageInfo{hasNextPage} edges{size node{name}}}
      }
    }
  }
}`;
export async function collectSnapshot(
  username,
  config = {},
  { languages = true } = {},
) {
  username = validateUsername(username);
  const get = client(config);
  const { data: user } = await get(`/users/${username}`);
  const repos = [];
  let truncated = false;
  let legacyRepositoryNames = [];
  if (config.token && languages) {
    let after = null;
    for (let page = 0; page < 10; page++) {
      const { data } = await get("/graphql", {
        query,
        variables: { login: username, after },
      });
      const connection = data.data?.repositoryOwner?.repositories;
      if (page === 0)
        legacyRepositoryNames = (
          data.data?.repositoryOwner?.legacy?.nodes || []
        ).map((r) => r.name);
      if (!connection)
        throw new GitHubError(
          "GitHub returned an incomplete repository query.",
          502,
        );
      for (const r of connection.nodes) {
        if (r.isPrivate) continue;
        if (r.languages.pageInfo.hasNextPage)
          throw new GitHubError(
            "A repository has more than 100 languages. Refusing to publish incomplete byte totals.",
            502,
          );
        repos.push({
          name: r.name,
          created_at: r.createdAt,
          private: false,
          owner: { login: username },
          fork: r.isFork,
          archived: r.isArchived,
          stargazers_count: r.stargazerCount,
          forks_count: r.forkCount,
          pushed_at: r.pushedAt,
          language: r.primaryLanguage?.name || null,
          languages: Object.fromEntries(
            r.languages.edges.map((l) => [l.node.name, l.size]),
          ),
        });
      }
      if (!connection.pageInfo.hasNextPage) break;
      after = connection.pageInfo.endCursor;
      if (page === 9) truncated = true;
    }
  } else {
    for (let page = 1; page <= 10; page++) {
      const result = await get(
        `/users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`,
      );
      repos.push(
        ...result.data
          .filter(
            (r) => !r.private && r.owner?.login?.toLowerCase() === username,
          )
          .map((r) => ({
            name: r.name,
            created_at: r.created_at,
            private: false,
            owner: { login: username },
            fork: r.fork,
            archived: r.archived,
            stargazers_count: r.stargazers_count,
            forks_count: r.forks_count,
            pushed_at: r.pushed_at,
            language: r.language,
            languages: null,
          })),
      );
      if (!result.more) break;
      if (page === 10) truncated = true;
    }
    legacyRepositoryNames = repos
      .filter((r) => !r.fork)
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
      .slice(0, 100)
      .map((r) => r.name);
    if (languages) {
      for (let start = 0; start < repos.length; start += 4) {
        await Promise.all(
          repos.slice(start, start + 4).map(async (r) => {
            r.languages = (
              await get(
                `/repos/${username}/${encodeURIComponent(r.name)}/languages`,
              )
            ).data;
          }),
        );
      }
    }
  }
  return {
    schemaVersion: 3,
    username,
    generatedAt: new Date().toISOString(),
    truncated,
    legacyRepositoryNames,
    completeLanguages: languages,
    user: {
      login: user.login,
      name: user.name || user.login,
      avatar: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      publicRepos: user.public_repos,
      url: user.html_url,
    },
    repos,
  };
}

export function aggregateSnapshot(snapshot, options, source = "github-api") {
  const repos = snapshot.repos.filter(
    (r) => !r.private && r.owner?.login?.toLowerCase() === options.username,
  );
  const eligible = repos.filter(
    (r) =>
      (options.forks || !r.fork) &&
      (options.archived || !r.archived) &&
      !options.exclude.includes(r.name.toLowerCase()),
  );
  const languageRepos =
    options.coverage === "legacy100"
      ? eligible.filter((r) => snapshot.legacyRepositoryNames?.includes(r.name))
      : eligible;
  const totals = new Map();
  if (options.metric === "bytes") {
    if (!snapshot.completeLanguages)
      throw new GitHubError(
        "Full language data is unavailable. No repository-count or sampled fallback was used.",
        502,
      );
    for (const r of languageRepos) {
      if (
        !r.languages ||
        Object.values(r.languages).some(
          (n) => typeof n !== "number" || !Number.isFinite(n) || n < 0,
        )
      )
        throw new GitHubError(
          "Incomplete language data. Please refresh the full scan.",
          502,
        );
      for (const [name, bytes] of options.coverage === "legacy100"
        ? Object.entries(r.languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        : Object.entries(r.languages))
        totals.set(name, (totals.get(name) || 0) + bytes);
    }
  } else
    for (const r of languageRepos)
      if (r.language) totals.set(r.language, (totals.get(r.language) || 0) + 1);
  const total = [...totals.values()].reduce((a, b) => a + b, 0);
  return {
    user: snapshot.user,
    stats: {
      repos: eligible.length,
      stars: eligible.reduce((s, r) => s + r.stargazers_count, 0),
      forks: eligible.reduce((s, r) => s + r.forks_count, 0),
      followers: snapshot.user.followers,
    },
    languages: [...totals]
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, value]) => ({
        name,
        value,
        percent: total ? (value / total) * 100 : 0,
      })),
    scope: {
      metric: options.metric,
      scanned: repos.length,
      included: eligible.length,
      languageRepoCount:
        options.metric === "bytes"
          ? languageRepos.length
          : languageRepos.filter((r) => r.language).length,
      languageRepositories:
        options.metric === "bytes" ? languageRepos.map((r) => r.name) : [],
      truncated: snapshot.truncated,
      forks: options.forks,
      archived: options.archived,
      exclude: options.exclude,
      publicOnly: true,
      source,
      coverage: options.coverage || "all",
      complete: !snapshot.truncated && options.coverage !== "legacy100",
      sourceRefreshHours: source === "github-snapshot" ? 6 : null,
    },
    updatedAt: snapshot.generatedAt,
  };
}
export async function loadProfile(options, config = {}) {
  // Scheduled, real GitHub snapshots keep the public demo useful for large
  // profiles without storing a maintainer's token on a public web server.
  if (!config.token && trackedProfiles.includes(options.username)) {
    const repository = config.snapshotRepository || "halilozel1903/halil-hodja";
    if (!/^[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+$/.test(repository))
      throw new GitHubError("Invalid snapshot repository configuration.", 500);
    const fetcher = config.snapshotFetcher || fetch;
    try {
      const response = await fetcher(
        `https://raw.githubusercontent.com/${repository}/main/data/${options.username}.json?v=3`,
        { signal: AbortSignal.timeout(10000), redirect: "manual" },
      );
      if (response.ok) {
        const snapshot = await response.json();
        const age = Date.now() - Date.parse(snapshot.generatedAt);
        if (
          snapshot.schemaVersion === 3 &&
          snapshot.username === options.username &&
          snapshot.completeLanguages &&
          age >= -60000 &&
          age < 86400000
        )
          return aggregateSnapshot(snapshot, options, "github-snapshot");
      }
    } catch {
      /* Use a real live scan if the public snapshot is unavailable. */
    }
  }
  return aggregateSnapshot(
    await collectSnapshot(options.username, config, {
      languages: options.metric === "bytes",
    }),
    options,
  );
}
