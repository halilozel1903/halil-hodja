import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { validateUsername } from "../lib/hodja/github.mjs";
const username = validateUsername(process.argv[2] || "halilozel1903");
const origin = new URL(
  process.argv[3] || "https://halil-hodja.halilozel1903.chatgpt.site",
);
const metric = process.argv[4] === "repos" ? "repos" : "bytes";
const coverage = process.argv[5] === "all" ? "all" : "legacy100";
if (!["http:", "https:"].includes(origin.protocol))
  throw new Error("Expected HTTP(S) origin.");
function github(path, body) {
  const args = ["api", "--hostname", "github.com", path];
  if (body) args.push("-f", `query=${body}`);
  const r = spawnSync("gh", args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.status !== 0)
    throw new Error("GitHub CLI request failed; authenticate gh first.");
  const data = JSON.parse(r.stdout);
  if (data.errors) throw new Error("Independent GraphQL request failed.");
  return data;
}
const query = new URLSearchParams({ username, metric, coverage });
const response = await fetch(new URL(`/api/profile?${query}`, origin));
const p = await response.json();
if (!response.ok) throw new Error(p.error || "Instance failed.");
const user = github(`users/${username}`);
const scanned = [];
for (let page = 1; page <= 10; page++) {
  const rows = github(
    `users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`,
  );
  scanned.push(
    ...rows.filter(
      (r) => !r.private && r.owner.login.toLowerCase() === username,
    ),
  );
  if (rows.length < 100) break;
}
const included = scanned.filter(
  (r) =>
    (p.scope.forks || !r.fork) &&
    (p.scope.archived || !r.archived) &&
    !p.scope.exclude.includes(r.name.toLowerCase()),
);
const expected = {
  repos: included.length,
  stars: included.reduce((s, r) => s + r.stargazers_count, 0),
  forks: included.reduce((s, r) => s + r.forks_count, 0),
  followers: user.followers,
};
const languageTotals = {};
let measured = included;
if (coverage === "legacy100") {
  const q = `query { repositoryOwner(login:"${username}") { repositories(ownerAffiliations:OWNER,privacy:PUBLIC,isFork:false,first:100) { nodes { name languages(first:10,orderBy:{field:SIZE,direction:DESC}) { edges { size node { name } } } } } } }`;
  const rows = github(
    "graphql",
    q,
  ).data.repositoryOwner.repositories.nodes.filter((r) =>
    included.some((i) => i.name === r.name),
  );
  measured = rows;
  if (metric === "bytes")
    for (const r of rows)
      for (const edge of r.languages.edges)
        languageTotals[edge.node.name] =
          (languageTotals[edge.node.name] || 0) + edge.size;
}
if (metric === "repos") {
  for (const r of included.filter((r) =>
    measured.some((m) => m.name === r.name),
  ))
    if (r.language)
      languageTotals[r.language] = (languageTotals[r.language] || 0) + 1;
} else if (coverage === "all") {
  for (const r of measured) {
    const bytes = github(
      `repos/${username}/${encodeURIComponent(r.name)}/languages`,
    );
    for (const [name, value] of Object.entries(bytes))
      languageTotals[name] = (languageTotals[name] || 0) + value;
  }
}
console.log(
  JSON.stringify(
    {
      username,
      metric,
      coverage,
      checkedAt: new Date().toISOString(),
      datasetUpdatedAt: p.updatedAt,
      source: p.scope.source,
      independentGitHubTotals: expected,
      instanceTotals: p.stats,
      measuredRepositories: measured.length,
    },
    null,
    2,
  ),
);
assert.deepEqual(
  p.stats,
  expected,
  "Profile totals differ; check source timestamp and filters.",
);
assert.deepEqual(
  Object.fromEntries(p.languages.map((l) => [l.name, l.value])),
  languageTotals,
  "Language byte/count totals differ.",
);
const total = Object.values(languageTotals).reduce((a, b) => a + b, 0);
for (const l of p.languages)
  assert.ok(
    Math.abs(l.percent - (languageTotals[l.name] / total) * 100) < 1e-8,
  );
assert.equal(p.scope.scanned, scanned.length);
if (metric === "bytes")
  assert.deepEqual(
    new Set(p.scope.languageRepositories),
    new Set(measured.map((r) => r.name)),
  );
const top = Object.entries(languageTotals)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 4);
const shownTotal = top.reduce((s, [, v]) => s + v, 0);
const display = top.map(([name, value]) => ({
  name,
  bytes: value,
  percent: shownTotal ? (value / shownTotal) * 100 : 0,
}));
const svg = await (
  await fetch(
    new URL(`/api/card?${query}&type=languages&langs_count=4`, origin),
  )
).text();
for (const l of display)
  assert.ok(
    svg.includes(`${l.percent.toFixed(2)}%`),
    "SVG percentage differs from independent byte calculation.",
  );
console.log(JSON.stringify({ displayedTop4: display }, null, 2));
console.log(
  "PASS: profile totals, language measurements, repository coverage, and displayed SVG percentages independently match GitHub.",
);
