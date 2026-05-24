import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { GithubShowcasePage } from "@/components/github-showcase-page"
import { sddShowcaseConfig } from "@/lib/github-showcase-config"
import { getGithubShowcaseProjects } from "@/lib/github-showcase-data"
import { buildRouteHead, getShowcaseSeoPage } from "@/lib/seo"

const getSddProjects = createServerFn({ method: "GET" }).handler(() =>
  getGithubShowcaseProjects(sddShowcaseConfig)
)

export const Route = createFileRoute("/sdd")({
  head: () => buildRouteHead(getShowcaseSeoPage(sddShowcaseConfig)),
  loader: () => getSddProjects(),
  component: SddPage,
})

function SddPage() {
  const data = Route.useLoaderData()

  return <GithubShowcasePage config={sddShowcaseConfig} data={data} />
}
