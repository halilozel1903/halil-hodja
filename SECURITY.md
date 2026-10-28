# Security

Please report security vulnerabilities privately through this repository's GitHub **Security → Report a vulnerability** feature when available. Otherwise contact the maintainer through the public contact method on [their GitHub profile](https://github.com/halilozel1903). Do not publish tokens or exploit details in a public issue.

Tokens belong in runtime secrets. Never place them in URLs, browser storage, `NEXT_PUBLIC_*` variables, screenshots, or README snippets. Use a dedicated token with access limited to public data; the application never needs access to private repositories.

The API accepts validated GitHub usernames and fixed `api.github.com` paths. It does not fetch arbitrary visitor-provided URLs. SVG text is XML escaped. The public demo is a best-effort shared service; self-host for control over rate limits and availability.
