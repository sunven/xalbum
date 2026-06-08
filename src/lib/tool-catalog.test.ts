import { describe, expect, it } from "vitest"
import rawTags from "@/data/tags.json"
import rawTools from "@/data/tools.raw.json"
import { buildToolCatalog } from "@/lib/tool-catalog"
import type { RawTag, RawTool } from "@/lib/tool-catalog"

describe("buildToolCatalog", () => {
  it("normalizes raw tools into display-ready catalog entries and ignores invalid tag references", () => {
    const catalog = buildToolCatalog({
      tools: [
        {
          id: 1,
          name: "Apipost",
          description: null,
          website: "https://www.apipost.cn/",
          github: null,
          categoryId: null,
          tags: "[13]",
        },
        {
          id: 2,
          name: "Insomnia",
          description: "",
          website: "https://insomnia.rest/",
          github: "https://github.com/Kong/insomnia",
          categoryId: null,
          tags: "[13,999]",
        },
        {
          id: 3,
          name: "Broken Tags Still Render",
          description: null,
          website: "https://example.com/",
          github: "",
          categoryId: null,
          tags: "not-json",
        },
        {
          id: 4,
          name: "Missing Tags Still Render",
          description: null,
          website: "https://missing-tags.example/",
          github: null,
          categoryId: null,
          tags: null,
        },
      ],
      tags: [
        {
          id: 13,
          name: "API",
        },
      ],
    })

    expect(catalog.stats).toEqual({
      totalTools: 4,
      totalTags: 1,
      websiteTools: 4,
      githubTools: 1,
    })
    expect(catalog.tools).toEqual([
      expect.objectContaining({
        id: 1,
        name: "Apipost",
        description: null,
        websiteUrl: "https://www.apipost.cn/",
        githubUrl: null,
        tags: [{ id: 13, name: "API" }],
      }),
      expect.objectContaining({
        id: 2,
        name: "Insomnia",
        description: null,
        websiteUrl: "https://insomnia.rest/",
        githubUrl: "https://github.com/Kong/insomnia",
        tags: [{ id: 13, name: "API" }],
      }),
      expect.objectContaining({
        id: 3,
        name: "Broken Tags Still Render",
        description: null,
        websiteUrl: "https://example.com/",
        githubUrl: null,
        tags: [],
      }),
      expect.objectContaining({
        id: 4,
        name: "Missing Tags Still Render",
        description: null,
        websiteUrl: "https://missing-tags.example/",
        githubUrl: null,
        tags: [],
      }),
    ])
  })

  it("builds a catalog from the bundled src/data files", () => {
    const catalog = buildToolCatalog({
      tools: rawTools as Array<RawTool>,
      tags: rawTags as Array<RawTag>,
    })

    expect(catalog.stats.totalTools).toBe(409)
    expect(catalog.stats.totalTags).toBe(118)
    expect(catalog.stats.websiteTools).toBe(409)
    expect(catalog.stats.githubTools).toBeGreaterThan(0)
    expect(catalog.tools[0]).toEqual(
      expect.objectContaining({
        name: "Apipost",
        websiteUrl: "https://www.apipost.cn/",
        tags: [expect.objectContaining({ name: expect.any(String) })],
      })
    )
  })
})
