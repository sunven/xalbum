# 展示 src/data 数据的工具目录页 PRD

Status: done

## Problem Statement

当前仓库已经有一份较大的工具数据集和标签数据集，但这些数据还没有一个面向用户的浏览页面。用户无法在站点内直接查看有哪些工具、每个工具关联了哪些标签、哪些工具有官网或 GitHub 链接，也无法通过搜索和筛选快速定位目标工具。

这导致数据虽然已经进入仓库，却还停留在原始资产状态，不能成为 XAlbum 工具图谱的一部分，也不方便后续继续清洗、扩展和传播。

## Solution

新增一个可搜索、可筛选的工具目录页，把仓库里的静态工具数据展示成面向用户的目录体验。

页面应以 XAlbum 现有的工具图谱视觉语言为基础，展示工具总量、标签总量、GitHub 覆盖情况、官网覆盖情况等关键统计，并提供搜索、标签筛选、外链访问和空状态反馈。用户进入页面后，可以快速扫视全部工具，也可以按名称、链接、标签过滤数据，找到感兴趣的工具并跳转到官网或 GitHub。

## User Stories

1. As an AI builder, I want to browse all indexed tools, so that I can discover useful tools without reading raw JSON.
2. As an AI builder, I want to search tools by name, so that I can quickly find a tool I already know.
3. As an AI builder, I want to search tools by website or GitHub URL, so that I can locate a tool even when I only remember its domain or repository.
4. As an AI builder, I want to filter tools by tag, so that I can focus on one tool category at a time.
5. As an AI builder, I want to combine search and tag filters, so that I can narrow a large list down to relevant candidates.
6. As an AI builder, I want to clear the current search and filters, so that I can return to the full catalog quickly.
7. As an AI builder, I want to see how many tools match my current filters, so that I understand whether the page is narrowing the list correctly.
8. As an AI builder, I want to see total tool and tag counts, so that I understand the size of the catalog.
9. As an AI builder, I want to see how many tools have GitHub links, so that I can tell how much of the catalog points to inspectable open source projects.
10. As an AI builder, I want to see how many tools have website links, so that I know whether each entry is actionable.
11. As an AI builder, I want every tool card or row to show the tool name, so that I can scan the catalog.
12. As an AI builder, I want tool entries to show associated tag names, so that I understand why a tool appears in a category.
13. As an AI builder, I want tool entries to show a website link when present, so that I can open the product directly.
14. As an AI builder, I want tool entries to show a GitHub link when present, so that I can inspect source code or project activity.
15. As an AI builder, I want missing optional fields to be handled cleanly, so that sparse records do not make the page look broken.
16. As an AI builder, I want records without descriptions to still render usefully, so that the catalog remains complete despite incomplete source data.
17. As an AI builder, I want malformed or missing tag references to be ignored gracefully, so that one bad record does not break the page.
18. As an AI builder, I want tags to be displayed using human-readable names, so that I do not have to interpret numeric tag IDs.
19. As an AI builder, I want popular or frequently used tags to be easy to find, so that filtering starts from useful options.
20. As an AI builder, I want external links to open safely in a new tab, so that I do not lose my place in the catalog.
21. As a site visitor on mobile, I want the catalog controls to fit on a narrow screen, so that I can browse the data from my phone.
22. As a site visitor on desktop, I want a dense but readable layout, so that I can scan hundreds of records efficiently.
23. As a site visitor, I want an empty state when no tools match my filters, so that I know the page is working rather than broken.
24. As a site visitor, I want the empty state to offer a clear reset action, so that I can recover from over-filtering.
25. As a site visitor, I want the page to look consistent with the existing XAlbum routes, so that it feels like part of the same product.
26. As a site visitor, I want the page to load without waiting for external APIs, so that the static catalog is fast and reliable.
27. As a site visitor, I want the page to preserve readable Chinese UI copy with searchable English technical terms, so that it matches the current bilingual style.
28. As a maintainer, I want the raw data normalized behind a small data-shaping layer, so that UI components do not need to parse raw JSON fields directly.
29. As a maintainer, I want tests around tag parsing and lookup behavior, so that future data edits do not silently break the catalog.
30. As a maintainer, I want route-level tests around the visible catalog behavior, so that refactors keep the user-facing experience intact.
31. As a maintainer, I want the feature to avoid introducing a backend dependency, so that deployment remains as simple as the existing static-data routes.
32. As a maintainer, I want the page to tolerate additions to the data files, so that adding more tools does not require changing the page code.
33. As a maintainer, I want the page to expose only cleaned display data to the UI, so that unusual source formats stay isolated.
34. As a maintainer, I want the SEO metadata to include the new catalog route, so that public pages and sitemap behavior remain coherent.
35. As a maintainer, I want this feature to reuse existing design primitives and app routing patterns, so that implementation stays small and consistent.

## Implementation Decisions

- Build a new first-class catalog route for the static tool dataset rather than extending the existing GitHub showcase pages.
- Keep the data source local and synchronous from the bundled JSON assets; this feature should not call GitHub, npm, or other external APIs.
- Add a small normalization layer that converts raw tool records into display-ready tool entries.
- Parse the raw tag field as an array of numeric tag IDs and join those IDs against the tag dataset.
- Preserve records even when optional fields are missing; missing descriptions, GitHub URLs, or category IDs should not exclude a tool.
- Treat website as the primary external destination because every current tool record has one.
- Treat GitHub as an optional secondary destination because only a subset of records include it.
- Prefer human-readable tag names in the UI; raw tag IDs should not be shown to normal users.
- Provide client-side search over tool name, website, GitHub URL, and tag names.
- Provide tag filtering that can work together with search.
- Include summary statistics for total tools, total tags, visible result count, website coverage, and GitHub coverage.
- Use the existing XAlbum visual direction: technical, bilingual, dense enough for repeated scanning, and consistent with the current map pages.
- Avoid a marketing-style landing page. The first viewport should be the usable catalog experience.
- Keep controls stable across responsive layouts: search input, filter controls, result count, and reset action should not shift unpredictably.
- Add SEO metadata for the new route and include it in the existing indexable page set if the route is intended to be public.
- Do not add persistence for filters in this PRD; filters can reset on page refresh unless implementation finds an existing lightweight pattern worth reusing.
- Do not introduce pagination unless rendering all records creates a measured performance issue; the current dataset size is small enough for client-side filtering.

## Testing Decisions

- Good tests should verify external behavior: what users can see, search, filter, click, and reset. They should not assert component internals or private implementation details.
- Add pure data-shaping tests for converting raw tool records into display-ready entries.
- Data-shaping tests should cover valid tag arrays, empty tag arrays, malformed tag strings, missing tag IDs, missing optional fields, and GitHub coverage counting.
- Add route or component behavior tests that render the catalog page with representative data and assert visible tool names, tag names, summary counts, search results, filter results, empty state, and reset behavior.
- Follow the existing Vitest style used by the repository's library tests: small focused cases, explicit fixtures, and assertions against observable output.
- Run typecheck to verify JSON imports, normalized data types, and route wiring.
- Run the production build to verify TanStack route generation, SEO metadata, and bundled JSON behavior.

## Out of Scope

- Editing, adding, or deleting tools from the browser.
- Persisting filters or search state across sessions.
- User accounts, favorites, voting, comments, or personal collections.
- Fetching live GitHub stars, releases, issues, or repository metadata for this dataset.
- Data cleaning beyond what is required to safely display the current records.
- Replacing the existing SDD or AI-to-UI showcase pages.
- Creating a full admin dashboard for data quality.
- Building a new issue tracker or changing the local markdown workflow.

## Further Notes

- Current data inspection found 409 tool records and 118 tag records.
- The tool records currently include name, description, website, GitHub, category ID, and tags fields.
- Most descriptions are empty, so the catalog should not depend on description text to feel useful.
- The source tag field is stored as a string representation of an ID array, so parsing and fallback behavior are central to this feature.
- The page should use Chinese primary UI copy while retaining English technical labels where they match the existing XAlbum style.
