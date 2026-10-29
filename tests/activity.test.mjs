import test from "node:test";
import assert from "node:assert/strict";
import {
  activityWindows,
  commitStreaks,
  collectActivity,
} from "../lib/hodja/activity.mjs";
import {
  renderCard,
  languageColors,
  cardDimensions,
} from "../lib/hodja/cards.mjs";
const now = new Date("2026-10-29T18:00:00Z");

test("365 UTC date windows have no gaps, overlaps or oversized daily connections", () => {
  const windows = activityWindows(now);
  assert.equal(windows[0].from, "2025-10-30T00:00:00.000Z");
  assert.equal(windows.at(-1).to, now.toISOString());
  windows.forEach((w, i) => {
    assert.ok(Date.parse(w.to) - Date.parse(w.from) < 7 * 86400000);
    if (i) assert.equal(Date.parse(w.from), Date.parse(windows[i - 1].to) + 1);
  });
});
test("commit streaks preserve yesterday grace, gaps and leap dates", () => {
  assert.deepEqual(commitStreaks({ "2026-10-27": 3, "2026-10-28": 2 }, now), {
    currentStreakDays: 2,
    longestStreakDays: 2,
    activeCommitDays: 2,
  });
  assert.equal(commitStreaks({ "2026-10-26": 2 }, now).currentStreakDays, 0);
  assert.equal(
    commitStreaks(
      { "2024-02-28": 1, "2024-02-29": 1, "2024-03-01": 1 },
      new Date("2024-03-01T22:00:00Z"),
    ).longestStreakDays,
    3,
  );
  assert.equal(commitStreaks({}, now).currentStreakDays, 0);
});
function api(overCap = false) {
  return async (path, body) => {
    if (body.query.includes("PublicPullRequests")) {
      assert.ok(
        Object.values(body.variables).every((q) => q.includes("is:public")),
      );
      return {
        data: {
          data: {
            authored: { issueCount: 12 },
            merged: { issueCount: 9 },
            reviewed: { issueCount: 4 },
          },
        },
      };
    }
    const u = {};
    activityWindows(now).forEach(
      (w, i) =>
        (u[`w${i}`] = {
          totalRepositoriesWithContributedCommits:
            i === 0 && overCap ? 101 : i === 0 ? 3 : 0,
          commitContributionsByRepository:
            i === 0
              ? [
                  {
                    repository: { isPrivate: false },
                    contributions: {
                      pageInfo: { hasNextPage: false },
                      nodes: [{ commitCount: 5, occurredAt: w.from }],
                    },
                  },
                  {
                    repository: { isPrivate: false },
                    contributions: {
                      pageInfo: { hasNextPage: false },
                      nodes: [{ commitCount: 2, occurredAt: w.from }],
                    },
                  },
                  {
                    repository: { isPrivate: true },
                    contributions: {
                      pageInfo: { hasNextPage: false },
                      nodes: [{ commitCount: 999, occurredAt: w.from }],
                    },
                  },
                ]
              : [],
        }),
    );
    return { data: { data: { user: u } } };
  };
}
test("public activity excludes private commits and combines public repositories by date", async () => {
  const a = await collectActivity("test-user", api(), now);
  assert.equal(a.publicCommits, 7);
  assert.equal(a.activeCommitDays, 1);
  assert.equal(a.longestStreakDays, 1);
  assert.equal(a.pullRequests, 12);
  assert.equal(a.mergedPullRequests, 9);
  assert.ok(!JSON.stringify(a).includes("999"));
});
test("a repository cap yields unavailable commit metrics rather than invented partial success", async () => {
  const a = await collectActivity("test-user", api(true), now);
  assert.equal(a.publicCommits, null);
  assert.equal(a.currentStreakDays, null);
  assert.equal(a.commitCoverageComplete, false);
  assert.equal(a.pullRequests, 12);
});
const profile = {
  user: { login: "dev", name: "Developer" },
  stats: { repos: 12, stars: 40, forks: 3, followers: 99999 },
  activity: {
    publicCommits: 37,
    currentStreakDays: 3,
    currentContributionStreakDays: 9,
    longestContributionStreakDays: 12,
    longestStreakDays: 7,
    activeCommitDays: 9,
    pullRequests: 12,
    mergedPullRequests: 9,
    reviewedPullRequests: 4,
  },
  scope: { coverage: "legacy100", metric: "bytes", included: 12, scanned: 15 },
  languages: [
    { name: "Java", value: 30, percent: 30 },
    { name: "Objective-C", value: 70, percent: 70 },
  ],
  updatedAt: now.toISOString(),
};
test("activity cards show real commit and PR metrics without a follower count or grade", () => {
  const svg = renderCard(profile, { type: "stats" });
  assert.match(svg, /37/);
  assert.match(svg, /75.0%/);
  assert.match(svg, /Contribution streak/);
  assert.ok(!svg.includes("99999"));
  assert.ok(!svg.includes("A+"));
  assert.match(svg, /Public commits · 365d/);
});
test("language colors are distinct and eight bar rows have separate labels and tracks", () => {
  assert.notEqual(languageColors.Java, languageColors["Objective-C"]);
  assert.equal(languageColors["Objective-C"], "#4DA8FF");
  const p = {
    ...profile,
    languages: Array.from({ length: 8 }, (_, i) => ({
      name: `Language ${i}`,
      value: 10,
      percent: 12.5,
    })),
  };
  const svg = renderCard(p, { type: "languages", chart: "bar", count: 8 });
  const ys = [
    ...svg.matchAll(/<rect x="24" y="([\d.]+)" width="452" height="6"/g),
  ].map((m) => Number(m[1]));
  assert.equal(ys.length, 8);
  for (let i = 1; i < ys.length; i++) assert.ok(ys[i] - ys[i - 1] >= 25);
  assert.ok(!svg.includes('<text x="24" y="281"'));
  assert.deepEqual(cardDimensions("languages"), { width: 500, height: 360 });
});
