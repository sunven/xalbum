import {
  githubShowcaseConfigs,
  type GithubShowcaseConfig,
} from "@/lib/github-showcase-config"

type SeoPage = {
  path: string
  title: string
  description: string
  ogImage: string
  lastModified: string
  sitemapPriority: number
  structuredData: Record<string, unknown>
}

export const siteSeo = {
  name: "XAlbum",
  origin: normalizeOrigin(
    process.env.SITE_ORIGIN ??
      process.env.VITE_SITE_ORIGIN ??
      "https://xalbum.sunven.workers.dev"
  ),
  defaultOgImage: "/logo.svg",
  locale: "zh-CN",
  title: "XAlbum 工具图谱 | AI Tools Atlas for Builders",
  description:
    "XAlbum 是面向 AI builders 的工具图谱，持续整理 SDD、AI-to-UI 与 agent workflow 相关开源项目。",
} as const

export const homeSeoPage = {
  path: "/",
  title: siteSeo.title,
  description: siteSeo.description,
  ogImage: siteSeo.defaultOgImage,
  lastModified: "2026-05-23",
  sitemapPriority: 1,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteSeo.name,
    url: siteSeo.origin,
    inLanguage: siteSeo.locale,
    description: siteSeo.description,
  },
} satisfies SeoPage

export const showcaseSeoPages = githubShowcaseConfigs.map((config) =>
  getShowcaseSeoPage(config)
)

export const toolCatalogSeoPage = {
  path: "/tools",
  title: "XAlbum 工具目录 | Local Tools Catalog",
  description:
    "浏览 XAlbum 从 src/data 整理出的本地工具目录，按名称、链接和标签搜索筛选 400+ builder tools。",
  ogImage: siteSeo.defaultOgImage,
  lastModified: "2026-06-08",
  sitemapPriority: 0.7,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "XAlbum 工具目录 | Local Tools Catalog",
    url: absoluteUrl("/tools"),
    inLanguage: siteSeo.locale,
    description:
      "浏览 XAlbum 从 src/data 整理出的本地工具目录，按名称、链接和标签搜索筛选 400+ builder tools。",
    isPartOf: {
      "@type": "WebSite",
      name: siteSeo.name,
      url: siteSeo.origin,
    },
  },
} satisfies SeoPage

export const indexableSeoPages = [
  homeSeoPage,
  ...showcaseSeoPages,
  toolCatalogSeoPage,
] satisfies Array<SeoPage>

export function getShowcaseSeoPage(config: GithubShowcaseConfig): SeoPage {
  const path = getShowcasePath(config)
  return {
    path,
    title: config.seo.title,
    description: config.seo.description,
    ogImage: config.seo.ogImage,
    lastModified: config.seo.lastModified,
    sitemapPriority: config.seo.sitemapPriority,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: config.seo.title,
      url: absoluteUrl(path),
      inLanguage: siteSeo.locale,
      description: config.seo.description,
      isPartOf: {
        "@type": "WebSite",
        name: siteSeo.name,
        url: siteSeo.origin,
      },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: config.repoConfigs.map((repoConfig, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://github.com/${repoConfig.id}`,
          name: repoConfig.id,
        })),
      },
    },
  }
}

export function buildRouteHead(page: SeoPage) {
  return {
    meta: buildMetaTags(page),
    links: [{ rel: "canonical", href: absoluteUrl(page.path) }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(page.structuredData),
      },
    ],
  }
}

export function buildMetaTags(page: SeoPage) {
  return [
    { title: page.title },
    { name: "description", content: page.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteSeo.name },
    { property: "og:locale", content: siteSeo.locale },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:url", content: absoluteUrl(page.path) },
    { property: "og:image", content: absoluteUrl(page.ogImage) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: page.title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: absoluteUrl(page.ogImage) },
  ]
}

export function buildSitemapXml(pages = indexableSeoPages) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map(
      (page) => `  <url>
    <loc>${escapeXml(absoluteUrl(page.path))}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <priority>${page.sitemapPriority.toFixed(1)}</priority>
  </url>`
    )
    .join("\n")}\n</urlset>\n`
}

export function buildRobotsTxt() {
  return `User-agent: *\nDisallow:\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`
}

export function getShowcasePath(config: GithubShowcaseConfig) {
  return `/${config.slug}`
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${siteSeo.origin}${path.startsWith("/") ? path : `/${path}`}`
}

export function assertUniqueSeoPaths(pages = indexableSeoPages) {
  const seen = new Set<string>()
  for (const page of pages) {
    if (seen.has(page.path)) {
      throw new Error(`Duplicate SEO path: ${page.path}`)
    }
    seen.add(page.path)
  }
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "")
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
