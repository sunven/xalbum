import type { GithubProject } from "@/lib/github-project"

export function sortGithubProjectsByStarsDesc(projects: GithubProject[]) {
  return [...projects].sort((left, right) => right.stars - left.stars)
}
