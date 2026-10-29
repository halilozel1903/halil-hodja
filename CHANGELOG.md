# Changelog

## Unreleased

- Add more space between activity values and captions, including the streak ring label.
- Export HTML card pairs at equal heights with an explicit gap; add a rendering revision to new image URLs to avoid older GitHub image caches.

## 1.2.0 — 2026-10-29

- Redesign the studio with a dark palette, live hero card, seven themes and responsive controls.
- Add Spotlight activity cards with public commit counts, public-profile contribution streaks, active commit days, authored PRs and merge rate; remove displayed follower counts.
- Collect public-only activity in bounded UTC windows and keep all-time PR scope explicit.
- Enlarge language cards, add donut/bar charts, separate Java and Objective-C colors, and fix eight-language row spacing.
- Add Classic style compatibility and preserve style/chart choices in exports and shared links.
- Remove visible scope footnotes from cards, retaining details in metadata and documentation.

## 1.1.0 — 2026-10-28

- Use real code bytes by default with exact Readme Stats first-100 compatibility coverage.
- Normalize visible languages by their byte total by default; offer all-language denominator and full-repository coverage explicitly.
- Remove the 20-repository byte sample; retain primary-language counts as an optional metric.
- Add public-only, paginated GraphQL collection and scheduled, timestamped GitHub Actions snapshots.
- Update English/Turkish documentation, examples, previews, independent SVG verification, and correctness tests.

## 1.0.0 — 2026-10-28

- Live GitHub card studio with six themes, English and Turkish UI.
- Statistics, languages, paired previews, and an all-in-one SVG.
- Primary-language repository counts and explicitly sampled language-byte mode.
- Fork/archive filters, repository exclusions, configurable visible languages.
- Markdown/HTML/image URLs, shareable studio links, SVG downloads.
- Public JSON and SVG endpoints, cache reuse, bounded scans, and upstream error handling.
- Correctness tests, independent live-verification tool, CI, MIT license, and self-hosting guide.
