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
  ) {
    throw new GitHubError(
      "Enter a valid GitHub username (1–39 letters, numbers or single hyphens).",
      400,
    );
  }
  return value.toLowerCase();
}

export function parseOptions(params) {
  return {
    username: validateUsername(params.get("username")),
    forks: params.get("forks") === "true",
    archived: params.get("archived") === "true",
    metric: params.get("metric") === "bytes" ? "bytes" : "repos",
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

export async function loadProfile(options, { token, fetcher = fetch } = {}) {
  const { username, forks, archived, metric, exclude } = options;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Halil-Hodja/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  async function get(path) {
    let response;
    try {
      response = await fetcher(`https://api.github.com${path}`, {
        headers,
        signal: AbortSignal.timeout(12000),
        redirect: "manual",
      });
    } catch (error) {
      console.warn(
        "GitHub transport failed:",
        error instanceof Error ? error.message : "Unknown transport error",
      );
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
      ) {
        const retry =
          response.headers.get("retry-after") ||
          String(
            Math.max(
              60,
              Number(response.headers.get("x-ratelimit-reset") || 0) -
                Math.floor(Date.now() / 1000),
            ),
          );
        throw new GitHubError(
          "GitHub rate limit reached. Try again later, or self-host with a server-side GitHub token.",
          429,
          retry,
        );
      }
      throw new GitHubError(
        "GitHub is temporarily unavailable. Please try again later.",
        502,
      );
    }
    return {
      data: await response.json(),
      more: /rel="next"/.test(response.headers.get("link") || ""),
    };
  }

  const { data: user } = await get(`/users/${username}`);
  const repos = [];
  let truncated = false;
  // Bound expensive profiles while disclosing exactly what was scanned.
  for (let page = 1; page <= 10; page++) {
    const result = await get(
      `/users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`,
    );
    repos.push(
      ...result.data.filter(
        (r) => !r.private && r.owner?.login?.toLowerCase() === username,
      ),
    );
    if (!result.more) break;
    if (page === 10) truncated = true;
  }
  const eligible = repos.filter(
    (r) =>
      (forks || !r.fork) &&
      (archived || !r.archived) &&
      !exclude.includes(r.name.toLowerCase()),
  );
  const languageTotals = new Map();
  let sampled = 0;
  let languageRepositories = [];
  if (metric === "bytes") {
    const sample = eligible.filter((r) => r.size > 0).slice(0, 20);
    languageRepositories = sample.map((r) => r.name);
    // Four requests at a time prevents a burst of 20 GitHub requests.
    for (let start = 0; start < sample.length; start += 4) {
      const batch = await Promise.all(
        sample
          .slice(start, start + 4)
          .map((r) =>
            get(`/repos/${username}/${encodeURIComponent(r.name)}/languages`),
          ),
      );
      for (const { data } of batch)
        for (const [name, bytes] of Object.entries(data))
          languageTotals.set(
            name,
            (languageTotals.get(name) || 0) + Number(bytes),
          );
    }
    sampled = sample.length;
  } else {
    for (const r of eligible)
      if (r.language)
        languageTotals.set(
          r.language,
          (languageTotals.get(r.language) || 0) + 1,
        );
    sampled = eligible.filter((r) => r.language).length;
  }
  const total = [...languageTotals.values()].reduce((a, b) => a + b, 0);
  const languages = [...languageTotals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, value]) => ({
      name,
      value,
      percent: total ? (value / total) * 100 : 0,
    }));
  return {
    user: {
      login: user.login,
      name: user.name || user.login,
      avatar: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      publicRepos: user.public_repos,
      url: user.html_url,
    },
    stats: {
      repos: eligible.length,
      stars: eligible.reduce((sum, r) => sum + r.stargazers_count, 0),
      forks: eligible.reduce((sum, r) => sum + r.forks_count, 0),
      followers: user.followers,
    },
    languages,
    scope: {
      metric,
      scanned: repos.length,
      included: eligible.length,
      languageSample: sampled,
      languageRepositories,
      truncated,
      forks,
      archived,
      exclude,
      publicOnly: true,
    },
    updatedAt: new Date().toISOString(),
  };
}
