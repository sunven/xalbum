export interface GithubProject {
  owner: string
  name: string
  avatar: string
  description: string
  language: string
  languageColor: string
  stars: number
  forks: number
  watchers: number
  issues: number
  license: string
  defaultBranch: string
  version: string
  versionSource: "npm" | "release" | "tag" | "none"
  versionUrl?: string
  topics: Array<string>
  updatedAtRaw: string
  updatedAt: string
  url: string
}
