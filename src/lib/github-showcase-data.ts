import { setResponseHeader } from "@tanstack/react-start/server"
import type { GithubProject } from "@/lib/github-project"
import { sortGithubProjectsByStarsDesc } from "@/lib/github-project-sort"
import type { RepoConfig } from "@/lib/github-showcase-config"

export type GithubProjectsData = {
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

export async function getGithubShowcaseProjects(
  repoConfigs: Array<RepoConfig>
): Promise<GithubProjectsData> {
  setResponseHeader("Cache-Control", "public, max-age=300, s-maxage=900")

  const results = await Promise.allSettled(
    repoConfigs.map(async (config) => {
      const repo = await fetchGithubRepo(config.id)
      const version = await resolveProjectVersion(config)
      return mapGithubRepoToProject(repo, version)
    })
  )

  const failures = results.filter((result) => result.status === "rejected")
  for (const result of failures) {
    console.error("GitHub repo request failed", result.reason)
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
  }
}

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
