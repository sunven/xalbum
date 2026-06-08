// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { ToolCatalogPage } from "@/components/tool-catalog-page"
import type { ToolCatalog } from "@/lib/tool-catalog"

const catalog = {
  stats: {
    totalTools: 3,
    totalTags: 2,
    websiteTools: 3,
    githubTools: 1,
  },
  tags: [
    { id: 16, name: "Browser Extension" },
    { id: 99, name: "Unused" },
    { id: 13, name: "API" },
  ],
  tools: [
    {
      id: 1,
      name: "Apipost",
      description: null,
      websiteUrl: "https://www.apipost.cn/",
      githubUrl: null,
      tags: [{ id: 13, name: "API" }],
    },
    {
      id: 2,
      name: "Insomnia",
      description: null,
      websiteUrl: "https://insomnia.rest/",
      githubUrl: "https://github.com/Kong/insomnia",
      tags: [{ id: 13, name: "API" }],
    },
    {
      id: 3,
      name: "Plasmo",
      description: null,
      websiteUrl: "https://www.plasmo.com/",
      githubUrl: null,
      tags: [{ id: 16, name: "Browser Extension" }],
    },
  ],
} satisfies ToolCatalog

afterEach(() => {
  cleanup()
})

describe("ToolCatalogPage", () => {
  it("shows catalog stats, tools, tag names, and external links", () => {
    render(<ToolCatalogPage catalog={catalog} />)

    expect(
      screen.getByRole("heading", { name: /工具目录/i })
    ).toBeTruthy()
    const stats = screen.getByLabelText("工具目录统计")
    expect(within(stats).getByText("TOOLS_INDEXED")).toBeTruthy()
    expect(within(stats).getByText("TAGS_AVAILABLE")).toBeTruthy()
    expect(within(stats).getByText("GITHUB_LINKS")).toBeTruthy()
    expect(within(stats).getAllByText("3")).toHaveLength(2)

    const apipost = screen.getByRole("article", { name: "Apipost" })
    expect(within(apipost).getByText("#API")).toBeTruthy()
    expect(
      within(apipost).getByRole("link", { name: "官网" }).getAttribute("href")
    ).toBe("https://www.apipost.cn/")
    expect(
      within(apipost).queryByRole("link", { name: "GitHub" })
    ).toBeNull()

    const insomnia = screen.getByRole("article", { name: "Insomnia" })
    expect(
      within(insomnia).getByRole("link", { name: "GitHub" }).getAttribute(
        "href"
      )
    ).toBe("https://github.com/Kong/insomnia")
    expect(
      within(insomnia).getByRole("link", { name: "GitHub" }).getAttribute(
        "target"
      )
    ).toBe("_blank")
    expect(
      within(insomnia).getByRole("link", { name: "GitHub" }).getAttribute("rel")
    ).toBe("noreferrer")
    expect(screen.getByRole("article", { name: "Plasmo" })).toBeTruthy()
  })

  it("filters tools by name, URL, and tag text", () => {
    render(<ToolCatalogPage catalog={catalog} />)

    const search = screen.getByRole("searchbox", { name: "搜索工具" })

    fireEvent.change(search, { target: { value: "insomnia" } })
    expect(screen.getByText("1 / 3")).toBeTruthy()
    expect(screen.queryByRole("article", { name: "Apipost" })).toBeNull()
    expect(screen.getByRole("article", { name: "Insomnia" })).toBeTruthy()
    expect(screen.queryByRole("article", { name: "Plasmo" })).toBeNull()

    fireEvent.change(search, { target: { value: "apipost.cn" } })
    expect(screen.getByText("1 / 3")).toBeTruthy()
    expect(screen.getByRole("article", { name: "Apipost" })).toBeTruthy()
    expect(screen.queryByRole("article", { name: "Insomnia" })).toBeNull()
    expect(screen.queryByRole("article", { name: "Plasmo" })).toBeNull()

    fireEvent.change(search, { target: { value: "api" } })
    expect(screen.getByText("2 / 3")).toBeTruthy()
    expect(screen.getByRole("article", { name: "Apipost" })).toBeTruthy()
    expect(screen.getByRole("article", { name: "Insomnia" })).toBeTruthy()
    expect(screen.queryByRole("article", { name: "Plasmo" })).toBeNull()
  })

  it("shows an empty state and clears the active search", () => {
    render(<ToolCatalogPage catalog={catalog} />)

    const search = screen.getByRole("searchbox", { name: "搜索工具" })

    fireEvent.change(search, { target: { value: "missing-tool" } })
    expect(screen.getByText("0 / 3")).toBeTruthy()
    expect(screen.getByText("没有匹配的工具")).toBeTruthy()
    expect(screen.queryByRole("article", { name: "Apipost" })).toBeNull()
    expect(screen.queryByRole("article", { name: "Insomnia" })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "清空搜索" }))
    expect(screen.getByText("3 / 3")).toBeTruthy()
    expect(screen.getByRole("article", { name: "Apipost" })).toBeTruthy()
    expect(screen.getByRole("article", { name: "Insomnia" })).toBeTruthy()
    expect(screen.getByRole("article", { name: "Plasmo" })).toBeTruthy()
    expect(search).toHaveProperty("value", "")
  })

  it("filters tools by a readable tag control", () => {
    render(<ToolCatalogPage catalog={catalog} />)

    fireEvent.click(screen.getByRole("button", { name: "#Browser Extension" }))

    expect(screen.getByText("1 / 3")).toBeTruthy()
    expect(screen.queryByRole("article", { name: "Apipost" })).toBeNull()
    expect(screen.queryByRole("article", { name: "Insomnia" })).toBeNull()
    expect(screen.getByRole("article", { name: "Plasmo" })).toBeTruthy()
  })

  it("keeps frequently used tag controls easiest to reach", () => {
    render(<ToolCatalogPage catalog={catalog} />)

    const tagFilters = screen.getByLabelText("工具目录标签筛选")
    const tagButtons = within(tagFilters).getAllByRole("button")

    expect(tagButtons.map((button) => button.textContent)).toEqual([
      "#API",
      "#Browser Extension",
      "#Unused",
    ])
  })

  it("combines search with tag filtering and lets users clear each constraint", () => {
    render(<ToolCatalogPage catalog={catalog} />)

    const search = screen.getByRole("searchbox", { name: "搜索工具" })
    const apiTag = screen.getByRole("button", { name: "#API" })

    fireEvent.click(apiTag)
    expect(apiTag.getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByText("2 / 3")).toBeTruthy()

    fireEvent.change(search, { target: { value: "plasmo" } })
    expect(screen.getByText("0 / 3")).toBeTruthy()
    expect(screen.getByText("没有匹配的工具")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "清空搜索" }))
    expect(search).toHaveProperty("value", "")
    expect(apiTag.getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByText("2 / 3")).toBeTruthy()
    expect(screen.getByRole("article", { name: "Apipost" })).toBeTruthy()
    expect(screen.getByRole("article", { name: "Insomnia" })).toBeTruthy()
    expect(screen.queryByRole("article", { name: "Plasmo" })).toBeNull()

    fireEvent.click(apiTag)
    expect(apiTag.getAttribute("aria-pressed")).toBe("false")
    expect(screen.getByText("3 / 3")).toBeTruthy()
    expect(screen.getByRole("article", { name: "Plasmo" })).toBeTruthy()
  })
})
