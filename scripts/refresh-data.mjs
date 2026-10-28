import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { collectSnapshot, validateUsername } from "../lib/hodja/github.mjs";
// Tokens remain in process memory and go only to api.github.com.
const token =
  process.env.GITHUB_TOKEN ||
  execFileSync("gh", ["auth", "token"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
const names = process.argv.slice(2).length
  ? process.argv.slice(2)
  : JSON.parse(
      await readFile(new URL("../data/profiles.json", import.meta.url), "utf8"),
    );
await mkdir(new URL("../data/", import.meta.url), { recursive: true });
for (const name of names) {
  const username = validateUsername(name);
  const snapshot = await collectSnapshot(username, { token });
  await writeFile(
    new URL(`../data/${username}.json`, import.meta.url),
    JSON.stringify(snapshot, null, 2) + "\n",
  );
  console.log(
    `${username}: ${snapshot.repos.length} public repositories, full language-byte data, ${snapshot.generatedAt}`,
  );
}
