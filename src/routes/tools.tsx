import { createFileRoute } from "@tanstack/react-router"
import { ToolCatalogPage } from "@/components/tool-catalog-page"
import rawTags from "@/data/tags.json"
import rawTools from "@/data/tools.raw.json"
import { buildToolCatalog, type RawTag, type RawTool } from "@/lib/tool-catalog"
import { buildRouteHead, toolCatalogSeoPage } from "@/lib/seo"

export const Route = createFileRoute("/tools")({
  head: () => buildRouteHead(toolCatalogSeoPage),
  component: ToolsPage,
})

function ToolsPage() {
  const catalog = buildToolCatalog({
    tools: rawTools as Array<RawTool>,
    tags: rawTags as Array<RawTag>,
  })

  return <ToolCatalogPage catalog={catalog} />
}
