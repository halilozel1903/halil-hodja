# Public GitHub snapshots

These are real GitHub API measurements, not fixture or fallback demo values. They are public because the application itself is public. The collector selects only public repositories owned by the requested profile and never writes authentication headers or tokens.

- `profiles.json`: profile allowlist, compiled into the server.
- `<username>.json`: schema version, original UTC collection time, public profile totals, every scanned repository's metadata and language-byte map, public-only daily commit totals, public PR counts, and anonymous public-profile calendar counts and contribution streaks, exact legacy first-100 repository names, and scan completeness.

Run `npm run data:refresh`. It uses an existing `GITHUB_TOKEN` or obtains your existing GitHub CLI credential in process memory and sends it only to `api.github.com`. Do not hand-edit measurements. The scheduled workflow uses `${{ github.token }}` with repository contents write permission to commit its public output; no personal access token secret is required.

For a fork, edit `profiles.json`, enable and run the refresh workflow, and configure runtime `SNAPSHOT_REPOSITORY=YOUR_OWNER/YOUR_REPO`. The public repository must use `main`. A configured live `GITHUB_TOKEN` takes precedence over snapshots.

The app accepts snapshots up to 24 hours old, preserving the collection timestamp. The workflow is scheduled every six hours, with normal GitHub scheduling delays possible. Expired or unavailable snapshots trigger a real API scan; failures remain errors instead of switching metrics or inventing numbers.

The public profile calendar may include anonymized private contribution counts the profile owner chose to disclose. It is fetched without credentials and contains no private repository details. Public commit totals remain public-only. Incomplete calendars yield unavailable contribution streaks.
