<div align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="Halil Hodja logo" />
  <h1>Halil Hodja</h1>
  <p><strong>Your GitHub, beautifully told.</strong></p>
  <p>Real code bytes. Transparent coverage. Beautiful README cards.</p>
  <p><a href="https://halil-hodja.halilozel1903.chatgpt.site">Card studio</a> · <a href="README.tr.md">Türkçe</a> · <a href="#api">API</a> · <a href="#self-hosting">Self-hosting</a> · <a href="CONTRIBUTING.md">Contribute</a></p>
  <p><a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-71915e" alt="MIT license" /></a> <a href="https://github.com/halilozel1903/halil-hodja/actions/workflows/ci.yml"><img src="https://github.com/halilozel1903/halil-hodja/actions/workflows/ci.yml/badge.svg" alt="CI" /></a></p>
  <img src="docs/preview-overview.svg" width="900" alt="Real GitHub snapshot, 2026-10-28. Language bytes, Readme Stats compatibility coverage, displayed-language denominator." />
</div>

## What it does

A responsive English/Turkish studio for GitHub statistics and language cards, with seven themes, Spotlight/Classic styles, donut/bar language charts, statistics/language/combined layouts, Markdown and HTML snippets, image URLs, SVG downloads, and shareable configurations. Filters include forked repositories, archived repositories, and named exclusions. There are no invented contribution scores or fallback demo numbers.

## Language percentages — the important part

**The default is code size in bytes, not repository count, file count, or lines of code.** GitHub classifies repository files into languages and reports their byte sizes. Halil Hodja sums those sizes.

The defaults reproduce the language method of [`github-readme-stats-fast`](https://github.com/Pranesh-2005/github-readme-stats-fast):

1. **Coverage: `legacy100`.** The first 100 public, owned, non-fork repositories in GitHub's default creation order; up to the largest 10 languages per repository. Archived repositories are included by default.
2. **Weight: bytes.** Sum actual language bytes across that set.
3. **Denominator: `shown`.** Sort by byte totals, select `langs_count` languages, then calculate each as a percentage of the **displayed languages' byte total**. Rounded percentages can add up to 99.99% or 100.01%.

```text
percentage = language_bytes / sum(bytes_of_displayed_languages) × 100
```

Two controls make the scope explicit:

| Control | Default | Alternative |
| --- | --- | --- |
| Repository coverage | `coverage=legacy100` — Readme Stats compatibility | `coverage=all` — every eligible repository in the scan, with every reported language |
| Percentage denominator | `percentage=shown` — displayed languages total approximately 100% | `percentage=all` — all detected languages; unshown languages remain “Other” |

`metric=repos` is an optional primary-language repository count, clearly distinct from code size. It is **not** the default. No latest-20-repository sample is used in version 1.1.

The current initial comparison matched the supplied Readme Stats card exactly: Swift **34.12%**, Kotlin **32.31%**, Java **25.19%**, Objective-C **8.37%**, for four displayed languages and compatibility coverage. These are dated verification results, not hardcoded runtime values. All-repository mode produces different percentages because it includes newer repositories outside the original first 100. See [the accuracy report](docs/ACCURACY.md).

Reference implementations: [language fetcher](https://github.com/Pranesh-2005/github-readme-stats-fast/blob/main/src/fetchers/top-languages.js), [visible-language denominator](https://github.com/Pranesh-2005/github-readme-stats-fast/blob/main/src/cards/top-languages.js).

## Add cards to your README

Use the [studio](https://halil-hodja.halilozel1903.chatgpt.site) or paste:

```html
<div align="center">
  <img height="280" src="https://halil-hodja.halilozel1903.chatgpt.site/api/card?username=halilozel1903&amp;type=stats&amp;v=spacing-2&amp;theme=midnight" alt="GitHub statistics" />
  &emsp;&emsp;
  <img height="280" src="https://halil-hodja.halilozel1903.chatgpt.site/api/card?username=halilozel1903&amp;type=languages&amp;v=spacing-2&amp;theme=midnight&amp;coverage=legacy100&amp;percentage=shown&amp;langs_count=4" alt="Top languages by code bytes — Readme Stats compatibility" />
</div>
```

Replace the username. For one wide card use `type=overview`. SVGs work without JavaScript or external fonts. GitHub's image proxy may add its own cache delay.

## Developer activity cards

Spotlight cards prioritize work over audience size:

- **Public commits · 365d:** GitHub-credited commit contributions to public repositories across 365 UTC calendar dates, including the collection date. This follows GitHub contribution rules, not every commit on every branch.
- **Contribution streak:** consecutive active dates in the anonymous public GitHub profile calendar, including commits, PRs, reviews and any anonymized private contribution counts the profile owner has made public. This matches the visible contribution graph rather than only public commits. Today or yesterday may end the current streak (UTC).
- **Best streak · 365d:** longest contribution streak within the last 365 dates, not an all-time record. **Active commit days** separately counts dates with public commits.
- **Pull requests:** all-time public PRs authored by the user, including other users' public repositories.
- **PR merge rate:** merged public authored PRs divided by all public authored PRs; unavailable when there are no PRs.

PR counts are all-time; commit and contribution-streak metrics use a 365-date window. The ring compares the current contribution streak with the best contribution streak in that window. There is no opaque A+/A grade or official GitHub ranking claim.

Private repository nodes are filtered out before counting public commits. The contribution calendar is fetched anonymously and may include publicly disclosed private counts; no private repository details are accessed. If the calendar is incomplete or unavailable, contribution streaks stay unavailable. Commit data is collected in non-overlapping seven-day windows; if a window exceeds GitHub's 100-repository cap or pagination is incomplete, public commit metrics are unavailable rather than fabricated. Unknown values never become successful zeros. When activity data is unavailable, cards use actual repository/star/fork/language counts. Followers remain in the backward-compatible JSON profile but are not displayed on the cards.

Repository/star/fork totals still reflect included public owned repositories. `coverage` affects languages; it does not filter account-wide PR or commit activity. The source time is preserved. Visual scope footnotes were removed from the exported cards; detailed coverage, denominators, dates and definitions remain in SVG accessibility descriptions, studio details, JSON and this guide.

## Appearance

`style=spotlight` is the default, with icon-supported activity tiles and a contribution-streak ring. `style=classic` keeps the quieter layout. `chart=donut` is the default language graphic; `chart=bar` gives each of up to eight languages its own spaced row. Java is gold (`#F7C65C`); Objective-C is blue (`#4DA8FF`).

Spotlight SVGs are **440×360** for activity, **500×360** for languages, and **960×360** for the combined layout. Classic SVGs retain 440×260 / 900×260 dimensions. Every style uses the same underlying data and percentage calculation.

Scans are capped at 1,000 repositories and mark that limit with `scope.truncated`. Compatibility mode deliberately restricts language coverage to its first-100 set and reports `scope.complete=false`. Failed language requests fail the result; they never become a successful partial sum or zero fallback.

## Data collection and freshness

A full code-size scan can exceed unauthenticated API limits. The official demo therefore uses **real, scheduled GitHub snapshots** for profiles in [`data/profiles.json`](data/profiles.json). [`Refresh public GitHub data`](.github/workflows/refresh-data.yml) runs every six hours using the short-lived GitHub Actions token. It queries public repositories and the anonymous public contribution calendar, records language bytes and activity, and commits the machine-readable data. No maintainer token is placed on the public web server.

The application reads the public snapshot from GitHub, applies the requested filters/coverage, and preserves its original `generatedAt` as `updatedAt`. Snapshots older than 24 hours are rejected, then a real live scan is attempted. The six-hour schedule is best effort; GitHub Actions may delay scheduled runs. A snapshot can therefore be older than six hours, and the timestamp remains visible in the studio. Snapshot age is never disguised as a fresh collection time.

For other profiles, or when `GITHUB_TOKEN` is configured, the server performs a live scan. An authenticated GraphQL scan gets 100 repositories with language bytes per page instead of issuing one language request for every repository. Without a token, full REST scans can exhaust the shared 60-request/hour IP quota. **No sampled or repository-count fallback is silently substituted.** Configure a token or scheduled snapshots for large profiles.

Live datasets are cached up to one hour. Snapshot reads can also be cached up to an hour, bounded by the snapshot's 24-hour acceptance window. Edge-cache failure falls back to bounded in-memory caching. Every successful API response includes `X-Hodja-Updated-At`; JSON also exposes source, coverage, repository names, filters, completeness, and refresh schedule.

## Verify the numbers independently

Requires a separately authenticated [GitHub CLI](https://cli.github.com/). Its credential goes only to GitHub, never to the app.

```sh
# Default compatibility coverage and bytes; also checks actual SVG percentages:
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site

# Full repository coverage, independently summing each repo's REST language bytes:
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site bytes all
```

The verifier compares totals, raw language measurements, coverage, JSON percentages, and displayed SVG percentages. A timestamp/count difference fails the check for investigation. No fixed expected user statistics are used in production or unit tests. [Audit details](docs/ACCURACY.md).

## API

`GET` and `HEAD`; public read-only CORS. Errors are not cached.

| Endpoint | Output |
| --- | --- |
| `/api/card?username=octocat&type=stats` | Statistics SVG |
| `/api/card?username=octocat&type=languages` | Language SVG |
| `/api/card?username=octocat&type=overview` | Combined SVG |
| `/api/profile?username=octocat` | Profile, raw language totals, scope, timestamp as JSON |
| `/api?username=octocat` | Statistics alias |
| `/api/top-langs/?username=octocat` | Languages alias |
| `/api/health` | Service status; does not query GitHub |

| Parameter | Default | Accepted values |
| --- | --- | --- |
| `username` | Required | Valid GitHub username, max 39 characters |
| `type` | `stats` | `stats`, `languages`, `overview` |
| `theme` | `midnight` | `midnight`, `radical`, `paper`, `aurora`, `ocean`, `rose`, `terminal` |
| `style` | `spotlight` | `spotlight`, `classic` |
| `chart` | `donut` | `donut`, `bar` (Spotlight) |
| `locale` | `en` | `en`, `tr` |
| `langs_count` | `4` | Integer clamped to 2–8 |
| `metric` | `bytes` | `bytes`, `repos` |
| `coverage` | `legacy100` | `legacy100`, `all` |
| `percentage` | `shown` | `shown`, `all` |
| `forks` | `false` | `true` includes forks in full-coverage language mode and statistics; compatibility language coverage always excludes forks |
| `archived` | `true` | `false` excludes archived repos |
| `exclude` | Empty | Comma-separated case-insensitive names; max 30 |

`percentage` changes SVG presentation; JSON `languages[].percent` always uses **all detected languages within the selected repository coverage**. The raw byte values never change when the visible language count changes. API aliases and studio exports use the same renderer.

Unknown rendering options use defaults. Other projects' `count_private`, `hide`, `show_icons`, or `layout=compact` are not implemented. Errors: `400` invalid input, `404` unknown user/route, `429` quota with `Retry-After`, `502` upstream/incomplete scan, `405` unsupported method.

## Local development

Node.js **22.13+** and npm; Node 22 is used in CI.

```sh
git clone https://github.com/halilozel1903/halil-hodja.git
cd halil-hodja
npm run install:ci
npm run dev
# http://127.0.0.1:5173
npm test
npm run typecheck
npm run build
npm start
```

## Self-hosting

React + Vinext + Vite, deployed as a Cloudflare Worker with static assets. No database or ChatGPT Sites account is required.

```sh
npm run build
node node_modules/wrangler/bin/wrangler.js login
npm run deploy:cloudflare
# Optional name or validation without publication:
WORKER_NAME=my-github-cards npm run deploy:cloudflare
npm run deploy:cloudflare -- --dry-run
```

For live authenticated scans, add a dedicated public-data token as a runtime secret:

```sh
node node_modules/wrangler/bin/wrangler.js secret put GITHUB_TOKEN --name halil-hodja
```

For local development use an ignored `.dev.vars`. Never use `NEXT_PUBLIC_*`, URL parameters, browser storage, or committed files for a token.

To use your own scheduled snapshots: fork the repo, edit `data/profiles.json`, enable Actions, and run the refresh workflow. Configure runtime `SNAPSHOT_REPOSITORY=YOUR_OWNER/YOUR_REPO` (public repository, branch `main`). `npm run data:refresh` can also collect locally using `GITHUB_TOKEN` or your authenticated GitHub CLI; credentials stay in process memory. See [data/README.md](data/README.md).

`.openai/hosting.json` is public metadata for the official Sites deployment, not a credential. The standalone Cloudflare helper does not use its project identity. Create your own Site identity if publishing through Sites.

## Project map

```text
app/                         Bilingual studio and API environment adapter
lib/hodja/github.mjs         Public collection, coverage and byte aggregation
lib/hodja/cards.mjs          SVG styles, icons, charts and percentage denominator
lib/hodja/activity.mjs       Public commit dates and PR activity
lib/hodja/calendar.mjs       Anonymous public profile contribution streaks
lib/hodja/api.mjs            Cache, routing and error contracts
data/                        Public, timestamped GitHub snapshots
scripts/refresh-data.mjs     Authenticated snapshot collector
scripts/verify-live.mjs      Independent GitHub CLI audit
scripts/deploy-cloudflare.mjs Standalone deployment
worker/ and scripts/vite/    Runtime/build integration
tests/                       Native Node correctness tests
```

## Privacy, contributions and license

No application analytics, tracking scripts, database, accounts, or cookies. GitHub and hosting providers process public usernames and may keep ordinary access logs. The studio uses Google Fonts; generated SVGs are self-contained. The public demo is best effort, without an availability guarantee. Independent of GitHub; not endorsed by GitHub.

[Contribute](CONTRIBUTING.md) · [Security](SECURITY.md) · [MIT license](LICENSE). The vendored Sites integration retains its upstream license. Made by [Halil Özel](https://github.com/halilozel1903).
