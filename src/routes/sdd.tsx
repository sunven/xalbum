import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"
import { GithubProjectCard } from "@/components/github-project-card"
import type { GithubProject } from "@/lib/github-project"
import { sortGithubProjectsByStarsDesc } from "@/lib/github-project-sort"

export const Route = createFileRoute("/sdd")({
  loader: () => getGithubProjects(),
  component: SddPage,
})

type RepoConfig = {
  id: `${string}/${string}`
}

type GithubProjectsData = {
  projects: GithubProject[]
  error?: string
}

type GithubRepoResponse = {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  subscribers_count: number
  open_issues_count: number
  default_branch: string
  updated_at: string
  pushed_at: string | null
  topics?: string[]
  license: {
    spdx_id: string | null
  } | null
  owner: {
    login: string
    avatar_url: string
  }
}

const repoConfigs: RepoConfig[] = [
  {
    id: "github/spec-kit",
  },
  {
    id: "Fission-AI/OpenSpec",
  },
  {
    id: "MrLesk/Backlog.md",
  },
  {
    id: "bmad-code-org/BMAD-METHOD",
  },
  {
    id: "buildermethods/agent-os",
  },
  {
    id: "obra/superpowers",
  },
  {
    id: "SuperClaude-Org/SuperClaude_Framework",
  },
  { id: "affaan-m/everything-claude-code" },
  { id: "EveryInc/compound-engineering-plugin" },
  { id: "gsd-build/get-shit-done" },
  { id: "yeachan-heo/oh-my-claudecode" },
  { id: "Yeachan-Heo/oh-my-codex" },
  { id: "garrytan/gstack" },
  { id: "ruvnet/ruflo" },
  { id: "addyosmani/agent-skills" },
]

const languageColors: Record<string, string> = {
  C: "#555555",
  "C++": "#f34b7d",
  CSS: "#563d7c",
  Go: "#00add8",
  HTML: "#e34c26",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  MDX: "#fcb32c",
  PHP: "#4f5d95",
  Python: "#3572a5",
  Ruby: "#701516",
  Rust: "#dea584",
  Shell: "#89e051",
  Swift: "#f05138",
  TypeScript: "#3178c6",
  Vue: "#41b883",
}

const sddPageStyles = `
  .sdd-page {
    --background: oklch(0.985 0.003 240);
    --foreground: oklch(0.22 0.03 240);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.22 0.03 240);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.22 0.03 240);
    --primary: oklch(0.58 0.13 200);
    --primary-foreground: oklch(0.99 0.005 200);
    --secondary: oklch(0.96 0.01 220);
    --secondary-foreground: oklch(0.3 0.04 230);
    --muted: oklch(0.96 0.008 230);
    --muted-foreground: oklch(0.5 0.03 230);
    --accent: oklch(0.58 0.13 200);
    --accent-foreground: oklch(0.99 0.005 200);
    --border: oklch(0.9 0.01 230);
    --input: oklch(0.93 0.01 230);
    --ring: oklch(0.58 0.13 200);
    --chart-1: oklch(0.58 0.13 200);
    --chart-2: oklch(0.62 0.15 145);
    --chart-3: oklch(0.7 0.16 70);
    --chart-4: oklch(0.6 0.2 25);
    --chart-5: oklch(0.55 0.18 320);
  }

  .sdd-page .bg-grid {
    background-image:
      linear-gradient(
        to right,
        oklch(0.58 0.13 200 / 0.08) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        oklch(0.58 0.13 200 / 0.08) 1px,
        transparent 1px
      );
    background-size: 32px 32px;
  }

  .sdd-page .text-glow {
    text-shadow: 0 0 12px oklch(0.58 0.13 200 / 0.35);
  }

  .sdd-page .shadow-glow {
    box-shadow:
      0 12px 32px -8px oklch(0.58 0.13 200 / 0.25),
      0 4px 12px -4px oklch(0.58 0.13 200 / 0.15),
      0 2px 8px -2px oklch(0.22 0.03 240 / 0.06);
  }

  @keyframes sdd-pulse-dot {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 0 oklch(0.58 0.13 200 / 0.5);
    }
    50% {
      opacity: 0.7;
      box-shadow: 0 0 0 6px oklch(0.58 0.13 200 / 0);
    }
  }

  .sdd-page .animate-pulse-dot {
    animation: sdd-pulse-dot 1.8s ease-in-out infinite;
  }

  @keyframes sdd-scan-line {
    0% {
      transform: translateY(-100%);
    }

    100% {
      transform: translateY(100%);
    }
  }

  .sdd-page .animate-scan {
    animation: sdd-scan-line 2.5s linear infinite;
  }
`

const getGithubProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    setResponseHeader("Cache-Control", "public, max-age=300, s-maxage=900")

    const results = await Promise.allSettled(
      repoConfigs.map(async (config) => {
        const repo = await fetchGithubRepo(config.id)
        return mapGithubRepoToProject(repo)
      })
    )

    const failures = results.filter((result) => result.status === "rejected")
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("GitHub repo request failed", result.reason)
      }
    }

    const projects = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
    const sortedProjects = sortGithubProjectsByStarsDesc(projects)

    return {
      projects: sortedProjects,
      error:
        projects.length === 0 && failures[0]
          ? getGithubErrorMessage(failures[0].reason)
          : undefined,
    } satisfies GithubProjectsData
  }
)

async function fetchGithubRepo(
  id: RepoConfig["id"]
): Promise<GithubRepoResponse> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "xalbum-github-showcase",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/repos/${id}`, {
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      `GitHub repo request failed: ${id} ${response.status} ${response.statusText} ${message.slice(0, 240)}`
    )
  }

  return response.json()
}

function getGithubErrorMessage(reason: unknown) {
  if (reason instanceof Error) {
    if (reason.message.includes("rate limit exceeded")) {
      return "GitHub API rate limit exceeded. Set GITHUB_TOKEN or GH_TOKEN, then refresh."
    }
    return reason.message
  }

  return "GitHub API request failed."
}

function mapGithubRepoToProject(repo: GithubRepoResponse): GithubProject {
  const language = repo.language ?? "Unknown"

  return {
    owner: repo.owner.login,
    name: repo.name,
    avatar: repo.owner.avatar_url,
    description: repo.description ?? "",
    language,
    languageColor: languageColors[language] ?? "oklch(0.7 0.04 210)",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.subscribers_count,
    issues: repo.open_issues_count,
    license: repo.license?.spdx_id ?? "NOASSERTION",
    defaultBranch: repo.default_branch,
    topics: repo.topics ?? [],
    updatedAt: formatRelativeTime(repo.pushed_at ?? repo.updated_at),
    url: repo.html_url,
  }
}

function formatRelativeTime(dateValue: string) {
  const timestamp = new Date(dateValue).getTime()
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000))

  if (diffMinutes < 60) {
    return `${diffMinutes}M AGO`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}H AGO`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `${diffDays}D AGO`
  }

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) {
    return `${diffMonths}MO AGO`
  }

  return `${Math.floor(diffMonths / 12)}Y AGO`
}

function SddPage() {
  const { projects, error } = Route.useLoaderData()

  return (
    <main className="sdd-page relative min-h-screen overflow-hidden bg-background">
      <style>{sddPageStyles}</style>
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/4 size-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-0 size-[500px] translate-x-1/3 rounded-full bg-chart-2/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-16 sm:pt-10 sm:pb-20">
        <header className="mb-12 flex flex-col gap-4">
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-primary uppercase">
            <span className="flex size-2 items-center justify-center">
              <span className="animate-pulse-dot absolute size-2 rounded-full bg-primary" />
              <span className="size-1 rounded-full bg-primary" />
            </span>
            <span>SYS://SDD.TOOLS.INIT</span>
            <span className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
          </div>

          <h1 className="font-mono text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            <span className="text-primary">{"//"}</span> SDD 框架与工具图谱
            <span className="ml-2 inline-block animate-pulse text-primary">
              _
            </span>
          </h1>

          <p className="max-w-2xl font-sans text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            聚合 Spec-driven development (SDD)
            相关开源框架与工具，追踪从规格、任务、产品意图到 Agent 执行工作流的
            GitHub 项目活跃度。
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border font-mono text-xs sm:grid-cols-4">
            <StatBlock
              label="SDD_TOOLS"
              value={projects.length.toString().padStart(2, "0")}
            />
            <StatBlock
              label="TOTAL_STARS"
              value={`${(
                projects.reduce((sum, project) => sum + project.stars, 0) / 1000
              ).toFixed(1)}K`}
            />
            <StatBlock
              label="LANGUAGES"
              value={new Set(projects.map((project) => project.language)).size
                .toString()
                .padStart(2, "0")}
            />
            <StatBlock label="CURATION" value="LIVE" />
          </dl>
        </header>

        <section
          aria-label="SDD 框架与工具列表"
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {projects.length > 0 ? (
            projects.map((project) => (
              <GithubProjectCard
                key={`${project.owner}/${project.name}`}
                project={project}
              />
            ))
          ) : (
            <div className="border border-border bg-card p-5 font-mono text-xs tracking-wider text-muted-foreground uppercase md:col-span-2">
              <span className="text-primary">GitHub API unavailable</span>
              <span className="mt-2 block tracking-normal normal-case">
                {error ??
                  "No SDD framework or tooling repositories returned from GitHub."}
              </span>
            </div>
          )}
        </section>

        <footer className="mt-16 flex items-center justify-between border-t border-border pt-6 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          <span>{"v0.app // sdd_tools_index"}</span>
          <span className="flex items-center gap-1.5">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-primary" />
            SOURCE_SYNCED
          </span>
        </footer>
      </div>
    </main>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-card px-4 py-3">
      <dt className="text-[9px] tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-lg font-semibold text-primary tabular-nums">
        {value}
      </dd>
    </div>
  )
}
