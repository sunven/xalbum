import { Component, type ChangeEvent } from "react"
import type { ToolCatalog, ToolCatalogEntry } from "@/lib/tool-catalog"

type ToolCatalogPageProps = {
  catalog: ToolCatalog
}

type ToolCatalogPageState = {
  searchQuery: string
  selectedTagId: number | null
}

export class ToolCatalogPage extends Component<
  ToolCatalogPageProps,
  ToolCatalogPageState
> {
  state = {
    searchQuery: "",
    selectedTagId: null,
  }

  private handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: event.target.value })
  }

  private clearSearch = () => {
    this.setState({ searchQuery: "" })
  }

  private selectTag = (tagId: number) => {
    this.setState(({ selectedTagId }) => ({
      selectedTagId: selectedTagId === tagId ? null : tagId,
    }))
  }

  render() {
    const { catalog } = this.props
    const { searchQuery, selectedTagId } = this.state
    const orderedTags = getTagsByUsage(catalog)
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()
    const visibleTools = catalog.tools.filter((tool) => {
      const matchesSearch = normalizedSearchQuery
        ? toolMatchesSearch(tool, normalizedSearchQuery)
        : true
      const matchesTag =
        selectedTagId === null ||
        tool.tags.some((tag) => tag.id === selectedTagId)

      return matchesSearch && matchesTag
    })

    return (
      <main className="min-h-screen bg-[oklch(0.985_0.003_240)] text-[oklch(0.19_0.028_240)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-5 sm:px-6 lg:px-8">
          <header className="border-b border-[oklch(0.84_0.018_230)] pb-5">
            <a
              href="/"
              className="inline-flex h-8 items-center border border-[oklch(0.84_0.018_230)] bg-white/70 px-3 font-mono text-[10px] tracking-widest text-[oklch(0.5_0.03_230)] uppercase shadow-sm transition-colors hover:border-[oklch(0.58_0.13_200)] hover:text-[oklch(0.58_0.13_200)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
            >
              首页
            </a>
            <div className="mt-8 max-w-4xl">
              <p className="font-mono text-[10px] tracking-[0.28em] text-[oklch(0.58_0.13_200)] uppercase">
                SYS://LOCAL_DATA.CATALOG
              </p>
              <h1 className="mt-3 font-mono text-4xl leading-tight font-semibold text-balance sm:text-6xl">
                工具目录
              </h1>
              <p className="mt-4 max-w-3xl font-sans text-base leading-8 text-[oklch(0.42_0.035_230)]">
                直接展示 src/data 中的本地工具数据，把原始记录整理成可浏览的
                XAlbum 工具索引。
              </p>
            </div>
          </header>

          <dl
            className="grid gap-px border border-[oklch(0.84_0.018_230)] bg-[oklch(0.84_0.018_230)] shadow-sm sm:grid-cols-2 lg:grid-cols-4"
            aria-label="工具目录统计"
          >
            <StatBlock label="TOOLS_INDEXED" value={catalog.stats.totalTools} />
            <StatBlock label="TAGS_AVAILABLE" value={catalog.stats.totalTags} />
            <StatBlock
              label="WEBSITE_LINKS"
              value={catalog.stats.websiteTools}
            />
            <StatBlock label="GITHUB_LINKS" value={catalog.stats.githubTools} />
          </dl>

          <section
            className="grid gap-3 border border-[oklch(0.84_0.018_230)] bg-white/85 p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
            aria-label="工具目录搜索"
          >
            <label className="flex min-w-0 flex-col gap-2">
              <span className="font-mono text-[10px] tracking-[0.22em] text-[oklch(0.5_0.03_230)] uppercase">
                搜索工具
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={this.handleSearchChange}
                aria-label="搜索工具"
                placeholder="按名称、官网、GitHub 或标签搜索"
                className="h-11 min-w-0 border border-[oklch(0.84_0.018_230)] bg-white px-3 font-sans text-sm text-[oklch(0.22_0.03_240)] outline-none transition-colors placeholder:text-[oklch(0.56_0.03_230)] focus:border-[oklch(0.58_0.13_200)] focus:ring-2 focus:ring-[oklch(0.58_0.13_200_/_0.18)]"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <p className="font-mono text-sm text-[oklch(0.22_0.03_240)] md:text-right">
                <span className="text-[oklch(0.58_0.13_200)]">
                  {visibleTools.length} / {catalog.tools.length}
                </span>
                <span className="ml-2 text-[10px] tracking-[0.22em] text-[oklch(0.5_0.03_230)] uppercase">
                  MATCHED
                </span>
              </p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={this.clearSearch}
                  className="h-9 border border-[oklch(0.84_0.018_230)] bg-white px-3 font-mono text-[11px] text-[oklch(0.22_0.03_240)] transition-colors hover:border-[oklch(0.58_0.13_200)] hover:text-[oklch(0.58_0.13_200)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
                >
                  清空搜索
                </button>
              ) : null}
            </div>
          </section>

          <section
            className="border border-[oklch(0.84_0.018_230)] bg-white/85 p-4 shadow-sm"
            aria-label="工具目录标签筛选"
          >
            <h2 className="font-mono text-[10px] tracking-[0.22em] text-[oklch(0.5_0.03_230)] uppercase">
              TAG_FILTERS
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {orderedTags.map((tag) => {
                const active = selectedTagId === tag.id
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => this.selectTag(tag.id)}
                    aria-pressed={active}
                    className={
                      active
                        ? "h-8 border border-[oklch(0.58_0.13_200)] bg-[oklch(0.58_0.13_200)] px-3 font-mono text-[11px] text-white transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
                        : "h-8 border border-[oklch(0.84_0.018_230)] bg-white px-3 font-mono text-[11px] text-[oklch(0.22_0.03_240)] transition-colors hover:border-[oklch(0.58_0.13_200)] hover:text-[oklch(0.58_0.13_200)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
                    }
                  >
                    #{tag.name}
                  </button>
                )
              })}
            </div>
          </section>

          {visibleTools.length > 0 ? (
            <section
              className="grid min-w-0 grid-cols-1 gap-px border border-[oklch(0.84_0.018_230)] bg-[oklch(0.84_0.018_230)] shadow-sm md:grid-cols-2 xl:grid-cols-3"
              aria-label="工具列表"
            >
              {visibleTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </section>
          ) : (
            <section
              className="border border-[oklch(0.84_0.018_230)] bg-white/85 p-8 text-center shadow-sm"
              aria-label="工具列表"
            >
              <h2 className="font-mono text-xl font-semibold text-[oklch(0.22_0.03_240)]">
                没有匹配的工具
              </h2>
              <p className="mt-3 font-sans text-sm leading-6 text-[oklch(0.5_0.03_230)]">
                调整搜索词，或清空搜索回到完整目录。
              </p>
            </section>
          )}
        </div>
      </main>
    )
  }
}

function toolMatchesSearch(tool: ToolCatalogEntry, query: string) {
  return [
    tool.name,
    tool.description,
    tool.websiteUrl,
    tool.githubUrl,
    ...tool.tags.map((tag) => tag.name),
  ].some((value) => value?.toLowerCase().includes(query))
}

function getTagsByUsage(catalog: ToolCatalog) {
  const usageByTagId = new Map<number, number>()

  for (const tool of catalog.tools) {
    for (const tag of tool.tags) {
      usageByTagId.set(tag.id, (usageByTagId.get(tag.id) ?? 0) + 1)
    }
  }

  return [...catalog.tags].sort((firstTag, secondTag) => {
    const usageDifference =
      (usageByTagId.get(secondTag.id) ?? 0) -
      (usageByTagId.get(firstTag.id) ?? 0)

    return usageDifference || firstTag.name.localeCompare(secondTag.name)
  })
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/85 p-4 font-mono">
      <dt className="text-[10px] tracking-[0.22em] text-[oklch(0.5_0.03_230)] uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-3xl font-semibold text-[oklch(0.22_0.03_240)]">
        {value}
      </dd>
    </div>
  )
}

function ToolCard({ tool }: { tool: ToolCatalogEntry }) {
  return (
    <article
      aria-label={tool.name}
      className="flex min-h-48 min-w-0 flex-col gap-4 bg-white/90 p-4 shadow-sm"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 className="min-w-0 font-mono text-base font-semibold break-words text-[oklch(0.22_0.03_240)]">
          {tool.name}
        </h2>
        <span className="shrink-0 font-mono text-[10px] text-[oklch(0.58_0.13_200)]">
          #{tool.id}
        </span>
      </div>

      {tool.description ? (
        <p className="font-sans text-sm leading-6 text-[oklch(0.42_0.035_230)]">
          {tool.description}
        </p>
      ) : (
        <p className="font-sans text-sm leading-6 text-[oklch(0.5_0.03_230)]">
          暂无描述，保留官网与标签作为索引信号。
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {tool.tags.length > 0 ? (
          tool.tags.map((tag) => (
            <span
              key={tag.id}
              className="border border-[oklch(0.84_0.018_230)] bg-[oklch(0.96_0.01_220)] px-2 py-1 font-mono text-[10px] tracking-wider text-[oklch(0.3_0.04_230)] uppercase"
            >
              #{tag.name}
            </span>
          ))
        ) : (
          <span className="border border-[oklch(0.84_0.018_230)] bg-[oklch(0.96_0.008_230)] px-2 py-1 font-mono text-[10px] tracking-wider text-[oklch(0.5_0.03_230)] uppercase">
            #UNTAGGED
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-[oklch(0.9_0.01_230)] pt-3">
        {tool.websiteUrl ? (
          <ExternalLink href={tool.websiteUrl} label="官网" />
        ) : null}
        {tool.githubUrl ? (
          <ExternalLink href={tool.githubUrl} label="GitHub" />
        ) : null}
      </div>
    </article>
  )
}

function ExternalLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 items-center gap-1.5 border border-[oklch(0.84_0.018_230)] bg-white px-2.5 font-mono text-[11px] font-medium text-[oklch(0.22_0.03_240)] transition-colors hover:border-[oklch(0.58_0.13_200)] hover:text-[oklch(0.58_0.13_200)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
    >
      {label}
    </a>
  )
}
