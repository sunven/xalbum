# 公开目录入口和 SEO 收尾

Status: done

## Parent

.scratch/src-data-catalog-page/PRD.md

## What to build

把工具目录页作为正式 XAlbum 页面接入站点。用户应能从现有首页或导航入口进入目录页；搜索引擎相关元数据、索引页面集合和 sitemap 行为需要包含该目录页。完成响应式收尾，确保页面在移动端和桌面端都适合浏览数百条工具记录。

## Acceptance criteria

- [x] 现有站点入口提供清晰的工具目录访问路径。
- [x] 新目录页拥有符合 XAlbum 双语风格的标题、描述和公开页面元数据。
- [x] 索引页面集合和 sitemap 输出包含新目录页，且 canonical URL 正确。
- [x] 首页或导航新增入口不破坏现有 SDD 与 AI-to-UI 图谱入口。
- [x] 移动端布局中搜索、筛选、统计和列表内容不会重叠或溢出。
- [x] 桌面端布局保持足够密度，适合扫描当前数据量。
- [x] SEO 相关测试覆盖新目录页的 head、sitemap 或索引集合行为。
- [x] 类型检查和生产构建通过。

## Blocked by

- .scratch/src-data-catalog-page/issues/01-minimal-static-tool-catalog.md
- .scratch/src-data-catalog-page/issues/02-search-and-result-feedback.md
- .scratch/src-data-catalog-page/issues/03-tag-filtering.md
