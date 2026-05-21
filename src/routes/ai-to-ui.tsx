import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { GithubShowcasePage } from "@/components/github-showcase-page"
import { aiToUiShowcaseConfig } from "@/lib/github-showcase-config"
import { getGithubShowcaseProjects } from "@/lib/github-showcase-data"

const getAiToUiProjects = createServerFn({ method: "GET" }).handler(() =>
  getGithubShowcaseProjects(aiToUiShowcaseConfig.repoConfigs)
)

export const Route = createFileRoute("/ai-to-ui")({
  loader: () => getAiToUiProjects(),
  component: AiToUiPage,
})

function AiToUiPage() {
  const data = Route.useLoaderData()

  return <GithubShowcasePage config={aiToUiShowcaseConfig} data={data} />
}
