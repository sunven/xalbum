export type RepoConfig = {
  id: `${string}/${string}`
  npmPackage?: string
}

export type GithubShowcaseConfig = {
  pageId: string
  systemLabel: string
  title: string
  description: string
  repoCountLabel: string
  sectionLabel: string
  footerLabel: string
  emptyMessage: string
  repoConfigs: Array<RepoConfig>
}

export const sddShowcaseConfig = {
  pageId: "sdd",
  systemLabel: "SYS://SDD.TOOLS.INIT",
  title: "SDD 框架与工具图谱",
  description:
    "聚合 Spec-driven development (SDD) 相关开源框架与工具，追踪从规格、任务、产品意图到 Agent 执行工作流的 GitHub 项目活跃度。",
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
  systemLabel: "SYS://AI_TO_UI.TOOLS.INIT",
  title: "AI-to-UI 工具图谱",
  description:
    "聚合 AI-to-UI 相关开源工具，追踪从结构化数据、设计意图到界面生成工作流的 GitHub 项目活跃度。",
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
    { id: "PrefectHQ/prefab" },
    { id: "CopilotKit/OpenGenerativeUI" },
    { id: "CopilotKit/generative-ui" },
    { id: "miurla/morphic" },
    { id: "nraiden/cofounder" },
    { id: "google/a2ui"},
  ],
} satisfies GithubShowcaseConfig
