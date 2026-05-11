import {
  Circle as CircleDot,
  Eye,
  GitBranch,
  GitFork,
  Pulse as Activity,
  Scales as Scale,
  Star,
} from "@phosphor-icons/react" 

import GlareHover from "@/components/GlareHover"
import type { GithubProject } from "@/lib/github-project"
import { cn } from "@/lib/utils"

function formatNumber(num: number) {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return num.toString()
}

export function GithubProjectCard({
  project,
  className,
}: {
  project: GithubProject
  className?: string
}) {
  return (
    <GlareHover
      width="100%"
      height="100%"
      background="var(--card)"
      borderRadius="0"
      borderColor="var(--border)"
      glareColor="#22d3ee"
      glareOpacity={0.75}
      glareAngle={-30}
      glareSize={180}
      transitionDuration={800}
      playOnce
      className={cn(
        "group min-h-full place-items-stretch shadow-sm transition-all duration-300",
        "hover:border-primary/60 hover:shadow-glow",
        className
      )}
    >
      <article className="relative z-10 flex min-h-full flex-col overflow-hidden font-mono text-foreground">
        <header className="flex items-center gap-3 border-b border-border bg-background/40 p-4">
          <div className="relative shrink-0">
            <span
              aria-hidden="true"
              className="absolute -inset-0.5 rounded-full bg-primary/30 opacity-0 blur-sm transition-opacity group-hover:opacity-100"
            />
            <img
              src={project.avatar || "/placeholder.svg"}
              alt={`${project.owner} 头像`}
              className="relative size-11 shrink-0 rounded-full border border-border bg-background"
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center">
            <h3 className="min-w-0 text-base font-semibold tracking-tight text-foreground">
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.owner} / ${project.name}`}
                className="group/repo hover:text-glow flex min-w-0 items-center gap-1 transition-colors hover:text-primary"
              >
                <span className="shrink-0 text-[11px] font-normal text-primary">
                  $
                </span>
                <span className="min-w-0 truncate text-[11px] font-normal text-muted-foreground transition-colors group-hover/repo:text-primary/80">
                  {project.owner}
                </span>
                <span
                  className="shrink-0 text-[11px] font-normal text-primary/60 transition-colors group-hover/repo:text-primary/80"
                  aria-hidden="true"
                >
                  /
                </span>
                <span className="min-w-0 truncate">{project.name}</span>
              </a>
            </h3>
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="group/star inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            <Star className="size-3" aria-hidden="true" />
            <span>{formatNumber(project.stars)}</span>
          </a>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <p className="line-clamp-2 font-sans text-sm leading-relaxed text-muted-foreground">
            <span className="mr-1 text-primary">{">"}</span>
            {project.description}
          </p>

          {project.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.topics.slice(0, 5).map((topic) => (
                <a
                  key={topic}
                  href={`https://github.com/topics/${encodeURIComponent(topic)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] tracking-wider text-secondary-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
                >
                  #{topic}
                </a>
              ))}
            </div>
          )}

          <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3">
            <Metric
              icon={<GitFork className="size-3" aria-hidden="true" />}
              label="FORKS"
              value={formatNumber(project.forks)}
            />
            <Metric
              icon={<CircleDot className="size-3" aria-hidden="true" />}
              label="ISSUES"
              value={formatNumber(project.issues)}
            />
            <Metric
              icon={<Eye className="size-3" aria-hidden="true" />}
              label="WATCH"
              value={formatNumber(project.watchers)}
            />
          </dl>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background/40 px-4 py-2.5 text-[10px] tracking-wider text-muted-foreground uppercase">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full ring-2 ring-offset-1 ring-offset-background"
                style={{
                  backgroundColor: project.languageColor,
                  boxShadow: `0 0 8px ${project.languageColor}`,
                }}
                aria-hidden="true"
              />
              <span className="text-foreground/90">{project.language}</span>
            </span>
            <span className="flex items-center gap-1">
              <Scale className="size-3" aria-hidden="true" />
              {project.license}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="size-3" aria-hidden="true" />
              {project.defaultBranch}
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <Activity className="size-3 text-primary" aria-hidden="true" />
            <span>{project.updatedAt}</span>
          </span>
        </footer>
      </article>
    </GlareHover>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 border-l border-border/60 pl-2 first:border-l-0 first:pl-0">
      <span className="flex items-center gap-1 text-[9px] tracking-widest text-muted-foreground uppercase">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  )
}
