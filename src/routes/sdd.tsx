import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { GithubShowcasePage } from "@/components/github-showcase-page"
import { sddShowcaseConfig } from "@/lib/github-showcase-config"
import { getGithubShowcaseProjects } from "@/lib/github-showcase-data"

const getSddProjects = createServerFn({ method: "GET" }).handler(() =>
  getGithubShowcaseProjects(sddShowcaseConfig.repoConfigs)
)

export const Route = createFileRoute("/sdd")({
  loader: () => getSddProjects(),
  component: SddPage,
})

function SddPage() {
  const data = Route.useLoaderData()

  return <GithubShowcasePage config={sddShowcaseConfig} data={data} />
}
