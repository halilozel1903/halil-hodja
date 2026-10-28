# Contributing to Halil Hodja

Thanks for making profile cards better for everyone.

1. Open an issue for larger changes so we can discuss scope.
2. Fork the repository, create a branch, and run `npm run install:ci`.
3. Run `npm run dev` and make one focused change.
4. Run `npm test`, `npm run typecheck`, and `npm run build`.
5. Open a pull request explaining the problem, final behavior, and validation.

Data correctness is a product requirement. Never add invented statistics, silently change denominators, hide sampling, count private repositories, or turn failed GitHub requests into successful zero values. Include meaningful tests for changes to aggregation, cache boundaries, validation, and SVG escaping. A data discrepancy report should include the public username, full card parameters, response `updatedAt`, and the expected source count.

Keep core modules in `lib/hodja/` independent of React and the hosting platform. The tests use Node's built-in test runner; most contributors do not need a GitHub token. Never include tokens, local runtime state, or generated build output in a commit.

Use descriptive English commit subjects. Be kind, concrete, and respectful in discussions.
