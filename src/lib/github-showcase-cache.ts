import type { GithubShowcaseConfig } from "@/lib/github-showcase-config"
import type { GithubProjectsData } from "@/lib/github-showcase-data"

const CACHE_VERSION = 1
const FRESH_TTL_MS = 45 * 60 * 1000
const STALE_TTL_MS = 24 * 60 * 60 * 1000
const REFRESH_MARKER_TTL_MS = 2 * 60 * 1000
const KV_EXPIRATION_BUFFER_MS = 5 * 60 * 1000

export const GITHUB_SHOWCASE_CACHE_EXPIRATION_TTL_SECONDS = Math.ceil(
  (STALE_TTL_MS + KV_EXPIRATION_BUFFER_MS) / 1000
)

export type GithubShowcaseCacheStatus =
  | "disabled"
  | "hit"
  | "miss"
  | "stale_refresh_started"
  | "stale_refresh_skipped"
  | "refresh_error"

export type GithubShowcaseCachePayload = {
  version: typeof CACHE_VERSION
  data: GithubProjectsData
  createdAt: string
  refreshAfter: string
  expiresAt: string
  refreshingUntil?: string
}

export type GithubShowcaseCacheLogger = (event: {
  pageId: string
  cacheKey: string
  status: GithubShowcaseCacheStatus | "write_error" | "read_error"
  ageSeconds?: number
  durationMs?: number
  projectCount?: number
  error?: unknown
}) => void

export type GithubShowcaseBackgroundTaskScheduler = (
  task: Promise<unknown>
) => void

export type GithubShowcaseKvNamespace = {
  get(key: string): Promise<string | null>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>
}

export type GithubShowcaseCacheStore = {
  getPayload(key: string): Promise<GithubShowcaseCachePayload | undefined>
  putPayload(key: string, payload: GithubShowcaseCachePayload): Promise<void>
}

export type GithubShowcaseCacheResult = {
  data: GithubProjectsData
  status: GithubShowcaseCacheStatus
  cacheKey: string
  durationMs: number
}

type CacheOptions = {
  config: GithubShowcaseConfig
  cache?: GithubShowcaseCacheStore
  fetchFresh: () => Promise<GithubProjectsData>
  scheduleBackgroundTask?: GithubShowcaseBackgroundTaskScheduler
  now?: () => number
  logger?: GithubShowcaseCacheLogger
}

export class GithubShowcaseKvCache implements GithubShowcaseCacheStore {
  constructor(private readonly kv: GithubShowcaseKvNamespace) {}

  async getPayload(key: string) {
    const cachedValue = await this.kv.get(key)
    return parseGithubShowcaseCachePayload(cachedValue)
  }

  async putPayload(key: string, payload: GithubShowcaseCachePayload) {
    await this.kv.put(key, JSON.stringify(payload), {
      expirationTtl: GITHUB_SHOWCASE_CACHE_EXPIRATION_TTL_SECONDS,
    })
  }
}

export async function getDefaultGithubShowcaseCache() {
  const injectedKv = getShowcaseCacheBinding(globalThis)
  if (injectedKv) {
    return new GithubShowcaseKvCache(injectedKv)
  }

  try {
    const workers = (await import("cloudflare:workers")) as {
      env?: Record<string, unknown>
    }
    const kv = getShowcaseCacheBinding(workers.env)
    return kv ? new GithubShowcaseKvCache(kv) : undefined
  } catch {
    return undefined
  }
}

export async function getDefaultGithubShowcaseBackgroundTaskScheduler(): Promise<
  GithubShowcaseBackgroundTaskScheduler | undefined
> {
  try {
    const workers = (await import("cloudflare:workers")) as {
      waitUntil?: (task: Promise<unknown>) => void
    }
    if (typeof workers.waitUntil === "function") {
      return (task) => workers.waitUntil?.(task)
    }
  } catch {
    return undefined
  }

  return undefined
}

export async function getGithubShowcaseCachedData({
  config,
  cache,
  fetchFresh,
  scheduleBackgroundTask,
  now = Date.now,
  logger,
}: CacheOptions): Promise<GithubShowcaseCacheResult> {
  const startedAt = now()
  const cacheKey = getGithubShowcaseCacheKey(config)

  if (!cache) {
    const data = await fetchFresh()
    return buildResult({
      data,
      status: "disabled",
      cacheKey,
      startedAt,
      now,
      logger,
      config,
    })
  }

  let cachedPayload: GithubShowcaseCachePayload | undefined
  try {
    cachedPayload = await cache.getPayload(cacheKey)
  } catch (error) {
    logger?.({
      pageId: config.pageId,
      cacheKey,
      status: "read_error",
      error,
    })
  }

  const payloadState = cachedPayload
    ? getCachePayloadState(cachedPayload, now())
    : "missing"

  if (cachedPayload) {
    if (payloadState === "fresh") {
      return buildResult({
        data: cachedPayload.data,
        status: "hit",
        cacheKey,
        startedAt,
        now,
        logger,
        config,
        cachedPayload,
      })
    }

    if (payloadState === "stale") {
      if (isRefreshInProgress(cachedPayload, now())) {
        return buildResult({
          data: cachedPayload.data,
          status: "stale_refresh_skipped",
          cacheKey,
          startedAt,
          now,
          logger,
          config,
          cachedPayload,
        })
      }

      const markedPayload = markRefreshInProgress(cachedPayload, now())
      try {
        await cache.putPayload(cacheKey, markedPayload)
        const refreshTask = refreshGithubShowcaseCache({
          config,
          cache,
          cacheKey,
          previousPayload: markedPayload,
          fetchFresh,
          now,
          logger,
        })
        if (scheduleBackgroundTask) {
          scheduleBackgroundTask(refreshTask)
        } else {
          void refreshTask
        }
      } catch (error) {
        logger?.({
          pageId: config.pageId,
          cacheKey,
          status: "write_error",
          error,
        })
      }

      return buildResult({
        data: cachedPayload.data,
        status: "stale_refresh_started",
        cacheKey,
        startedAt,
        now,
        logger,
        config,
        cachedPayload,
      })
    }
  }

  let data: GithubProjectsData
  try {
    data = await fetchFresh()
  } catch (error) {
    if (cachedPayload && payloadState === "stale") {
      return buildResult({
        data: cachedPayload.data,
        status: "refresh_error",
        cacheKey,
        startedAt,
        now,
        logger,
        config,
        cachedPayload,
        error,
      })
    }

    throw error
  }

  if (isCacheableGithubShowcaseData(data)) {
    try {
      await writeGithubShowcaseCachePayload({
        cache,
        cacheKey,
        data,
        nowMs: now(),
      })
    } catch (error) {
      logger?.({
        pageId: config.pageId,
        cacheKey,
        status: "write_error",
        error,
      })
    }
  }

  return buildResult({
    data,
    status: "miss",
    cacheKey,
    startedAt,
    now,
    logger,
    config,
    cachedPayload,
  })
}

export function getGithubShowcaseCacheKey(config: GithubShowcaseConfig) {
  const fingerprint = JSON.stringify(
    config.repoConfigs.map((repoConfig) => ({
      id: repoConfig.id,
      npmPackage: repoConfig.npmPackage ?? null,
    }))
  )

  return `github-showcase:v${CACHE_VERSION}:${config.pageId}:${hashString(
    fingerprint
  )}`
}

export function parseGithubShowcaseCachePayload(
  cachedValue: string | null
): GithubShowcaseCachePayload | undefined {
  if (!cachedValue) {
    return undefined
  }

  try {
    const parsed = JSON.parse(cachedValue)
    if (!isGithubShowcaseCachePayload(parsed)) {
      return undefined
    }
    return parsed
  } catch {
    return undefined
  }
}

export function createGithubShowcaseCachePayload({
  data,
  nowMs,
}: {
  data: GithubProjectsData
  nowMs: number
}): GithubShowcaseCachePayload {
  return {
    version: CACHE_VERSION,
    data,
    createdAt: new Date(nowMs).toISOString(),
    refreshAfter: new Date(nowMs + FRESH_TTL_MS).toISOString(),
    expiresAt: new Date(nowMs + STALE_TTL_MS).toISOString(),
  }
}

export function isCacheableGithubShowcaseData(data: GithubProjectsData) {
  return data.projects.length > 0
}

async function refreshGithubShowcaseCache({
  config,
  cache,
  cacheKey,
  previousPayload,
  fetchFresh,
  now,
  logger,
}: {
  config: GithubShowcaseConfig
  cache: GithubShowcaseCacheStore
  cacheKey: string
  previousPayload: GithubShowcaseCachePayload
  fetchFresh: () => Promise<GithubProjectsData>
  now: () => number
  logger?: GithubShowcaseCacheLogger
}) {
  try {
    const data = await fetchFresh()
    if (!isCacheableGithubShowcaseData(data)) {
      return
    }

    await writeGithubShowcaseCachePayload({
      cache,
      cacheKey,
      data,
      nowMs: now(),
    })
  } catch (error) {
    logger?.({
      pageId: config.pageId,
      cacheKey,
      status: "refresh_error",
      ageSeconds: getPayloadAgeSeconds(previousPayload, now()),
      error,
    })
  }
}

async function writeGithubShowcaseCachePayload({
  cache,
  cacheKey,
  data,
  nowMs,
}: {
  cache: GithubShowcaseCacheStore
  cacheKey: string
  data: GithubProjectsData
  nowMs: number
}) {
  await cache.putPayload(
    cacheKey,
    createGithubShowcaseCachePayload({ data, nowMs })
  )
}

function buildResult({
  data,
  status,
  cacheKey,
  startedAt,
  now,
  logger,
  config,
  cachedPayload,
  error,
}: {
  data: GithubProjectsData
  status: GithubShowcaseCacheStatus
  cacheKey: string
  startedAt: number
  now: () => number
  logger?: GithubShowcaseCacheLogger
  config: GithubShowcaseConfig
  cachedPayload?: GithubShowcaseCachePayload
  error?: unknown
}): GithubShowcaseCacheResult {
  const durationMs = Math.max(0, now() - startedAt)
  logger?.({
    pageId: config.pageId,
    cacheKey,
    status,
    ageSeconds: cachedPayload
      ? getPayloadAgeSeconds(cachedPayload, now())
      : undefined,
    durationMs,
    projectCount: data.projects.length,
    error,
  })

  return {
    data,
    status,
    cacheKey,
    durationMs,
  }
}

function getCachePayloadState(
  payload: GithubShowcaseCachePayload,
  nowMs: number
) {
  if (nowMs < new Date(payload.refreshAfter).getTime()) {
    return "fresh"
  }

  if (nowMs < new Date(payload.expiresAt).getTime()) {
    return "stale"
  }

  return "expired"
}

function isRefreshInProgress(
  payload: GithubShowcaseCachePayload,
  nowMs: number
) {
  return (
    payload.refreshingUntil !== undefined &&
    nowMs < new Date(payload.refreshingUntil).getTime()
  )
}

function markRefreshInProgress(
  payload: GithubShowcaseCachePayload,
  nowMs: number
): GithubShowcaseCachePayload {
  return {
    ...payload,
    refreshingUntil: new Date(nowMs + REFRESH_MARKER_TTL_MS).toISOString(),
  }
}

function getPayloadAgeSeconds(
  payload: GithubShowcaseCachePayload,
  nowMs: number
) {
  return Math.max(
    0,
    Math.floor((nowMs - new Date(payload.createdAt).getTime()) / 1000)
  )
}

function isGithubShowcaseCachePayload(
  value: unknown
): value is GithubShowcaseCachePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const candidate = value as Partial<GithubShowcaseCachePayload>
  return (
    candidate.version === CACHE_VERSION &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.refreshAfter === "string" &&
    typeof candidate.expiresAt === "string" &&
    (candidate.refreshingUntil === undefined ||
      typeof candidate.refreshingUntil === "string") &&
    isGithubProjectsData(candidate.data)
  )
}

function isGithubProjectsData(value: unknown): value is GithubProjectsData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const candidate = value as Partial<GithubProjectsData>
  return (
    Array.isArray(candidate.projects) &&
    (candidate.error === undefined || typeof candidate.error === "string")
  )
}

function getShowcaseCacheBinding(
  source: unknown
): GithubShowcaseKvNamespace | undefined {
  if (!source || typeof source !== "object") {
    return undefined
  }

  const binding = (source as { SHOWCASE_CACHE?: unknown }).SHOWCASE_CACHE
  if (!binding || typeof binding !== "object") {
    return undefined
  }

  const candidate = binding as Partial<GithubShowcaseKvNamespace>
  if (
    typeof candidate.get === "function" &&
    typeof candidate.put === "function"
  ) {
    return candidate as GithubShowcaseKvNamespace
  }

  return undefined
}

function hashString(value: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(16).padStart(8, "0")
}
