# Data accuracy audit — 2026-10-28

This is a dated audit, not a promise that these numbers stay unchanged. The live application always fetches GitHub; these files are evidence and documentation fixtures only. They are never imported as runtime fallback data.

## Independent checks

The application queried GitHub REST endpoints without a token. A separate authenticated GitHub CLI process fetched the profile and repositories, then independently aggregated the result. It did not call the application's aggregation module. Both methods matched:

| Measurement | App | Independent GitHub result |
| --- | ---: | ---: |
| Public repositories scanned | 239 | 239 |
| Included repositories | 198 | 198 |
| Stars across included repositories | 1,174 | 1,174 |
| Forks across included repositories | 299 | 299 |
| Profile followers | 770 | 770 |

Filters: forked and archived repositories excluded; no named exclusions. Of the 198 included repositories, 195 had a primary language.

| Primary language | Repository count | Share of 195 |
| --- | ---: | ---: |
| Kotlin | 87 | 44.6154% |
| Swift | 86 | 44.1026% |
| Java | 16 | 8.2051% |
| JavaScript | 2 | 1.0256% |
| C# | 2 | 1.0256% |
| Objective-C | 2 | 1.0256% |

The full primary-language distribution, including every language and its percentage, matched. The application dataset was captured at `2026-10-28T17:07:27.760Z`; the independent script passed at `2026-10-28T17:15:10.740Z`. See [the JSON record](verification.json).

The byte-mode dataset was captured at `2026-10-28T17:17:00.070Z`. A separate check at `2026-10-28T17:17:46.173Z` fetched language bytes individually for all 20 repositories declared in that dataset. Every language byte count and resulting percentage matched. See [sample names and bytes](verification-bytes.json). Sample membership is recorded because repositories can be pushed or their metadata can change between scans.

## Reproduce

```sh
# Authenticate GitHub CLI separately, then compare against the public app:
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site

# Audit language bytes for the exact declared sample:
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site bytes
```

A changed count is not automatically an application bug: compare the dataset's `updatedAt` with the independent check time. Successful data is cached for one hour and GitHub responses are not atomic across requests. The verifier deliberately fails on differences rather than declaring an unchecked result accurate.

The native automated test suite additionally checks filtering, all language denominators, byte summation, request bounds, pagination/caps, concurrent cache reuse, HTTP failures, escaping, and invalid input. Unit-test fixtures are synthetic inputs used only by tests, not production card data.
