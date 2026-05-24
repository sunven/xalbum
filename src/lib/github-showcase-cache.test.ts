import { describe, expect, it, vi } from "vitest"
import {
  createGithubShowcaseCachePayload,
  getGithubShowcaseCacheKey,
  getGithubShowcaseCachedData,
  parseGithubShowcaseCachePayload,
  refreshGithubShowcaseCachePayload,
  type GithubShowcaseCachePayload,
  type GithubShowcaseCacheStore,
} from "@/lib/github-showcase-cache"
import type { GithubProjectsData } from "@/lib/github-showcase-data"
import { sddShowcaseConfig } from "@/lib/github-showcase-config"

const baseTime = new Date("2026-05-24T08:00:00.000Z").getTime()

function data(name = "spec-kit"): GithubProjectsData {
  return {
    projects: [
      {
        owner: "github",
        name,
        avatar: "https://example.com/avatar.png",
        description: "Spec toolkit",
        language: "TypeScript",
        languageColor: "#3178c6",
        stars: 1200,
        forks: 100,
        watchers: 20,
        issues: 5,
        license: "MIT",
        defaultBranch: "main",
        version: "v1.0.0",
        versionSource: "release",
        versionUrl: "https://github.com/github/spec-kit/releases/tag/v1.0.0",
        topics: ["sdd"],
        updatedAtRaw: "2026-05-24T07:00:00Z",
        updatedAt: "2026-05-24T07:00:00Z",
        url: `https://github.com/github/${name}`,
      },
    ],
  }
}

function payload({
  cachedData = data(),
  nowMs = baseTime,
  refreshAfterMs = baseTime + 45 * 60 * 1000,
  expiresAtMs = baseTime + 24 * 60 * 60 * 1000,
  refreshingUntilMs,
}: {
  cachedData?: GithubProjectsData
  nowMs?: number
  refreshAfterMs?: number
  expiresAtMs?: number
  refreshingUntilMs?: number
} = {}): GithubShowcaseCachePayload {
  return {
    ...createGithubShowcaseCachePayload({
      data: cachedData,
      nowMs,
    }),
    refreshAfter: new Date(refreshAfterMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    refreshingUntil:
      refreshingUntilMs === undefined
        ? undefined
        : new Date(refreshingUntilMs).toISOString(),
  }
}

class FakeCache implements GithubShowcaseCacheStore {
  writes: Array<GithubShowcaseCachePayload> = []
  failWrites = false

  constructor(public cachedPayload?: GithubShowcaseCachePayload) {}

  async getPayload() {
    return this.cachedPayload
  }

  async putPayload(_key: string, nextPayload: GithubShowcaseCachePayload) {
    if (this.failWrites) {
      throw new Error("KV write failed")
    }

    this.cachedPayload = nextPayload
    this.writes.push(nextPayload)
  }
}

describe("github showcase cache", () => {
  it("builds stable keys and invalidates when repo config changes", () => {
    const sameConfig = {
      ...sddShowcaseConfig,
      repoConfigs: [...sddShowcaseConfig.repoConfigs],
    }
    const changedConfig = {
      ...sddShowcaseConfig,
      repoConfigs: [
        ...sddShowcaseConfig.repoConfigs,
        { id: "owner/new-repo" as const },
      ],
    }

    expect(getGithubShowcaseCacheKey(sddShowcaseConfig)).toBe(
      getGithubShowcaseCacheKey(sameConfig)
    )
    expect(getGithubShowcaseCacheKey(sddShowcaseConfig)).not.toBe(
      getGithubShowcaseCacheKey(changedConfig)
    )
  })

  it("returns a fresh hit without fetching", async () => {
    const cache = new FakeCache(payload())
    const fetchFresh = vi.fn(async () => data("fresh"))

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh,
      now: () => baseTime + 1000,
    })

    expect(result.status).toBe("hit")
    expect(result.data.projects[0].name).toBe("spec-kit")
    expect(fetchFresh).not.toHaveBeenCalled()
  })

  it("fetches and writes on a cache miss", async () => {
    const cache = new FakeCache()
    const fetchFresh = vi.fn(async () => data("fresh"))

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh,
      now: () => baseTime,
    })

    expect(result.status).toBe("miss")
    expect(result.data.projects[0].name).toBe("fresh")
    expect(cache.writes).toHaveLength(1)
    expect(cache.writes[0].data.projects[0].name).toBe("fresh")
  })

  it("returns fresh data when a cache write fails on miss", async () => {
    const cache = new FakeCache()
    cache.failWrites = true
    const logger = vi.fn()

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh: async () => data("fresh"),
      logger,
      now: () => baseTime,
    })

    expect(result.status).toBe("miss")
    expect(result.data.projects[0].name).toBe("fresh")
    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({ status: "write_error" })
    )
  })

  it("returns stale data and marks refresh in progress", async () => {
    const cache = new FakeCache(
      payload({
        refreshAfterMs: baseTime - 1000,
        expiresAtMs: baseTime + 60_000,
      })
    )
    const fetchFresh = vi.fn(async () => data("fresh"))

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh,
      now: () => baseTime,
    })

    await vi.waitFor(() => expect(fetchFresh).toHaveBeenCalled())

    expect(result.status).toBe("stale_refresh_started")
    expect(result.data.projects[0].name).toBe("spec-kit")
    expect(cache.writes[0].refreshingUntil).toBe(
      new Date(baseTime + 2 * 60 * 1000).toISOString()
    )
    expect(cache.writes.at(-1)?.data.projects[0].name).toBe("fresh")
  })

  it("schedules stale refreshes through the provided background task scheduler", async () => {
    const cache = new FakeCache(
      payload({
        refreshAfterMs: baseTime - 1000,
        expiresAtMs: baseTime + 60_000,
      })
    )
    const scheduledTasks: Array<Promise<unknown>> = []

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh: async () => data("fresh"),
      scheduleBackgroundTask: (task) => scheduledTasks.push(task),
      now: () => baseTime,
    })

    expect(result.status).toBe("stale_refresh_started")
    expect(scheduledTasks).toHaveLength(1)
    await scheduledTasks[0]
    expect(cache.writes.at(-1)?.data.projects[0].name).toBe("fresh")
  })

  it("does not launch duplicate refreshes while a marker is active", async () => {
    const cache = new FakeCache(
      payload({
        refreshAfterMs: baseTime - 1000,
        expiresAtMs: baseTime + 60_000,
        refreshingUntilMs: baseTime + 30_000,
      })
    )
    const fetchFresh = vi.fn(async () => data("fresh"))

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh,
      now: () => baseTime,
    })

    expect(result.status).toBe("stale_refresh_skipped")
    expect(fetchFresh).not.toHaveBeenCalled()
  })

  it("returns stale data and logs if background refresh fails", async () => {
    const cache = new FakeCache(
      payload({
        refreshAfterMs: baseTime - 10_000,
        expiresAtMs: baseTime + 1000,
      })
    )
    const logger = vi.fn()

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh: async () => {
        throw new Error("GitHub down")
      },
      now: () => baseTime,
      logger,
    })

    await vi.waitFor(() =>
      expect(logger).toHaveBeenCalledWith(
        expect.objectContaining({ status: "refresh_error" })
      )
    )

    expect(result.status).toBe("stale_refresh_started")
    expect(result.data.projects[0].name).toBe("spec-kit")
  })

  it("refreshes and replaces expired data when the source succeeds", async () => {
    const cache = new FakeCache(
      payload({
        refreshAfterMs: baseTime - 10_000,
        expiresAtMs: baseTime - 1000,
      })
    )

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh: async () => data("fresh"),
      now: () => baseTime,
    })

    expect(result.status).toBe("miss")
    expect(result.data.projects[0].name).toBe("fresh")
    expect(cache.writes.at(-1)?.data.projects[0].name).toBe("fresh")
  })

  it("does not return expired data after the stale fallback window", async () => {
    const cache = new FakeCache(
      payload({
        refreshAfterMs: baseTime - 10_000,
        expiresAtMs: baseTime - 1000,
      })
    )

    await expect(
      getGithubShowcaseCachedData({
        config: sddShowcaseConfig,
        cache,
        fetchFresh: async () => {
          throw new Error("GitHub down")
        },
        now: () => baseTime,
      })
    ).rejects.toThrow("GitHub down")
  })

  it("does not cache total failure results", async () => {
    const cache = new FakeCache()

    const result = await getGithubShowcaseCachedData({
      config: sddShowcaseConfig,
      cache,
      fetchFresh: async () => ({
        projects: [],
        error: "GitHub API request failed.",
      }),
      now: () => baseTime,
    })

    expect(result.status).toBe("miss")
    expect(result.data.projects).toEqual([])
    expect(cache.writes).toHaveLength(0)
  })

  it("force refreshes cache payloads for scheduled prewarming", async () => {
    const cache = new FakeCache()
    const logger = vi.fn()

    const result = await refreshGithubShowcaseCachePayload({
      config: sddShowcaseConfig,
      cache,
      fetchFresh: async () => data("scheduled"),
      now: () => baseTime,
      logger,
    })

    expect(result.status).toBe("scheduled_refresh")
    expect(result.projectCount).toBe(1)
    expect(cache.writes).toHaveLength(1)
    expect(cache.writes[0].data.projects[0].name).toBe("scheduled")
    expect(cache.writes[0].refreshAfter).toBe(
      new Date(baseTime + 45 * 60 * 1000).toISOString()
    )
    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "scheduled_refresh",
        projectCount: 1,
      })
    )
  })

  it("does not overwrite cache payloads when scheduled refresh has no projects", async () => {
    const cache = new FakeCache(payload())

    const result = await refreshGithubShowcaseCachePayload({
      config: sddShowcaseConfig,
      cache,
      fetchFresh: async () => ({
        projects: [],
        error: "GitHub API request failed.",
      }),
      now: () => baseTime,
    })

    expect(result.status).toBe("scheduled_refresh_skipped")
    expect(cache.writes).toHaveLength(0)
    expect(cache.cachedPayload?.data.projects[0].name).toBe("spec-kit")
  })

  it("ignores corrupt cached payloads", () => {
    expect(parseGithubShowcaseCachePayload("{")).toBeUndefined()
    expect(
      parseGithubShowcaseCachePayload(JSON.stringify({ version: 999 }))
    ).toBeUndefined()
  })
})
