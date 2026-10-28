<div align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="Halil Hodja logo" />
  <h1>Halil Hodja</h1>
  <p><strong>Your GitHub, beautifully told.</strong></p>
  <p>Thoughtful profile cards. Transparent numbers. Yours to build on.</p>
  <p>
    <a href="https://halil-hodja.halilozel1903.chatgpt.site">Open the card studio</a> ·
    <a href="README.tr.md">Türkçe</a> ·
    <a href="#api">API</a> ·
    <a href="#self-hosting">Self-hosting</a> ·
    <a href="CONTRIBUTING.md">Contribute</a>
  </p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-71915e" alt="MIT license" /></a>
    <a href="https://github.com/halilozel1903/halil-hodja/actions/workflows/ci.yml"><img src="https://github.com/halilozel1903/halil-hodja/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <img src="https://img.shields.io/badge/made_for-READMEs-42634b" alt="Made for READMEs" />
  </p>
  <img src="docs/preview-overview.svg" width="900" alt="Example Halil Hodja card using a real public GitHub snapshot, captured 2026-10-28. See Data accuracy for scope." />
</div>

## Why Halil Hodja?

A profile card should look good and tell the truth. Halil Hodja combines a visual card studio with a small GitHub data service: no sign-in, no fabricated contribution scores, and no mystery language percentages.

- **Six themes:** Midnight, Paper, Aurora, Ocean, Rose, Terminal.
- **Four layouts:** a card pair, statistics, languages, or an all-in-one card.
- **Live styling:** change themes, card language, and visible language count without fetching GitHub again.
- **Useful controls:** include forks, include archived repos, or exclude named repositories.
- **Two honest language metrics:** primary language per repository, or actual code bytes from an explicit sample.
- **README-ready:** Markdown, HTML, image URLs, shareable studio links, SVG downloads.
- **Built to share:** responsive English/Turkish UI, JSON API, cache reuse, meaningful errors, MIT license.

The public demo is a best-effort service. It has no availability guarantee; self-host if your profile depends on it. This project does not claim a benchmark advantage over other stats services.

## Quick start

Open the [studio](https://halil-hodja.halilozel1903.chatgpt.site), enter your GitHub username, choose a theme, and generate. Paste the snippet into your profile README.

```html
<div align="center">
  <img width="440" src="https://halil-hodja.halilozel1903.chatgpt.site/api/card?username=halilozel1903&amp;type=stats&amp;theme=midnight" alt="Halil Özel's GitHub statistics" />
  <img width="440" src="https://halil-hodja.halilozel1903.chatgpt.site/api/card?username=halilozel1903&amp;type=languages&amp;theme=midnight&amp;langs_count=4" alt="Halil Özel's top primary languages by repository" />
</div>
```

Or one wide card:

```md
[![GitHub overview](https://halil-hodja.halilozel1903.chatgpt.site/api/card?username=YOUR_USERNAME&type=overview&theme=paper)](https://github.com/YOUR_USERNAME)
```

Replace `YOUR_USERNAME`. For your own deployment, replace the origin too. SVGs work as GitHub README images without JavaScript or external fonts. GitHub's image proxy can add its own caching delay.

## Data accuracy

**Every successful live card uses GitHub API data.** There are no fallback demo numbers, invented commits, contribution ranks, or random activity charts. If GitHub fails, the API returns an error; it never silently substitutes zeros. Checked-in preview SVGs are explicitly dated snapshots, not live counters.

| Number | Meaning |
| --- | --- |
| Repositories | Included public repositories owned by the requested user or organization |
| Stars earned | Sum of `stargazers_count` on included repositories |
| Forks earned | Sum of `forks_count` on included repositories |
| Followers | GitHub's profile-wide follower count |
| Languages: `repos` | Each repository with a non-null primary language counts once; denominator is all included repositories with a primary language |
| Languages: `bytes` | Sum of GitHub language bytes in up to 20 most recently pushed eligible, non-empty repositories; denominator is all language bytes in that sample |

Forks and archived repositories are excluded by default. Exclusions apply to repository totals, stars, forks, and languages; follower count stays profile-wide. Private repositories, organization repositories the person does not own, commits, pull requests, and contribution streaks are not counted.

Showing fewer languages does **not** inflate the displayed percentages: remaining languages are shown as “Other.” Repository scanning is capped at the first 1,000 repositories in most-recently-pushed order; capped results are marked partial. The byte sample is bounded to limit GitHub API usage, and its sample size is available in JSON and on the language card. A failed byte request fails the result rather than returning incomplete success.

Successful datasets are cached for up to one hour. JSON includes `updatedAt`, `scope.scanned`, `scope.included`, `scope.languageSample`, `scope.languageRepositories`, and `scope.truncated`. Every successful API response includes `X-Hodja-Updated-At`. Styling variants reuse the same cached data. `Cache-Control` respects the remaining dataset lifetime. GitHub requests are not a transactional snapshot, so counts can change during a scan.

To audit an instance independently against GitHub CLI:

```sh
# Requires GitHub CLI authenticated separately; its token is never sent to the app.
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site
# Or audit actual bytes for the named repository sample:
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site bytes
```

This independently compares repository/star/fork/follower totals, all primary-language counts, percentages, and scan scope. If current GitHub data differs from an hourly cached result, the command fails and prints both timestamps/counts for investigation. Read [the initial accuracy check](docs/ACCURACY.md).

Sources: [GitHub repository endpoints](https://docs.github.com/en/rest/repos/repos), [repository language endpoint](https://docs.github.com/en/rest/repos/repos#list-repository-languages), [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## API

All endpoints accept `GET` and `HEAD`. Responses support public read-only CORS. Use URL encoding for query values.

| Endpoint | Returns |
| --- | --- |
| `/api/card?username=octocat&type=stats` | Statistics SVG |
| `/api/card?username=octocat&type=languages` | Language SVG |
| `/api/card?username=octocat&type=overview` | Combined SVG |
| `/api/profile?username=octocat` | Profile, aggregates, languages, scope, timestamp as JSON |
| `/api?username=octocat` | Short alias for statistics SVG |
| `/api/top-langs/?username=octocat` | Short alias for language SVG |
| `/api/health` | Service identity and health; does not query GitHub |

| Parameter | Default | Values |
| --- | --- | --- |
| `username` | Required | Valid GitHub username, max 39 characters |
| `type` | `stats` | `stats`, `languages`, `overview` |
| `theme` | `midnight` | `midnight`, `paper`, `aurora`, `ocean`, `rose`, `terminal` |
| `locale` | `en` | `en`, `tr` |
| `langs_count` | `4` | Integer, clamped to 2–8; invalid values use 4 |
| `metric` | `repos` | `repos`, `bytes` |
| `forks` | `false` | `true` includes forked repositories |
| `archived` | `false` | `true` includes archived repositories |
| `exclude` | Empty | Comma-separated case-insensitive repo names; max 30 unique names |

Unsupported theme/type/locale/metric values use their defaults. Parameters from other tools such as `count_private`, `hide`, `show_icons`, and `layout=compact` are not implemented. Use this project's documented parameters when migrating.

Errors preserve HTTP meaning: `400` invalid username, `404` user/route not found, `429` GitHub quota exceeded with `Retry-After`, `502` GitHub unavailable, `405` unsupported method. Errors use `Cache-Control: no-store`. SVG endpoints return a readable error SVG with the error status; JSON endpoints return `{ "error": "..." }`.

## Local development

Requires **Node.js 22.13+** and npm. Node 22 LTS is used in CI.

```sh
git clone https://github.com/halilozel1903/halil-hodja.git
cd halil-hodja
npm run install:ci
npm run dev
# http://127.0.0.1:5173
```

No account or token is required for public GitHub data. The installation helper preserves the checked-in lockfile and configures the platform runtime. It defaults to the portable profile outside the Sites managed environment.

```sh
npm test               # Aggregation, filters, cache, errors, escaping, API contracts
npm run typecheck
npm run build          # Client + Cloudflare Worker output in dist/
npm start              # Preview the production build locally using Wrangler
```

## Self-hosting

The supported public deployment target is **Cloudflare Workers with static assets**, built with React, Vinext, and Vite. No database is required. You do not need ChatGPT Sites to self-host.

```sh
npm run build
# Log in to your own Cloudflare account using the project's installed Wrangler:
node node_modules/wrangler/bin/wrangler.js login
npm run deploy:cloudflare
```

The deployment helper writes a standalone config alongside the build, sets the Worker name, and invokes Wrangler. To choose another name:

```sh
WORKER_NAME=my-github-cards npm run deploy:cloudflare
```

For a deployment validation without publishing:

```sh
npm run deploy:cloudflare -- --dry-run
```

Set a token on the same Worker if needed:

```sh
node node_modules/wrangler/bin/wrangler.js secret put GITHUB_TOKEN --name halil-hodja
```

For local development, create an ignored `.dev.vars` file with `GITHUB_TOKEN=...`. Use a dedicated token with access limited to public data. Never use a `NEXT_PUBLIC_` variable or put a token in a URL. All requests still use public `/users/:name/repos` endpoints and discard private repositories.

The checked-in `.openai/hosting.json` identifies the official Sites deployment. It is public metadata, not a credential, and is not used by the standalone deployment helper. If you deploy through Sites, create your **own** Site and replace `project_id` with its returned ID.

### GitHub rate limits

Unauthenticated REST requests share a 60-request/hour limit per originating IP. Authenticated requests generally have a higher limit; consult [GitHub's current limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api). A cold repository-mode scan uses one profile request plus 1–10 repository pages. Byte mode adds up to 20 language requests with concurrency four. Cache reuse reduces repeated calls for styling changes; it does not eliminate shared-service quota constraints. A deployment without a token is best suited to light use.

## Project map

```text
app/page.tsx                   Bilingual studio and export controls
app/globals.css                Responsive visual design
app/api/[[...path]]/route.ts    Worker environment adapter
lib/hodja/github.mjs           GitHub requests, validation, aggregation
lib/hodja/cards.mjs            Platform-independent SVG renderer
lib/hodja/api.mjs              API routing, cache, error responses
scripts/verify-live.mjs        Independent GitHub CLI audit
scripts/deploy-cloudflare.mjs  Standalone Worker deployment
worker/index.ts               Vinext Worker entry
scripts/vite/                 Hosting/build integrations
tests/                        Native Node correctness tests
```

## Privacy and security

No analytics or tracking scripts, cookies, database, or user accounts are added by the application. Public usernames and data are processed by the hosting service and GitHub; hosting providers may keep normal access logs. The studio loads DM Sans and Manrope from Google Fonts. Generated SVGs are self-contained and do not load remote fonts. GitHub/shields badges in this README are external images.

Tokens stay in runtime secrets, SVG text is escaped, and upstream hosts/paths are fixed. This project is independent of and not endorsed by GitHub. See [SECURITY.md](SECURITY.md).

## Contributing and license

Bug reports, themes, accessibility improvements, and careful data corrections are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under [MIT](LICENSE), with the vendored Sites integration license retained in `scripts/vite/`.

Made with care by [Halil Özel](https://github.com/halilozel1903), for the people who build things.
