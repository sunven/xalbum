export {
  buildGithubShowcaseProjectVersionSnapshot as buildSddProjectVersionSnapshot,
  getGithubShowcaseProjectVersionStorageId as getSddProjectVersionStorageId,
  getNewVersionProjectIds,
  parseGithubShowcaseProjectVersionSnapshot as parseSddProjectVersionSnapshot,
} from "@/lib/github-showcase-version-history"

export type { GithubShowcaseProjectVersionSnapshot as SddProjectVersionSnapshot } from "@/lib/github-showcase-version-history"

export const sddProjectVersionsStorageKey =
  "xalbum:github-showcase:sdd:project-versions"
