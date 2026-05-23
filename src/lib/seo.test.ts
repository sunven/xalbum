import { describe, expect, it } from "vitest"
import {
  aiToUiShowcaseConfig,
  sddShowcaseConfig,
} from "@/lib/github-showcase-config"
import {
  absoluteUrl,
  assertUniqueSeoPaths,
  buildRobotsTxt,
  buildRouteHead,
  buildSitemapXml,
  getShowcaseSeoPage,
  homeSeoPage,
  indexableSeoPages,
  siteSeo,
} from "@/lib/seo"

describe("seo", () => {
  it("builds canonical absolute URLs from the configured production origin", () => {
    expect(absoluteUrl("/sdd")).toBe("https://xalbum.sunven.workers.dev/sdd")
    expect(absoluteUrl("ai-to-ui")).toBe(
      "https://xalbum.sunven.workers.dev/ai-to-ui"
    )
    expect(absoluteUrl("https://example.com/logo.png")).toBe(
      "https://example.com/logo.png"
    )
  })

  it("builds route head tags without rendering meta keywords", () => {
    const head = buildRouteHead(getShowcaseSeoPage(sddShowcaseConfig))

    expect(head.links).toContainEqual({
      rel: "canonical",
      href: "https://xalbum.sunven.workers.dev/sdd",
    })
    expect(head.meta).toContainEqual({
      name: "description",
      content: sddShowcaseConfig.seo.description,
    })
    expect(head.meta).not.toContainEqual(
      expect.objectContaining({ name: "keywords" })
    )
  })

  it("includes JSON-LD CollectionPage and ItemList for map pages", () => {
    const head = buildRouteHead(getShowcaseSeoPage(aiToUiShowcaseConfig))
    const jsonLd = head.scripts[0]

    expect(jsonLd.type).toBe("application/ld+json")
    expect(JSON.parse(jsonLd.children)).toEqual(
      expect.objectContaining({
        "@type": "CollectionPage",
        mainEntity: expect.objectContaining({
          "@type": "ItemList",
          itemListElement: expect.arrayContaining([
            expect.objectContaining({
              position: 1,
              url: "https://github.com/vercel-labs/json-render",
            }),
          ]),
        }),
      })
    )
  })

  it("builds a sitemap from canonical indexable pages only", () => {
    const sitemap = buildSitemapXml()

    expect(sitemap).toContain("<loc>https://xalbum.sunven.workers.dev/</loc>")
    expect(sitemap).toContain(
      "<loc>https://xalbum.sunven.workers.dev/sdd</loc>"
    )
    expect(sitemap).toContain(
      "<loc>https://xalbum.sunven.workers.dev/ai-to-ui</loc>"
    )
    expect(sitemap).not.toContain("localhost")
    expect(sitemap).not.toContain("?url=")
  })

  it("builds robots.txt with a sitemap directive", () => {
    expect(buildRobotsTxt()).toBe(
      "User-agent: *\nDisallow:\nSitemap: https://xalbum.sunven.workers.dev/sitemap.xml\n"
    )
  })

  it("keeps SEO page paths unique", () => {
    expect(() => assertUniqueSeoPaths()).not.toThrow()
    expect(() =>
      assertUniqueSeoPaths([homeSeoPage, { ...homeSeoPage }])
    ).toThrow("Duplicate SEO path: /")
  })

  it("uses zh-CN as the current bilingual page locale", () => {
    expect(siteSeo.locale).toBe("zh-CN")
    expect(indexableSeoPages).toHaveLength(3)
  })
})
