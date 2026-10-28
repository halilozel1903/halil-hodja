declare namespace Cloudflare {
  interface Env {
    GITHUB_TOKEN?: string;
    SNAPSHOT_REPOSITORY?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
