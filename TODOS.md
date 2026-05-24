# TODOs

## Completed: scheduled showcase cache refresh

Done: Added a scheduled Worker refresh that iterates `githubShowcaseConfigs`
and pre-populates the `SHOWCASE_CACHE` KV payload for each atlas page.

Why: When XAlbum has more atlas pages or public traffic, moving GitHub/npm
fan-out off the visitor request path will make `/sdd`, `/ai-to-ui`, and future
map pages faster and less sensitive to external API latency.

Implementation: `src/worker.ts` proxies the TanStack Start fetch handler and
adds a Cloudflare `scheduled` handler. `wrangler.jsonc` runs it every 30
minutes with `*/30 * * * *`, and each run prewarms one atlas page in rotation.

Safety: Empty GitHub aggregation results are skipped so scheduled refreshes do
not overwrite the last usable payload.
