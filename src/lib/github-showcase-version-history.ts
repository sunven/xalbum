import type { GithubProject } from "@/lib/github-project"

export type GithubShowcaseProjectVersionSnapshot = Record<string, string>

type VersionedProject = Pick<
  GithubProject,
  "owner" | "name" | "version" | "versionSource"
>

export function getGithubShowcaseProjectVersionsStorageKey(pageId: string) {
  return `xalbum:github-showcase:${pageId}:project-versions`
}

export function getGithubShowcaseProjectVersionStorageId(
  project: Pick<GithubProject, "owner" | "name">
) {
  return `${project.owner}/${project.name}`.toLowerCase()
}

export function parseGithubShowcaseProjectVersionSnapshot(
  storedSnapshot: string | null
): GithubShowcaseProjectVersionSnapshot {
  if (!storedSnapshot) {
    return {}
  }

  try {
    const parsed = JSON.parse(storedSnapshot)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === "string" && typeof entry[1] === "string"
      )
    )
  } catch {
    return {}
  }
}

export function buildGithubShowcaseProjectVersionSnapshot(
  projects: Array<VersionedProject>
): GithubShowcaseProjectVersionSnapshot {
  return Object.fromEntries(
    projects
      .filter((project) => project.versionSource !== "none")
      .map((project) => [
        getGithubShowcaseProjectVersionStorageId(project),
        project.version,
      ])
  )
}

export function getNewVersionProjectIds(
  projects: Array<VersionedProject>,
  previousSnapshot: GithubShowcaseProjectVersionSnapshot
) {
  const newVersionProjectIds = new Set<string>()

  for (const project of projects) {
    if (project.versionSource === "none") {
      continue
    }

    const projectId = getGithubShowcaseProjectVersionStorageId(project)
    const previousVersion = previousSnapshot[projectId]
    if (
      previousVersion &&
      isNewerProjectVersion(previousVersion, project.version)
    ) {
      newVersionProjectIds.add(projectId)
    }
  }

  return newVersionProjectIds
}

function isNewerProjectVersion(
  previousVersion: string,
  currentVersion: string
) {
  if (previousVersion === currentVersion) {
    return false
  }

  const previousParts = parseComparableVersion(previousVersion)
  const currentParts = parseComparableVersion(currentVersion)
  if (!previousParts || !currentParts) {
    return true
  }

  const partCount = Math.max(
    previousParts.parts.length,
    currentParts.parts.length
  )
  for (let index = 0; index < partCount; index += 1) {
    const previousPart = previousParts.parts[index] ?? 0
    const currentPart = currentParts.parts[index] ?? 0
    if (currentPart > previousPart) {
      return true
    }
    if (currentPart < previousPart) {
      return false
    }
  }

  return previousParts.isPrerelease && !currentParts.isPrerelease
}

function parseComparableVersion(version: string) {
  const normalizedVersion = version.trim()
  const match = normalizedVersion.match(
    /^[^\d]*(\d+(?:\.\d+)+)(?:-([0-9A-Za-z.-]+))?/
  )
  if (!match) {
    return undefined
  }

  return {
    parts: match[1].split(".").map((part) => Number(part)),
    isPrerelease: Boolean(match[2]),
  }
}
