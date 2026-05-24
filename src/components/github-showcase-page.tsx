import { ArrowLeft, Moon, Sun } from "@phosphor-icons/react"
import type { ComponentType } from "react"
import { useEffect, useState } from "react"
import DotField from "@/components/DotField"
import { GithubProjectCard } from "@/components/github-project-card"
import type { GithubShowcaseConfig } from "@/lib/github-showcase-config"
import type { GithubProjectsData } from "@/lib/github-showcase-data"
import type { GithubShowcaseProjectVersionSnapshot } from "@/lib/github-showcase-version-history"
import {
  buildGithubShowcaseProjectVersionSnapshot,
  getGithubShowcaseProjectVersionStorageId,
  getGithubShowcaseProjectVersionsStorageKey,
  getNewVersionProjectIds,
  parseGithubShowcaseProjectVersionSnapshot,
} from "@/lib/github-showcase-version-history"

type ShowcaseTheme = "light" | "dark"

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

const ShowcaseDotField = DotField as ComponentType<DotFieldProps>
type ShuffleComponent = ComponentType<{
  text: string
  className?: string
  style?: React.CSSProperties
  shuffleDirection?: "left" | "right" | "up" | "down"
  duration?: number
  ease?: string
  threshold?: number
  tag?: string
  textAlign?: "left" | "center" | "right"
  onShuffleComplete?: (() => void) | undefined
  shuffleTimes?: number
  animationMode?: string
  stagger?: number
  triggerOnce?: boolean
  triggerOnHover?: boolean
  respectReducedMotion?: boolean
  colorFrom?: string | undefined
  colorTo?: string | undefined
}>

const showcaseDotFieldTheme = {
  light: {
    gradientFrom: "oklch(0.58 0.13 200 / 0.34)",
    gradientTo: "oklch(0.62 0.15 145 / 0.22)",
  },
  dark: {
    gradientFrom: "oklch(0.74 0.14 190 / 0.3)",
    gradientTo: "oklch(0.76 0.16 145 / 0.18)",
  },
} satisfies Record<ShowcaseTheme, { gradientFrom: string; gradientTo: string }>

const showcasePageStyles = `
  .github-showcase-page {
    color-scheme: light;
    --background: oklch(0.985 0.003 240);
    --foreground: oklch(0.22 0.03 240);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.22 0.03 240);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.22 0.03 240);
    --primary: oklch(0.58 0.13 200);
    --primary-foreground: oklch(0.99 0.005 200);
    --secondary: oklch(0.96 0.01 220);
    --secondary-foreground: oklch(0.3 0.04 230);
    --muted: oklch(0.96 0.008 230);
    --muted-foreground: oklch(0.5 0.03 230);
    --accent: oklch(0.58 0.13 200);
    --accent-foreground: oklch(0.99 0.005 200);
    --border: oklch(0.9 0.01 230);
    --input: oklch(0.93 0.01 230);
    --ring: oklch(0.58 0.13 200);
    --chart-1: oklch(0.58 0.13 200);
    --chart-2: oklch(0.62 0.15 145);
    --chart-3: oklch(0.7 0.16 70);
    --chart-4: oklch(0.6 0.2 25);
    --chart-5: oklch(0.55 0.18 320);
  }

  .github-showcase-page[data-theme="dark"] {
    color-scheme: dark;
    --background: oklch(0.145 0.018 245);
    --foreground: oklch(0.93 0.022 225);
    --card: oklch(0.19 0.022 238);
    --card-foreground: oklch(0.93 0.022 225);
    --popover: oklch(0.19 0.022 238);
    --popover-foreground: oklch(0.93 0.022 225);
    --primary: oklch(0.74 0.14 190);
    --primary-foreground: oklch(0.13 0.018 245);
    --secondary: oklch(0.24 0.026 235);
    --secondary-foreground: oklch(0.88 0.03 225);
    --muted: oklch(0.23 0.021 238);
    --muted-foreground: oklch(0.71 0.03 225);
    --accent: oklch(0.76 0.16 145);
    --accent-foreground: oklch(0.13 0.018 245);
    --border: oklch(0.34 0.03 235);
    --input: oklch(0.3 0.028 235);
    --ring: oklch(0.74 0.14 190);
    --chart-1: oklch(0.74 0.14 190);
    --chart-2: oklch(0.76 0.16 145);
    --chart-3: oklch(0.78 0.16 70);
    --chart-4: oklch(0.72 0.18 25);
    --chart-5: oklch(0.72 0.16 320);
  }

  .github-showcase-page .text-glow {
    text-shadow: 0 0 12px oklch(0.58 0.13 200 / 0.35);
  }

  .github-showcase-page .shadow-glow {
    box-shadow:
      0 12px 32px -8px oklch(0.58 0.13 200 / 0.25),
      0 4px 12px -4px oklch(0.58 0.13 200 / 0.15),
      0 2px 8px -2px oklch(0.22 0.03 240 / 0.06);
  }

  @keyframes github-showcase-pulse-dot {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 0 oklch(0.58 0.13 200 / 0.5);
    }
    50% {
      opacity: 0.7;
      box-shadow: 0 0 0 6px oklch(0.58 0.13 200 / 0);
    }
  }

  .github-showcase-page .animate-pulse-dot {
    animation: github-showcase-pulse-dot 1.8s ease-in-out infinite;
  }
`

export function GithubShowcasePage({
  config,
  data,
}: {
  config: GithubShowcaseConfig
  data: GithubProjectsData
}) {
  const { projects, error } = data
  const [theme, setTheme] = useState<ShowcaseTheme>("light")
  const [themeReady, setThemeReady] = useState(false)
  const [newVersionProjectIds, setNewVersionProjectIds] = useState<
    ReadonlySet<string>
  >(() => new Set())
  const [Shuffle, setShuffle] = useState<ShuffleComponent | null>(null)
  const dotFieldTheme = showcaseDotFieldTheme[theme]

  useEffect(() => {
    let cancelled = false
    import("@/components/Shuffle").then((module) => {
      if (!cancelled) {
        setShuffle(() => module.default as ShuffleComponent)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setTheme(getPreferredShowcaseTheme(config.pageId))
    setThemeReady(true)
  }, [config.pageId])

  useEffect(() => {
    if (!themeReady) {
      return
    }

    try {
      window.localStorage.setItem(getThemeStorageKey(config.pageId), theme)
    } catch {
      // Ignore storage failures so the switch still works in private contexts.
    }
  }, [config.pageId, theme, themeReady])

  useEffect(() => {
    const storageKey = getGithubShowcaseProjectVersionsStorageKey(config.pageId)
    let previousSnapshot: GithubShowcaseProjectVersionSnapshot = {}
    try {
      previousSnapshot = parseGithubShowcaseProjectVersionSnapshot(
        window.localStorage.getItem(storageKey)
      )
    } catch {
      // Storage can be unavailable in private contexts; just skip markers.
    }

    setNewVersionProjectIds(getNewVersionProjectIds(projects, previousSnapshot))

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(buildGithubShowcaseProjectVersionSnapshot(projects))
      )
    } catch {
      // Ignore storage failures; project cards still render normally.
    }
  }, [config.pageId, projects])

  return (
    <main
      className={`github-showcase-page ${
        theme === "dark" ? "dark" : ""
      } relative min-h-screen overflow-x-clip bg-background transition-colors duration-300`}
      data-theme={theme}
    >
      <style>{showcasePageStyles}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_72%,transparent_100%)] opacity-80"
      >
        <ShowcaseDotField
          dotRadius={1.4}
          dotSpacing={16}
          cursorRadius={420}
          bulgeStrength={54}
          glowRadius={0}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom={dotFieldTheme.gradientFrom}
          gradientTo={dotFieldTheme.gradientTo}
          glowColor="transparent"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-0 pb-16 sm:pb-20">
        <div className="sticky top-0 z-30 -mx-6 flex items-start justify-between gap-4 bg-background/85 px-6 py-2 backdrop-blur">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <a
              href="/"
              className="inline-flex h-8 items-center gap-1.5 border border-border bg-card/80 px-2.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase shadow-sm backdrop-blur transition-colors hover:border-primary/70 hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              <span>首页</span>
            </a>
            <div className="flex min-w-0 flex-1 items-center gap-3 font-mono text-xs tracking-[0.3em] text-primary uppercase">
              <span className="flex size-2 shrink-0 items-center justify-center">
                <span className="animate-pulse-dot absolute size-2 rounded-full bg-primary" />
                <span className="size-1 rounded-full bg-primary" />
              </span>
              <span className="min-w-0 truncate">{config.systemLabel}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
            </div>
          </div>
          <ShowcaseThemeSwitch
            theme={theme}
            onToggle={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          />
        </div>

        <header className="mt-3 mb-12 flex flex-col gap-4">
          <div className="flex items-baseline gap-2 font-mono text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            <span className="shrink-0 text-primary" aria-hidden="true">
              {"//"}
            </span>
            {Shuffle ? (
              <Shuffle
                text={config.title}
                tag="h1"
                textAlign="left"
                shuffleDirection="right"
                duration={0.35}
                animationMode="evenodd"
                shuffleTimes={1}
                ease="power3.out"
                stagger={0.03}
                threshold={0.1}
                triggerOnce={true}
                triggerOnHover={true}
                respectReducedMotion={true}
                onShuffleComplete={undefined}
                colorFrom={undefined}
                colorTo={undefined}
                className="m-0 inline-block font-mono text-3xl font-semibold tracking-tight text-foreground normal-case sm:text-5xl"
                style={{
                  fontSize: "inherit",
                  fontFamily: "inherit",
                  fontWeight: "inherit",
                  lineHeight: "1.1",
                  textTransform: "none",
                }}
              />
            ) : (
              <h1 className="m-0 inline-block font-mono text-3xl font-semibold tracking-tight text-foreground normal-case sm:text-5xl">
                {config.title}
              </h1>
            )}
            <span
              className="shrink-0 animate-pulse text-primary"
              aria-hidden="true"
            >
              _
            </span>
          </div>

          <p className="max-w-none font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
            {config.description}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border font-mono text-xs sm:grid-cols-4">
            <StatBlock
              label={config.repoCountLabel}
              value={projects.length.toString().padStart(2, "0")}
            />
            <StatBlock
              label="TOTAL_STARS"
              value={`${(
                projects.reduce((sum, project) => sum + project.stars, 0) / 1000
              ).toFixed(1)}K`}
            />
            <StatBlock
              label="LANGUAGES"
              value={new Set(projects.map((project) => project.language)).size
                .toString()
                .padStart(2, "0")}
            />
            <StatBlock label="CURATION" value="LIVE" />
          </dl>
        </header>

        <section
          aria-label={config.sectionLabel}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {projects.length > 0 ? (
            projects.map((project) => (
              <GithubProjectCard
                key={`${project.owner}/${project.name}`}
                project={project}
                hasNewVersion={newVersionProjectIds.has(
                  getGithubShowcaseProjectVersionStorageId(project)
                )}
              />
            ))
          ) : (
            <div className="border border-border bg-card p-5 font-mono text-xs tracking-wider text-muted-foreground uppercase md:col-span-2">
              <span className="text-primary">GitHub API unavailable</span>
              <span className="mt-2 block tracking-normal normal-case">
                {error ?? config.emptyMessage}
              </span>
            </div>
          )}
        </section>

        <footer className="mt-16 flex items-center justify-between border-t border-border pt-6 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          <span>{config.footerLabel}</span>
          <span className="flex items-center gap-1.5">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-primary" />
            SOURCE_SYNCED
          </span>
        </footer>
      </div>
    </main>
  )
}

function getThemeStorageKey(pageId: string) {
  return `xalbum:github-showcase:${pageId}:theme`
}

function getPreferredShowcaseTheme(pageId: string): ShowcaseTheme {
  try {
    const storedTheme = window.localStorage.getItem(getThemeStorageKey(pageId))
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme
    }
  } catch {
    // Ignore storage failures and continue with the browser preference.
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }

  return "light"
}

function ShowcaseThemeSwitch({
  theme,
  onToggle,
}: {
  theme: ShowcaseTheme
  onToggle: () => void
}) {
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      aria-pressed={isDark}
      onClick={onToggle}
      className="relative inline-flex h-8 w-16 shrink-0 items-center border border-border bg-card/80 p-1 text-primary shadow-sm backdrop-blur transition-colors duration-300 outline-none hover:border-primary/70 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span
        aria-hidden="true"
        className={`shadow-glow flex size-6 items-center justify-center border border-border bg-background transition-transform duration-300 ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </span>
      <span className="sr-only">
        {isDark ? "当前为深色模式" : "当前为浅色模式"}
      </span>
    </button>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-card px-4 py-3">
      <dt className="text-[9px] tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-lg font-semibold text-primary tabular-nums">
        {value}
      </dd>
    </div>
  )
}
