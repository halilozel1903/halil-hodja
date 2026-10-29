# Language accuracy audit — version 1.1, 2026-10-28

The default method changed at the user's request: **actual code bytes**, with the same repository selection and displayed-language denominator as `github-readme-stats-fast`. The previous primary-language repository count and latest-20 byte sample are no longer the default. There is no 20-repository byte-sample mode in 1.1.

## Exact comparison with the supplied card

The reference source queries the first 100 owned, non-forked repositories, takes their largest 10 languages each, and sums language bytes. Its renderer selects the visible languages before computing the percentage denominator.

Sources: [reference fetcher](https://github.com/Pranesh-2005/github-readme-stats-fast/blob/main/src/fetchers/top-languages.js), [reference renderer](https://github.com/Pranesh-2005/github-readme-stats-fast/blob/main/src/cards/top-languages.js).

An authenticated public-only GitHub collection on 2026-10-28 produced these independently reproducible results:

| Language | Supplied card | Halil Hodja compatibility mode |
| --- | ---: | ---: |
| Swift | 34.12% | 34.12% |
| Kotlin | 32.31% | 32.31% |
| Java | 25.19% | 25.19% |
| Objective-C | 8.37% | 8.37% |

Configuration: `metric=bytes&coverage=legacy100&percentage=shown&langs_count=4`. Percentages use the displayed four languages' total bytes. Repository names and every raw byte measurement are in [the timestamped public source](../data/halilozel1903.json).

The full scan contained 240 public repositories; 199 were non-forked. Repository/star/fork/follower totals were 199 / 1,174 / 299 / 770 at collection time. Compatibility mode restricts language coverage, not the statistics card totals.

## Broader coverage

With `coverage=all`, all 199 eligible repositories contributed their language bytes. On the same snapshot, the top-four normalized display was Swift 51.52%, Kotlin 38.03%, Shell 5.53%, Java 4.92%. This is a different scope, not a random or fabricated result: newer repositories outside the reference's first 100 change the distribution.

The snapshot, preview SVGs, and verification records are dated measurements. They are not imported as hardcoded display percentages. Raw snapshots are collected by GitHub API and updated through Actions; every displayed percentage is recalculated from their byte totals.

## Reproduce and detect differences

```sh
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site bytes all
```

The first command independently queries GitHub's reference first-100 language data and checks the actual SVG percentages. The second sums each eligible repository's REST language bytes independently. Both compare metadata totals and timestamps. A changed repository, new commit, delayed Linguist analysis, or delayed scheduled refresh can cause a genuine timestamp mismatch; the verifier fails on differences instead of approving unchecked data.

Tests cover byte aggregation, compatibility scope, all-repository scans beyond 20 repositories, shown/all denominators, public-only GraphQL collection, snapshot provenance, cache aging, invalid inputs, SVG escaping, and error handling. Test fixtures are synthetic unit-test inputs only; they never feed production cards.

## Public activity — version 1.2, 2026-10-29

The timestamped [activity record](verification-activity.json) contains both public commit-only measurements and anonymous public profile calendar measurements. At collection on 2026-10-29 the profile calendar showed **2,769 visible contributions and a 34-day current contribution streak**. The previous 2-day value counted only public commit dates; it did not describe the profile contribution graph. The card now labels and displays **Contribution streak** from the public calendar.

Public commits are summed from public repository nodes in non-overlapping seven-day windows; private nodes are discarded. Caps or incomplete connections make public commit values unavailable. The contribution calendar is fetched anonymously and can include PRs, reviews and anonymized private counts that the owner has made public. It never exposes private repository names or contents. An incomplete calendar makes the contribution streak unavailable rather than falling back to a differently defined commit streak. Current streaks allow today/yesterday grace in UTC; best streaks cover 365 dates. GitHub's displayed calendar total includes its visible week-padding dates, while streak calculations use the last 365 dates.

PR counts are all-time public search results. These values are collected data, not hardcoded card values, and change with activity and refreshes. See [GitHub contribution rules](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference).

The reference tool's A+/A labels use a [custom ranking formula](https://github.com/Pranesh-2005/github-readme-stats-fast/blob/main/src/calculateRank.js). Halil Hodja uses its ring for an observed contribution streak without claiming an official GitHub skill grade.
