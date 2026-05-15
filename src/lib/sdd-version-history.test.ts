import { describe, expect, it } from "vitest"

import {
  buildSddProjectVersionSnapshot,
  getNewVersionProjectIds,
  getSddProjectVersionStorageId,
  parseSddProjectVersionSnapshot,
} from "@/lib/sdd-version-history"

function project({
  owner = "Owner",
  name = "Repo",
  version = "1.0.0",
  versionSource = "release",
}: {
  owner?: string
  name?: string
  version?: string
  versionSource?: "npm" | "release" | "tag" | "none"
} = {}) {
  return {
    owner,
    name,
    version,
    versionSource,
  }
}

describe("sdd version history", () => {
  it("builds a known-version snapshot keyed by repository", () => {
    expect(
      buildSddProjectVersionSnapshot([
        project({ owner: "GitHub", name: "Spec-Kit", version: "v0.4.0" }),
        project({ name: "NoVersion", versionSource: "none" }),
      ])
    ).toEqual({
      "github/spec-kit": "v0.4.0",
    })
  })

  it("detects projects upgraded since the last recorded snapshot", () => {
    const upgradedProject = project({ name: "SpecKit", version: "v1.2.0" })
    const sameProject = project({ name: "AgentOS", version: "2.1.0" })

    expect(
      getNewVersionProjectIds([upgradedProject, sameProject], {
        [getSddProjectVersionStorageId(upgradedProject)]: "v1.1.9",
        [getSddProjectVersionStorageId(sameProject)]: "2.1.0",
      })
    ).toEqual(new Set([getSddProjectVersionStorageId(upgradedProject)]))
  })

  it("does not flag semver downgrades as new versions", () => {
    const repo = project({ version: "v1.1.0" })

    expect(
      getNewVersionProjectIds([repo], {
        [getSddProjectVersionStorageId(repo)]: "v1.2.0",
      })
    ).toEqual(new Set())
  })

  it("does not flag equivalent semver formatting changes", () => {
    const repo = project({ version: "v1.2.0" })

    expect(
      getNewVersionProjectIds([repo], {
        [getSddProjectVersionStorageId(repo)]: "1.2",
      })
    ).toEqual(new Set())
  })

  it("flags a prerelease moving to the stable version", () => {
    const repo = project({ version: "v1.2.0" })

    expect(
      getNewVersionProjectIds([repo], {
        [getSddProjectVersionStorageId(repo)]: "v1.2.0-beta.1",
      })
    ).toEqual(new Set([getSddProjectVersionStorageId(repo)]))
  })

  it("treats non-semver tag changes as new versions", () => {
    const repo = project({ version: "nightly-2026-05-15" })

    expect(
      getNewVersionProjectIds([repo], {
        [getSddProjectVersionStorageId(repo)]: "nightly-2026-05-14",
      })
    ).toEqual(new Set([getSddProjectVersionStorageId(repo)]))
  })

  it("parses only string version entries from storage", () => {
    expect(
      parseSddProjectVersionSnapshot(
        JSON.stringify({
          "owner/repo": "1.0.0",
          "owner/broken": 2,
        })
      )
    ).toEqual({
      "owner/repo": "1.0.0",
    })
  })
})
