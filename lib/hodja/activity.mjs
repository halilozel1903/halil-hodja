// Inclusive UTC date windows. Each daily contribution belongs to exactly one
// window; 9 nodes covers every day in a maximum-7-day window.
export function activityWindows(now = new Date()) {
  const end = new Date(now);
  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() - 364);
  const windows = [];
  for (let cursor = start.getTime(); cursor <= end.getTime(); ) {
    const next = cursor + 7 * 86400000;
    windows.push({
      from: new Date(cursor).toISOString(),
      to: new Date(Math.min(next - 1, end.getTime())).toISOString(),
    });
    cursor = next;
  }
  return windows;
}

export async function collectActivity(username, get, now = new Date()) {
  const countsQuery = `query PublicPullRequests($authored:String!,$merged:String!,$reviewed:String!){
    authored:search(query:$authored,type:ISSUE,first:1){issueCount}
    merged:search(query:$merged,type:ISSUE,first:1){issueCount}
    reviewed:search(query:$reviewed,type:ISSUE,first:1){issueCount}
  }`;
  const { data: counts } = await get("/graphql", {
    query: countsQuery,
    variables: {
      authored: `is:public is:pr author:${username}`,
      merged: `is:public is:pr is:merged author:${username}`,
      reviewed: `is:public is:pr reviewed-by:${username} -author:${username}`,
    },
  });
  const c = counts.data;
  if (
    !c ||
    ![
      c.authored?.issueCount,
      c.merged?.issueCount,
      c.reviewed?.issueCount,
    ].every((n) => Number.isInteger(n) && n >= 0)
  )
    return null;
  const windows = activityWindows(now);
  const fields = windows
    .map(
      (
        w,
        i,
      ) => `w${i}:contributionsCollection(from:${JSON.stringify(w.from)},to:${JSON.stringify(w.to)}){
    totalRepositoriesWithContributedCommits
    commitContributionsByRepository(maxRepositories:100){
      repository{isPrivate}
      contributions(first:9){pageInfo{hasNextPage} nodes{commitCount occurredAt}}
    }
  }`,
    )
    .join("\n");
  const { data: response } = await get("/graphql", {
    query: `query PublicCommitDays($login:String!){user(login:$login){${fields}}}`,
    variables: { login: username },
  });
  const user = response.data?.user;
  let total = 0,
    complete = Boolean(user);
  const daily = new Map();
  for (let i = 0; i < windows.length; i++) {
    const w = user?.[`w${i}`];
    if (!w || w.totalRepositoriesWithContributedCommits > 100) {
      complete = false;
      continue;
    }
    for (const r of w.commitContributionsByRepository) {
      if (r.repository.isPrivate) continue;
      if (r.contributions.pageInfo.hasNextPage) {
        complete = false;
        continue;
      }
      for (const day of r.contributions.nodes) {
        if (!Number.isInteger(day.commitCount) || day.commitCount < 0)
          complete = false;
        else {
          const timestamp = Date.parse(day.occurredAt);
          if (!Number.isFinite(timestamp)) {
            complete = false;
            continue;
          }
          const date = new Date(timestamp).toISOString().slice(0, 10);
          total += day.commitCount;
          daily.set(date, (daily.get(date) || 0) + day.commitCount);
        }
      }
    }
  }
  const streaks = commitStreaks(Object.fromEntries(daily), now);
  return {
    ...(complete
      ? streaks
      : {
          currentStreakDays: null,
          longestStreakDays: null,
          activeCommitDays: null,
        }),
    dailyPublicCommits: complete ? Object.fromEntries(daily) : null,
    publicCommits: complete ? total : null,
    pullRequests: c.authored.issueCount,
    mergedPullRequests: c.merged.issueCount,
    reviewedPullRequests: c.reviewed.issueCount,
    commitCoverageComplete: complete,
    period: { from: windows[0].from, to: windows.at(-1).to, days: 365 },
    definition:
      "public-default-branch-commit-contributions; public-authored-PRs-all-time; distinct-public-PRs-reviewed-all-time",
  };
}

export function commitStreaks(daily, now = new Date()) {
  const today = new Date(now).toISOString().slice(0, 10);
  const yesterday = new Date(Date.parse(today + "T00:00:00Z") - 86400000)
    .toISOString()
    .slice(0, 10);
  const dates = Object.keys(daily)
    .filter((d) => daily[d] > 0 && d <= today)
    .sort();
  const active = new Set(dates);
  let current = 0,
    longest = 0,
    run = 0,
    previous = null;
  let cursor = active.has(today) ? today : yesterday;
  while (active.has(cursor)) {
    current++;
    cursor = new Date(Date.parse(cursor + "T00:00:00Z") - 86400000)
      .toISOString()
      .slice(0, 10);
  }
  for (const d of dates) {
    const time = Date.parse(d + "T00:00:00Z");
    run = previous !== null && time - previous === 86400000 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = time;
  }
  return {
    currentStreakDays: current,
    longestStreakDays: longest,
    activeCommitDays: dates.length,
  };
}
