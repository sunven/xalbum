import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: App })

const showcaseLinks = [
  {
    href: "/sdd",
    title: "SDD 工具图谱",
    description: "Spec-driven development frameworks and agent workflow tools.",
  },
  {
    href: "/ai-to-ui",
    title: "AI-to-UI 工具图谱",
    description: "AI interface generation and structured UI rendering tools.",
  },
]

function App() {
  return (
    <main className="min-h-svh bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2 border-b border-border pb-6">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
            XALBUM_INDEX
          </p>
          <h1 className="font-mono text-3xl font-semibold tracking-tight">
            工具图谱
          </h1>
        </header>

        <section className="grid gap-3" aria-label="工具图谱入口">
          {showcaseLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group border border-border bg-card p-5 transition-colors hover:border-primary/60 hover:bg-secondary/40"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="min-w-0">
                  <span className="block font-mono text-lg font-medium text-card-foreground">
                    {link.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                    {link.description}
                  </span>
                </span>
                <span
                  className="shrink-0 font-mono text-xl text-primary transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  -&gt;
                </span>
              </span>
            </a>
          ))}
        </section>
      </div>
    </main>
  )
}
