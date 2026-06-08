export type RawTool = {
  id: number
  name: string
  description: string | null
  website: string | null
  github: string | null
  categoryId: number | null
  tags: string | null
}

export type RawTag = {
  id: number
  name: string
}

export type ToolCatalogTag = {
  id: number
  name: string
}

export type ToolCatalogEntry = {
  id: number
  name: string
  description: string | null
  websiteUrl: string | null
  githubUrl: string | null
  tags: Array<ToolCatalogTag>
}

export type ToolCatalogStats = {
  totalTools: number
  totalTags: number
  websiteTools: number
  githubTools: number
}

export type ToolCatalog = {
  tools: Array<ToolCatalogEntry>
  tags: Array<ToolCatalogTag>
  stats: ToolCatalogStats
}

export function buildToolCatalog({
  tools,
  tags,
}: {
  tools: Array<RawTool>
  tags: Array<RawTag>
}): ToolCatalog {
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]))
  const catalogTags = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
  }))
  const catalogTools = tools.map((tool) => {
    const toolTags = parseToolTagIds(tool.tags)
      .map((tagId) => tagsById.get(tagId))
      .filter((tag): tag is RawTag => Boolean(tag))
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
      }))

    return {
      id: tool.id,
      name: tool.name,
      description: cleanOptionalText(tool.description),
      websiteUrl: cleanOptionalText(tool.website),
      githubUrl: cleanOptionalText(tool.github),
      tags: toolTags,
    }
  })

  return {
    tools: catalogTools,
    tags: catalogTags,
    stats: {
      totalTools: catalogTools.length,
      totalTags: catalogTags.length,
      websiteTools: catalogTools.filter((tool) => tool.websiteUrl).length,
      githubTools: catalogTools.filter((tool) => tool.githubUrl).length,
    },
  }
}

function parseToolTagIds(value: string | null) {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item): item is number => Number.isInteger(item))
  } catch {
    return []
  }
}

function cleanOptionalText(value: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
