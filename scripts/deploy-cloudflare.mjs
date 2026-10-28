import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
// Build output uses paths relative to dist/server. Keep the standalone config
// beside it so Worker modules and assets resolve exactly as in the verified build.
const file = new URL("../dist/server/wrangler.json", import.meta.url);
let config;
try {
  config = JSON.parse(await readFile(file, "utf8"));
} catch {
  throw new Error("Run npm run build before deploying.");
}
const name = process.env.WORKER_NAME || "halil-hodja";
if (!/^[a-z][a-z0-9-]{0,62}$/.test(name))
  throw new Error("WORKER_NAME must be a lowercase Cloudflare Worker name.");
config.name = name;
config.topLevelName = name;
config.workers_dev = true;
const standalone = new URL(
  "../dist/server/wrangler.standalone.json",
  import.meta.url,
);
await writeFile(standalone, JSON.stringify(config, null, 2));
const cli = new URL(
  "../node_modules/wrangler/bin/wrangler.js",
  import.meta.url,
);
const result = spawnSync(
  process.execPath,
  [
    cli.pathname,
    "deploy",
    "--config",
    standalone.pathname,
    ...process.argv.slice(2),
  ],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
