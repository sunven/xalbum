# 为工具目录加入搜索和结果反馈

Status: done

## Parent

.scratch/src-data-catalog-page/PRD.md

## What to build

在已有工具目录页面上加入客户端搜索体验。用户可以按工具名、官网 URL、GitHub URL 和标签名搜索目录；页面会即时更新结果数量，在没有匹配结果时显示清晰的空状态，并提供重置搜索的动作。

## Acceptance criteria

- [x] 用户可以通过搜索框按工具名过滤工具目录。
- [x] 用户可以通过搜索框按官网 URL、GitHub URL 或标签名过滤工具目录。
- [x] 搜索结果数量会随当前输入更新，并反映可见工具数量。
- [x] 没有搜索结果时，页面展示明确空状态，而不是空白列表。
- [x] 空状态或搜索区域提供清空搜索的动作，用户可以回到完整目录。
- [x] 搜索体验在移动端和桌面端都不会让控件或文本相互遮挡。
- [x] 搜索行为有页面行为测试覆盖，包括命中、无结果和清空搜索。
- [x] 类型检查和生产构建通过。

## Blocked by

- .scratch/src-data-catalog-page/issues/01-minimal-static-tool-catalog.md
