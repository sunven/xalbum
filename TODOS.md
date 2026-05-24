# TODOs

## Scheduled showcase cache refresh

What: Add a scheduled Worker refresh that iterates `githubShowcaseConfigs` and
pre-populates the `SHOWCASE_CACHE` KV payload for each atlas page.

Why: When XAlbum has more atlas pages or public traffic, moving GitHub/npm
fan-out off the visitor request path will make `/sdd`, `/ai-to-ui`, and future
map pages faster and less sensitive to external API latency.

Context: The first cache implementation should stay request-driven Cloudflare
KV aggregate caching with soft TTL and stale fallback. Scheduled refresh is a
later upgrade path, not part of the first implementation, because it adds cron
configuration, refresh observability, and extra failure handling before the
traffic level requires it.

Depends on: The request-driven `SHOWCASE_CACHE` payload format and cache key
helpers should land first so the scheduled job can reuse them.
