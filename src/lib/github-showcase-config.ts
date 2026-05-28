export type RepoConfig = {
  id: `${string}/${string}`
  npmPackage?: string
}

export type GithubShowcaseConfig = {
  pageId: string
  slug: string
  systemLabel: string
  title: string
  description: string
  seo: {
    title: string
    description: string
    searchTerms: Array<string>
    ogImage: string
    lastModified: string
    sitemapPriority: number
  }
  repoCountLabel: string
  sectionLabel: string
  footerLabel: string
  emptyMessage: string
  repoConfigs: Array<RepoConfig>
}

export const sddShowcaseConfig = {
  pageId: "sdd",
  slug: "sdd",
  systemLabel: "SYS://SDD.TOOLS.INIT",
  title: "SDD 框架与工具图谱",
  description:
    "聚合 Spec-driven development (SDD) 相关开源框架与工具，追踪从规格、任务、产品意图到 Agent 执行工作流的 GitHub 项目活跃度。",
  seo: {
    title: "SDD 工具图谱 | Spec-Driven Development Tools",
    description:
      "XAlbum 聚合 Spec-Driven Development、agent workflow 与规格驱动开发工具，帮助 AI builders 发现活跃的 SDD 开源项目。",
    searchTerms: [
      "SDD tools",
      "spec-driven development",
      "agent workflow tools",
      "规格驱动开发工具",
    ],
    ogImage: "/logo.svg",
    lastModified: "2026-05-23",
    sitemapPriority: 0.8,
  },
  repoCountLabel: "SDD_TOOLS",
  sectionLabel: "SDD 框架与工具列表",
  footerLabel: "v0.app // sdd_tools_index",
  emptyMessage:
    "No SDD framework or tooling repositories returned from GitHub.",
  repoConfigs: [
    {
      id: "github/spec-kit",
    },
    {
      id: "Fission-AI/OpenSpec",
    },
    {
      id: "MrLesk/Backlog.md",
    },
    {
      id: "bmad-code-org/BMAD-METHOD",
    },
    {
      id: "buildermethods/agent-os",
    },
    {
      id: "obra/superpowers",
    },
    {
      id: "SuperClaude-Org/SuperClaude_Framework",
    },
    { id: "affaan-m/everything-claude-code" },
    { id: "EveryInc/compound-engineering-plugin" },
    { id: "gsd-build/get-shit-done" },
    { id: "yeachan-heo/oh-my-claudecode" },
    { id: "Yeachan-Heo/oh-my-codex" },
    { id: "garrytan/gstack", npmPackage: "gstack" },
    { id: "ruvnet/ruflo" },
    { id: "addyosmani/agent-skills" },
    { id: "OthmanAdi/planning-with-files" },
    { id: "mattpocock/skills" },
  ],
} satisfies GithubShowcaseConfig

export const aiToUiShowcaseConfig = {
  pageId: "ai-to-ui",
  slug: "ai-to-ui",
  systemLabel: "SYS://AI_TO_UI.TOOLS.INIT",
  title: "AI-to-UI 工具图谱",
  description:
    "聚合 AI-to-UI 相关开源工具，追踪从结构化数据、设计意图到界面生成工作流的 GitHub 项目活跃度。",
  seo: {
    title: "AI-to-UI 工具图谱 | AI Interface Generation Tools",
    description:
      "XAlbum 聚合 AI-to-UI、生成式 UI 与结构化界面渲染工具，帮助 AI builders 发现活跃的开源界面生成项目。",
    searchTerms: [
      "AI-to-UI tools",
      "AI interface generation",
      "generative UI",
      "AI 界面生成工具",
    ],
    ogImage: "/logo.svg",
    lastModified: "2026-05-23",
    sitemapPriority: 0.8,
  },
  repoCountLabel: "AI_UI_TOOLS",
  sectionLabel: "AI-to-UI 工具列表",
  footerLabel: "v0.app // ai_to_ui_tools_index",
  emptyMessage:
    "No AI-to-UI framework or tooling repositories returned from GitHub.",
  repoConfigs: [
    { id: "vercel-labs/json-render" },
    { id: "CopilotKit/CopilotKit" },
    { id: "tambo-ai/tambo" },
    { id: "thesysdev/openui" },
    // { id: "PrefectHQ/prefab" }, // star 数较少，暂不展示
    { id: "CopilotKit/OpenGenerativeUI" },
    { id: "CopilotKit/generative-ui" },
    // { id: "miurla/morphic" }, // 搜索相关
    // { id: "nraiden/cofounder" }, // 代码生成
    { id: "google/a2ui"},
  ],
} satisfies GithubShowcaseConfig

export const githubShowcaseConfigs = [
  sddShowcaseConfig,
  aiToUiShowcaseConfig,
] satisfies Array<GithubShowcaseConfig>
