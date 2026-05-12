import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"
import { Moon, Sun } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import type { ComponentType } from "react"
import type { GithubProject } from "@/lib/github-project"
import DotField from "@/components/DotField"
import { GithubProjectCard } from "@/components/github-project-card"
import Shuffle from "@/components/Shuffle"
import { sortGithubProjectsByStarsDesc } from "@/lib/github-project-sort"

export const Route = createFileRoute("/sdd")({
  loader: () => getGithubProjects(),
  component: SddPage,
})

type RepoConfig = {
  id: `${string}/${string}`
  npmPackage?: string
}

type SddTheme = "light" | "dark"

type DotFieldProps = {
  dotRadius?: number
  dotSpacing?: number
  cursorRadius?: number
  bulgeStrength?: number
  glowRadius?: number
  sparkle?: boolean
  waveAmplitude?: number
  gradientFrom?: string
  gradientTo?: string
  glowColor?: string
}

const SddDotField = DotField as ComponentType<DotFieldProps>

const sddThemeStorageKey = "xalbum:sdd-theme"

const sddDotFieldTheme = {
  light: {
    gradientFrom: "oklch(0.58 0.13 200 / 0.34)",
    gradientTo: "oklch(0.62 0.15 145 / 0.22)",
  },
  dark: {
    gradientFrom: "oklch(0.74 0.14 190 / 0.3)",
    gradientTo: "oklch(0.76 0.16 145 / 0.18)",
  },
} satisfies Record<SddTheme, { gradientFrom: string; gradientTo: string }>

type GithubProjectsData = {
  projects: Array<GithubProject>
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
  topics?: Array<string>
  license: {
    spdx_id: string | null
  } | null
  owner: {
    login: string
    avatar_url: string
  }
}

type GithubReleaseResponse = {
  html_url: string
  tag_name: string
}

type GithubTagResponse = {
  name: string
}

type NpmPackageResponse = {
  "dist-tags"?: {
    latest?: string
  }
}

type ProjectVersion = {
  version: string
  versionSource: GithubProject["versionSource"]
  versionUrl?: string
}

const repoConfigs: Array<RepoConfig> = [
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
    color-scheme: light;
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

  .sdd-page[data-theme="dark"] {
    color-scheme: dark;
    --background: oklch(0.145 0.018 245);
    --foreground: oklch(0.93 0.022 225);
    --card: oklch(0.19 0.022 238);
    --card-foreground: oklch(0.93 0.022 225);
    --popover: oklch(0.19 0.022 238);
    --popover-foreground: oklch(0.93 0.022 225);
    --primary: oklch(0.74 0.14 190);
    --primary-foreground: oklch(0.13 0.018 245);
    --secondary: oklch(0.24 0.026 235);
    --secondary-foreground: oklch(0.88 0.03 225);
    --muted: oklch(0.23 0.021 238);
    --muted-foreground: oklch(0.71 0.03 225);
    --accent: oklch(0.76 0.16 145);
    --accent-foreground: oklch(0.13 0.018 245);
    --border: oklch(0.34 0.03 235);
    --input: oklch(0.3 0.028 235);
    --ring: oklch(0.74 0.14 190);
    --chart-1: oklch(0.74 0.14 190);
    --chart-2: oklch(0.76 0.16 145);
    --chart-3: oklch(0.78 0.16 70);
    --chart-4: oklch(0.72 0.18 25);
    --chart-5: oklch(0.72 0.16 320);
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
`

const getGithubProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    setResponseHeader("Cache-Control", "public, max-age=300, s-maxage=900")

    const results = await Promise.allSettled(
      repoConfigs.map(async (config) => {
        const repo = await fetchGithubRepo(config.id)
        const version = await resolveProjectVersion(config)
        return mapGithubRepoToProject(repo, version)
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
  return fetchGithubJson<GithubRepoResponse>(`repos/${id}`)
}

async function fetchGithubJson<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "xalbum-github-showcase",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/${path}`, {
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      `GitHub request failed: ${path} ${response.status} ${response.statusText} ${message.slice(0, 240)}`
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

async function resolveProjectVersion(
  config: RepoConfig
): Promise<ProjectVersion> {
  if (config.npmPackage) {
    const npmVersion = await fetchNpmPackageVersion(config.npmPackage)
    if (npmVersion.versionSource !== "none") {
      return npmVersion
    }
  }

  const releaseVersion = await fetchLatestReleaseVersion(config.id)
  if (releaseVersion.versionSource !== "none") {
    return releaseVersion
  }

  return fetchLatestTagVersion(config.id)
}

async function fetchNpmPackageVersion(
  packageName: string
): Promise<ProjectVersion> {
  try {
    const encodedPackageName = packageName
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/")

    const response = await fetch(
      `https://registry.npmjs.org/${encodedPackageName}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "xalbum-github-showcase",
        },
      }
    )

    if (!response.ok) {
      throw new Error(
        `npm package request failed: ${packageName} ${response.status} ${response.statusText}`
      )
    }

    const npmPackage = (await response.json()) as NpmPackageResponse
    const latestVersion = npmPackage["dist-tags"]?.latest
    if (!latestVersion) {
      return emptyProjectVersion()
    }

    return {
      version: latestVersion,
      versionSource: "npm",
      versionUrl: `https://www.npmjs.com/package/${encodedPackageName}/v/${encodeURIComponent(latestVersion)}`,
    }
  } catch (error) {
    console.error("npm package version request failed", packageName, error)
    return emptyProjectVersion()
  }
}

async function fetchLatestReleaseVersion(
  id: RepoConfig["id"]
): Promise<ProjectVersion> {
  try {
    const release = await fetchGithubJson<GithubReleaseResponse>(
      `repos/${id}/releases/latest`
    )

    return {
      version: release.tag_name,
      versionSource: "release",
      versionUrl: release.html_url,
    }
  } catch (error) {
    console.error("GitHub latest release request failed", id, error)
    return emptyProjectVersion()
  }
}

async function fetchLatestTagVersion(
  id: RepoConfig["id"]
): Promise<ProjectVersion> {
  try {
    const tags = await fetchGithubJson<Array<GithubTagResponse>>(
      `repos/${id}/tags?per_page=1`
    )
    if (tags.length === 0) {
      return emptyProjectVersion()
    }

    const [tag] = tags

    return {
      version: tag.name,
      versionSource: "tag",
      versionUrl: `https://github.com/${id}/tree/${encodeURIComponent(tag.name)}`,
    }
  } catch (error) {
    console.error("GitHub latest tag request failed", id, error)
    return emptyProjectVersion()
  }
}

function emptyProjectVersion(): ProjectVersion {
  return {
    version: "NO VERSION",
    versionSource: "none",
  }
}

function mapGithubRepoToProject(
  repo: GithubRepoResponse,
  version: ProjectVersion
): GithubProject {
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
    version: version.version,
    versionSource: version.versionSource,
    versionUrl: version.versionUrl,
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
  const [theme, setTheme] = useState<SddTheme>("light")
  const [themeReady, setThemeReady] = useState(false)
  const dotFieldTheme = sddDotFieldTheme[theme]

  useEffect(() => {
    setTheme(getPreferredSddTheme())
    setThemeReady(true)
  }, [])

  useEffect(() => {
    if (!themeReady) {
      return
    }

    try {
      window.localStorage.setItem(sddThemeStorageKey, theme)
    } catch {
      // Ignore storage failures so the switch still works in private contexts.
    }
  }, [theme, themeReady])

  return (
    <main
      className={`sdd-page ${
        theme === "dark" ? "dark" : ""
      } relative min-h-screen overflow-hidden bg-background transition-colors duration-300`}
      data-theme={theme}
    >
      <style>{sddPageStyles}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_72%,transparent_100%)] opacity-80"
      >
        <SddDotField
          dotRadius={1.4}
          dotSpacing={16}
          cursorRadius={420}
          bulgeStrength={54}
          glowRadius={0}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom={dotFieldTheme.gradientFrom}
          gradientTo={dotFieldTheme.gradientTo}
          glowColor="transparent"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-16 sm:pt-10 sm:pb-20">
        <header className="mb-12 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 font-mono text-xs tracking-[0.3em] text-primary uppercase">
              <span className="flex size-2 shrink-0 items-center justify-center">
                <span className="animate-pulse-dot absolute size-2 rounded-full bg-primary" />
                <span className="size-1 rounded-full bg-primary" />
              </span>
              <span className="min-w-0 truncate">SYS://SDD.TOOLS.INIT</span>
              <span className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
            </div>
            <SddThemeSwitch
              theme={theme}
              onToggle={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
            />
          </div>

          <div className="flex items-baseline gap-2 font-mono text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            <span className="shrink-0 text-primary" aria-hidden="true">
              {"//"}
            </span>
            <Shuffle
              text="SDD 框架与工具图谱"
              tag="h1"
              textAlign="left"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              triggerOnce={true}
              triggerOnHover={true}
              respectReducedMotion={true}
              onShuffleComplete={undefined}
              colorFrom={undefined}
              colorTo={undefined}
              className="m-0 inline-block font-mono text-3xl font-semibold tracking-tight text-foreground normal-case sm:text-5xl"
              style={{
                fontSize: "inherit",
                fontFamily: "inherit",
                fontWeight: "inherit",
                lineHeight: "1.1",
                textTransform: "none",
              }}
            />
            <span
              className="shrink-0 animate-pulse text-primary"
              aria-hidden="true"
            >
              _
            </span>
          </div>

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

function getPreferredSddTheme(): SddTheme {
  try {
    const storedTheme = window.localStorage.getItem(sddThemeStorageKey)
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme
    }
  } catch {
    // Ignore storage failures and continue with the browser preference.
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }

  return "light"
}

function SddThemeSwitch({
  theme,
  onToggle,
}: {
  theme: SddTheme
  onToggle: () => void
}) {
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      aria-pressed={isDark}
      onClick={onToggle}
      className="relative inline-flex h-8 w-16 shrink-0 items-center border border-border bg-card/80 p-1 text-primary shadow-sm backdrop-blur transition-colors duration-300 outline-none hover:border-primary/70 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span
        aria-hidden="true"
        className={`shadow-glow flex size-6 items-center justify-center border border-border bg-background transition-transform duration-300 ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </span>
      <span className="sr-only">
        {isDark ? "当前为深色模式" : "当前为浅色模式"}
      </span>
    </button>
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
