import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { validateUsername } from "../lib/hodja/github.mjs";
const username = validateUsername(process.argv[2] || "halilozel1903");
const metric = process.argv[4] === "bytes" ? "bytes" : "repos";
const origin = new URL(
  process.argv[3] || "https://halil-hodja.halilozel1903.chatgpt.site",
);
if (!["http:", "https:"].includes(origin.protocol))
  throw new Error("Expected an HTTP(S) instance URL.");
function github(path, paginate = false) {
  const result = spawnSync(
    "gh",
    [
      "api",
      "--hostname",
      "github.com",
      ...(paginate ? ["--paginate", "--slurp"] : []),
      path,
    ],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  if (result.status !== 0)
    throw new Error(
      "GitHub CLI request failed. Install gh and run gh auth login first.",
    );
  return JSON.parse(result.stdout);
}
const response = await fetch(
  new URL(`/api/profile?username=${username}&metric=${metric}`, origin),
);
const profile = await response.json();
if (!response.ok) throw new Error(profile.error || "Instance request failed.");
const user = github(`users/${username}`);
const pages = [];
for (let page = 1; page <= 10; page++) {
  const repos = github(
    `users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`,
  );
  pages.push(repos);
  if (repos.length < 100) break;
}
const scanned = pages
  .slice(0, 10)
  .flat()
  .filter((r) => !r.private && r.owner.login.toLowerCase() === username);
const included = scanned.filter((r) => !r.fork && !r.archived);
const expected = {
  repos: included.length,
  stars: included.reduce((s, r) => s + r.stargazers_count, 0),
  forks: included.reduce((s, r) => s + r.forks_count, 0),
  followers: user.followers,
};
const languages = {};
if (metric === "bytes") {
  assert.ok(
    Array.isArray(profile.scope.languageRepositories),
    "Instance must disclose byte-sample repository names.",
  );
  assert.ok(profile.scope.languageRepositories.length <= 20);
  for (const name of profile.scope.languageRepositories) {
    assert.ok(
      included.some((r) => r.name === name),
      "Sample contains a repository outside the eligible public set.",
    );
    const bytes = github(
      `repos/${username}/${encodeURIComponent(name)}/languages`,
    );
    for (const [language, value] of Object.entries(bytes))
      languages[language] = (languages[language] || 0) + value;
  }
} else {
  for (const r of included)
    if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
}
console.log(
  JSON.stringify(
    {
      username,
      instance: origin.origin,
      checkedAt: new Date().toISOString(),
      cardDataUpdatedAt: profile.updatedAt,
      independentGitHubTotals: expected,
      instanceTotals: profile.stats,
    },
    null,
    2,
  ),
);
assert.deepEqual(
  profile.stats,
  expected,
  "Counts differ from current GitHub data. Check the one-hour cache timestamp before concluding data is incorrect.",
);
assert.deepEqual(
  Object.fromEntries(profile.languages.map((l) => [l.name, l.value])),
  languages,
  "Language measurements differ.",
);
const total = Object.values(languages).reduce((a, b) => a + b, 0);
for (const language of profile.languages)
  assert.ok(
    Math.abs(language.percent - (languages[language.name] / total) * 100) <
      1e-8,
  );
assert.equal(profile.scope.scanned, scanned.length);
console.log(
  "PASS: statistics, language measurements, percentages, and scan scope independently match GitHub.",
);
