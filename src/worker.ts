import startWorker from "@tanstack/react-start/server-entry"
import { GithubShowcaseKvCache } from "@/lib/github-showcase-cache"
import { githubShowcaseConfigs } from "@/lib/github-showcase-config"
import { refreshGithubShowcaseProjectsCache } from "@/lib/github-showcase-data"

type ShowcaseCacheBinding = ConstructorParameters<
  typeof GithubShowcaseKvCache
>[0]

type WorkerEnv = {
  SHOWCASE_CACHE?: ShowcaseCacheBinding
}

type ScheduledEvent = {
  cron: string
  scheduledTime: number
}

type ExecutionContext = {
  waitUntil(task: Promise<unknown>): void
}

export default {
  fetch: startWorker.fetch,

  async scheduled(
    event: ScheduledEvent,
    env: WorkerEnv,
    ctx: ExecutionContext
  ) {
    if (!env.SHOWCASE_CACHE) {
      console.info("github_showcase_cache_scheduled", {
        cron: event.cron,
        status: "disabled",
      })
      return
    }

    const cache = new GithubShowcaseKvCache(env.SHOWCASE_CACHE)
    const config =
      githubShowcaseConfigs[
        Math.floor(event.scheduledTime / (30 * 60 * 1000)) %
          githubShowcaseConfigs.length
      ]

    const refreshTask = refreshGithubShowcaseProjectsCache(config, { cache })
      .then((result) => {
        console.info("github_showcase_cache_scheduled", {
          cron: event.cron,
          pageId: config.pageId,
          status: "complete",
          cacheStatus: result.status,
          projectCount: result.projectCount,
        })
      })
      .catch((error) => {
        console.error("github_showcase_cache_scheduled_failed", {
          cron: event.cron,
          pageId: config.pageId,
          error,
        })

        throw error
      })

    ctx.waitUntil(refreshTask)
  },
}
