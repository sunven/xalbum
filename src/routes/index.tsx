import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowRight,
  ArrowUpRight,
  BracketsCurly,
  Compass,
  Database,
  GitBranch,
  MagnifyingGlass,
  Pulse,
  Sparkle,
  TerminalWindow,
} from "@phosphor-icons/react"
import type { ComponentType, SVGProps } from "react"
import DotField from "@/components/DotField"
import xalbumLogo from "@/logo.svg"
import {
  aiToUiShowcaseConfig,
  sddShowcaseConfig,
} from "@/lib/github-showcase-config"
import { buildRouteHead, homeSeoPage } from "@/lib/seo"

type DotFieldProps = {
  dotRadius?: number
  dotSpacing?: number
  cursorRadius?: number
  bulgeStrength?: number
  glowRadius?: number
  sparkle?: boolean
  waveAmplitude?: number
  gradientFrom?: string
  gradientTo?: string
  glowColor?: string
}

type ShowcaseLink = {
  href: string
  title: string
  label: string
  command: string
  description: string
  accent: string
  statLabel: string
  statValue: string
  highlights: Array<string>
  sampleRepos: Array<string>
}

const HomeDotField = DotField as ComponentType<DotFieldProps>
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export const Route = createFileRoute("/")({
  head: () => buildRouteHead(homeSeoPage),
  component: App,
})

const showcaseLinks = [
  {
    href: "/sdd",
    title: sddShowcaseConfig.title,
    label: "SPEC_WORKFLOW",
    command: "open /maps/sdd",
    description:
      "从规格、任务、产品意图到 Agent 执行工作流，追踪 SDD 生态里真正活跃的开源项目。",
    accent: "oklch(0.58 0.13 200)",
    statLabel: sddShowcaseConfig.repoCountLabel,
    statValue: sddShowcaseConfig.repoConfigs.length.toString().padStart(2, "0"),
    highlights: ["规格驱动开发", "Agent workflow", "版本活跃度"],
    sampleRepos: sddShowcaseConfig.repoConfigs.slice(0, 4).map(({ id }) => id),
  },
  {
    href: "/ai-to-ui",
    title: aiToUiShowcaseConfig.title,
    label: "INTERFACE_GENERATION",
    command: "open /maps/ai-to-ui",
    description:
      "整理结构化数据、设计意图和生成式 UI 渲染链路，帮助你判断 AI-to-UI 工具走到哪里了。",
    accent: "oklch(0.62 0.15 145)",
    statLabel: aiToUiShowcaseConfig.repoCountLabel,
    statValue: aiToUiShowcaseConfig.repoConfigs.length
      .toString()
      .padStart(2, "0"),
    highlights: ["生成式界面", "结构化渲染", "设计到代码"],
    sampleRepos: aiToUiShowcaseConfig.repoConfigs
      .slice(0, 4)
      .map(({ id }) => id),
  },
] satisfies Array<ShowcaseLink>

const totalRepos = showcaseLinks.reduce(
  (sum, showcase) => sum + Number(showcase.statValue),
  0
)

const systemStats = [
  {
    label: "MAPS_ONLINE",
    value: showcaseLinks.length.toString().padStart(2, "0"),
  },
  {
    label: "REPOS_INDEXED",
    value: totalRepos.toString().padStart(2, "0"),
  },
  {
    label: "SIGNAL",
    value: "LIVE",
  },
  {
    label: "AUDIENCE",
    value: "BUILDERS",
  },
]

const workflowSignals = [
  {
    icon: Compass,
    title: "按工作流归类",
    body: "每张图谱围绕一个 builder 问题组织，不把仓库当随机链接堆起来。",
  },
  {
    icon: Pulse,
    title: "看活跃度信号",
    body: "卡片保留 stars、issues、版本来源、更新时间，先判断项目是否还在动。",
  },
  {
    icon: BracketsCurly,
    title: "中英双语可检索",
    body: "中文可读，英文术语和 slug 可被搜索引擎索引，适合公开传播。",
  },
]

function App() {
  return (
    <main className="relative min-h-svh overflow-x-clip bg-[oklch(0.985_0.003_240)] text-[oklch(0.19_0.028_240)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_72%,transparent_100%)] opacity-85"
      >
        <HomeDotField
          dotRadius={1.2}
          dotSpacing={17}
          cursorRadius={420}
          bulgeStrength={48}
          glowRadius={0}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom="oklch(0.58 0.13 200 / 0.25)"
          gradientTo="oklch(0.62 0.15 145 / 0.17)"
          glowColor="transparent"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[540px] bg-[linear-gradient(135deg,oklch(0.58_0.13_200_/_0.14),transparent_34%,oklch(0.62_0.15_145_/_0.13)_72%,transparent)]"
      />

      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col px-5 py-5 sm:px-6 lg:px-8">
        <SiteHeader />

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.78fr)] lg:py-14">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-5">
              <div className="flex w-fit items-center gap-2 border border-[oklch(0.84_0.018_230)] bg-white/75 px-3 py-2 font-mono text-[10px] tracking-[0.28em] text-[oklch(0.5_0.03_230)] uppercase shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[oklch(0.58_0.13_200)] opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[oklch(0.58_0.13_200)]" />
                </span>
                SYS://TOOLS_ATLAS.READY
              </div>

              <div className="max-w-5xl">
                <h1 className="font-mono text-[clamp(2.75rem,8vw,6.8rem)] leading-[0.88] font-semibold tracking-tight text-balance">
                  XAlbum
                  <span className="block text-[oklch(0.58_0.13_200)]">
                    工具图谱
                  </span>
                </h1>
                <p className="mt-6 max-w-3xl font-sans text-base leading-8 text-[oklch(0.42_0.035_230)] sm:text-lg">
                  给 AI builders 的开源工具雷达。把 SDD、AI-to-UI 和 agent
                  workflow 相关项目整理成可比较、可追踪、可继续扩展的图谱。
                </p>
              </div>
            </div>

            <div className="grid gap-px border border-[oklch(0.84_0.018_230)] bg-[oklch(0.84_0.018_230)] font-mono text-xs shadow-sm sm:grid-cols-4">
              {systemStats.map((stat) => (
                <StatBlock key={stat.label} {...stat} />
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/sdd"
                className="group inline-flex h-12 items-center justify-center gap-2 border border-[oklch(0.58_0.13_200)] bg-[oklch(0.58_0.13_200)] px-5 font-mono text-xs font-semibold tracking-widest text-white uppercase shadow-[0_16px_34px_-22px_oklch(0.58_0.13_200)] transition-colors hover:bg-[oklch(0.53_0.13_200)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
              >
                打开 SDD 图谱
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
              <a
                href="/ai-to-ui"
                className="inline-flex h-12 items-center justify-center gap-2 border border-[oklch(0.84_0.018_230)] bg-white/70 px-5 font-mono text-xs font-semibold tracking-widest text-[oklch(0.22_0.03_240)] uppercase shadow-sm backdrop-blur transition-colors hover:border-[oklch(0.62_0.15_145_/_0.65)] hover:bg-[oklch(0.62_0.15_145_/_0.08)] focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.15_145_/_0.4)] focus-visible:outline-none"
              >
                浏览 AI-to-UI
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="/tools"
                className="inline-flex h-12 items-center justify-center gap-2 border border-[oklch(0.84_0.018_230)] bg-white/70 px-5 font-mono text-xs font-semibold tracking-widest text-[oklch(0.22_0.03_240)] uppercase shadow-sm backdrop-blur transition-colors hover:border-[oklch(0.58_0.13_200_/_0.55)] hover:bg-[oklch(0.58_0.13_200_/_0.08)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
              >
                工具目录
                <Database className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <AtlasConsole />
        </section>

        <section
          className="grid gap-4 pb-12 md:grid-cols-2"
          aria-label="工具图谱入口"
        >
          {showcaseLinks.map((showcase) => (
            <ShowcaseCard key={showcase.href} showcase={showcase} />
          ))}
        </section>

        <section
          className="grid gap-px border border-[oklch(0.84_0.018_230)] bg-[oklch(0.84_0.018_230)] shadow-sm md:grid-cols-3"
          aria-label="XAlbum 索引方式"
        >
          {workflowSignals.map((signal) => (
            <SignalPanel key={signal.title} {...signal} />
          ))}
        </section>

        <footer className="mt-10 flex flex-col gap-3 border-t border-[oklch(0.84_0.018_230)] py-6 font-mono text-[10px] tracking-widest text-[oklch(0.5_0.03_230)] uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>v0.app / xalbum_tools_atlas</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[oklch(0.62_0.15_145)]" />
            CURATION_PIPELINE_READY
          </span>
        </footer>
      </div>
    </main>
  )
}

function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[oklch(0.84_0.018_230)] pb-4">
      <a
        href="/"
        aria-label="XAlbum 首页"
        className="flex min-w-0 items-center gap-3 focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
      >
        <img src={xalbumLogo} alt="" className="h-10 w-auto shrink-0" />
        <span className="hidden min-w-0 font-mono text-[10px] tracking-[0.28em] text-[oklch(0.5_0.03_230)] uppercase sm:block">
          Curated maps for AI builders
        </span>
      </a>

      <nav
        className="flex shrink-0 items-center gap-2 font-mono text-[10px] tracking-widest uppercase"
        aria-label="主要页面"
      >
        <a
          href="/sdd"
          className="border border-[oklch(0.84_0.018_230)] bg-white/65 px-3 py-2 text-[oklch(0.42_0.035_230)] backdrop-blur transition-colors hover:border-[oklch(0.58_0.13_200_/_0.55)] hover:text-[oklch(0.58_0.13_200)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
        >
          SDD
        </a>
        <a
          href="/ai-to-ui"
          className="border border-[oklch(0.84_0.018_230)] bg-white/65 px-3 py-2 text-[oklch(0.42_0.035_230)] backdrop-blur transition-colors hover:border-[oklch(0.62_0.15_145_/_0.55)] hover:text-[oklch(0.47_0.13_145)] focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.15_145_/_0.4)] focus-visible:outline-none"
        >
          AI-to-UI
        </a>
        <a
          href="/tools"
          className="border border-[oklch(0.84_0.018_230)] bg-white/65 px-3 py-2 text-[oklch(0.42_0.035_230)] backdrop-blur transition-colors hover:border-[oklch(0.58_0.13_200_/_0.55)] hover:text-[oklch(0.58_0.13_200)] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.45)] focus-visible:outline-none"
        >
          Tools
        </a>
      </nav>
    </header>
  )
}

function AtlasConsole() {
  return (
    <aside
      className="relative min-h-[440px] overflow-hidden border border-[oklch(0.32_0.033_235)] bg-[oklch(0.145_0.018_245)] text-[oklch(0.93_0.022_225)] shadow-[0_24px_80px_-48px_oklch(0.22_0.03_240)]"
      aria-label="XAlbum 图谱状态"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.74_0.14_190_/_0.18),transparent_28%),radial-gradient(circle_at_80%_15%,oklch(0.76_0.16_145_/_0.14),transparent_26%),linear-gradient(180deg,transparent,oklch(0.13_0.018_245_/_0.78))]"
      />
      <div className="relative flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[10px] tracking-widest text-white/60 uppercase">
        <span className="flex items-center gap-2">
          <TerminalWindow className="size-4 text-[oklch(0.74_0.14_190)]" />
          atlas.console
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[oklch(0.76_0.16_145)]" />
          online
        </span>
      </div>

      <div className="relative grid gap-5 p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <NodeCard
            icon={Database}
            label="SOURCE"
            value="GitHub repos"
            tone="cyan"
          />
          <div
            aria-hidden="true"
            className="h-px w-10 bg-gradient-to-r from-[oklch(0.74_0.14_190)] to-[oklch(0.76_0.16_145)]"
          />
          <NodeCard
            icon={MagnifyingGlass}
            label="SIGNAL"
            value="version + activity"
            tone="green"
          />
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 border border-[oklch(0.74_0.14_190_/_0.22)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[14%] border border-[oklch(0.76_0.16_145_/_0.2)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[28%] border border-[oklch(0.74_0.14_190_/_0.22)]"
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-0 h-px w-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 h-full w-px bg-white/10"
          />
          <div className="relative flex size-36 flex-col items-center justify-center border border-[oklch(0.74_0.14_190_/_0.45)] bg-[oklch(0.15_0.02_245_/_0.9)] text-center shadow-[0_0_42px_oklch(0.74_0.14_190_/_0.2)]">
            <Sparkle
              className="mb-2 size-6 text-[oklch(0.76_0.16_145)]"
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] tracking-[0.24em] text-white/55 uppercase">
              xalbum index
            </span>
            <span className="mt-1 font-mono text-3xl font-semibold text-[oklch(0.74_0.14_190)] tabular-nums">
              {totalRepos}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-white/45 uppercase">
              tools tracked
            </span>
          </div>
          <RadarPin className="top-[12%] left-[18%]" label="SDD" />
          <RadarPin className="right-[13%] bottom-[20%]" label="UI" />
          <RadarPin className="right-[22%] top-[24%]" label="AGENT" />
        </div>

        <div className="grid gap-2 font-mono text-[11px] text-white/66">
          <ConsoleLine command="scan --space sdd" result="17 repos indexed" />
          <ConsoleLine
            command="scan --space ai-to-ui"
            result="10 repos indexed"
          />
          <ConsoleLine command="rank --by activity" result="cards ready" />
        </div>
      </div>
    </aside>
  )
}

function ShowcaseCard({ showcase }: { showcase: ShowcaseLink }) {
  return (
    <a
      href={showcase.href}
      className="group flex min-h-[340px] flex-col justify-between overflow-hidden border border-[oklch(0.84_0.018_230)] bg-white/78 shadow-sm backdrop-blur transition-colors hover:border-[oklch(0.58_0.13_200_/_0.55)] hover:bg-white focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.13_200_/_0.35)] focus-visible:outline-none"
      style={{ "--card-accent": showcase.accent } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[oklch(0.84_0.018_230)] bg-[linear-gradient(135deg,var(--card-accent)_0%,transparent_1px)] p-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.28em] text-[var(--card-accent)] uppercase">
            {showcase.label}
          </p>
          <h2 className="mt-3 font-mono text-2xl leading-tight font-semibold tracking-tight text-balance text-[oklch(0.2_0.03_240)]">
            {showcase.title}
          </h2>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center border border-[oklch(0.84_0.018_230)] bg-[oklch(0.985_0.003_240)] text-[var(--card-accent)] transition-colors group-hover:border-[var(--card-accent)] group-hover:bg-[var(--card-accent)] group-hover:text-white">
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <p className="font-sans text-sm leading-7 text-[oklch(0.42_0.035_230)]">
          {showcase.description}
        </p>

        <div className="grid grid-cols-[104px_1fr] gap-px border border-[oklch(0.84_0.018_230)] bg-[oklch(0.84_0.018_230)] font-mono">
          <div className="bg-[oklch(0.985_0.003_240)] p-3">
            <div className="text-[9px] tracking-widest text-[oklch(0.5_0.03_230)] uppercase">
              {showcase.statLabel}
            </div>
            <div className="mt-1 text-3xl font-semibold text-[var(--card-accent)] tabular-nums">
              {showcase.statValue}
            </div>
          </div>
          <div className="min-w-0 bg-white p-3">
            <div className="text-[9px] tracking-widest text-[oklch(0.5_0.03_230)] uppercase">
              command
            </div>
            <div className="mt-2 truncate text-xs text-[oklch(0.22_0.03_240)]">
              <span className="text-[var(--card-accent)]">$</span>{" "}
              {showcase.command}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {showcase.highlights.map((highlight) => (
            <span
              key={highlight}
              className="border border-[oklch(0.84_0.018_230)] bg-[oklch(0.96_0.01_220_/_0.75)] px-2.5 py-1 font-mono text-[10px] tracking-wider text-[oklch(0.38_0.04_230)] uppercase"
            >
              {highlight}
            </span>
          ))}
        </div>

        <div className="mt-auto border-t border-[oklch(0.84_0.018_230)] pt-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-widest text-[oklch(0.5_0.03_230)] uppercase">
            <GitBranch className="size-3" aria-hidden="true" />
            sample repos
          </div>
          <div className="grid gap-1.5 font-mono text-[11px] text-[oklch(0.33_0.035_235)]">
            {showcase.sampleRepos.map((repo) => (
              <span key={repo} className="truncate">
                <span className="text-[var(--card-accent)]">/</span>
                {repo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/78 px-4 py-3 backdrop-blur">
      <dt className="text-[9px] tracking-widest text-[oklch(0.5_0.03_230)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold text-[oklch(0.58_0.13_200)] tabular-nums">
        {value}
      </dd>
    </div>
  )
}

function SignalPanel({
  icon: Icon,
  title,
  body,
}: {
  icon: IconComponent
  title: string
  body: string
}) {
  return (
    <article className="bg-white/78 p-5 backdrop-blur">
      <div className="mb-5 flex size-10 items-center justify-center border border-[oklch(0.84_0.018_230)] bg-[oklch(0.96_0.01_220)] text-[oklch(0.58_0.13_200)]">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h2 className="font-mono text-base font-semibold tracking-tight text-[oklch(0.22_0.03_240)]">
        {title}
      </h2>
      <p className="mt-3 font-sans text-sm leading-7 text-[oklch(0.42_0.035_230)]">
        {body}
      </p>
    </article>
  )
}

function NodeCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconComponent
  label: string
  value: string
  tone: "cyan" | "green"
}) {
  const color =
    tone === "cyan" ? "oklch(0.74 0.14 190)" : "oklch(0.76 0.16 145)"

  return (
    <div
      className="min-w-0 border border-white/10 bg-white/[0.04] p-3"
      style={{ "--node-color": color } as React.CSSProperties}
    >
      <div className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-widest text-white/45 uppercase">
        <Icon
          className="size-3.5 text-[var(--node-color)]"
          aria-hidden="true"
        />
        {label}
      </div>
      <div className="truncate font-mono text-xs text-white/80">{value}</div>
    </div>
  )
}

function RadarPin({ className, label }: { className: string; label: string }) {
  return (
    <span
      className={`absolute flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-white/72 uppercase ${className}`}
    >
      <span className="size-2 rounded-full bg-[oklch(0.76_0.16_145)] shadow-[0_0_16px_oklch(0.76_0.16_145_/_0.7)]" />
      {label}
    </span>
  )
}

function ConsoleLine({ command, result }: { command: string; result: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border border-white/10 bg-white/[0.035] px-3 py-2">
      <span className="min-w-0 truncate">
        <span className="text-[oklch(0.74_0.14_190)]">$</span> {command}
      </span>
      <span className="shrink-0 text-[oklch(0.76_0.16_145)]">{result}</span>
    </div>
  )
}
