# 为工具目录加入标签筛选

Status: done

## Parent

.scratch/src-data-catalog-page/PRD.md

## What to build

在工具目录页面上加入标签筛选能力。用户可以从可读标签中选择筛选条件，并与现有搜索组合使用。筛选体验需要优先展示有用标签，正确处理异常或缺失标签引用，并保持结果数量、空状态和重置行为一致。

## Acceptance criteria

- [x] 用户可以通过标签控件筛选工具目录。
- [x] 标签控件展示人类可读的标签名，并优先让常用或有工具关联的标签容易访问。
- [x] 标签筛选可以和搜索条件组合使用，结果同时满足当前搜索和标签条件。
- [x] 用户可以清空标签筛选，并回到未筛选状态或仅搜索状态。
- [x] 异常标签字符串、缺失标签 ID、找不到名称的标签引用不会导致页面崩溃。
- [x] 当前结果数量、无结果空状态和重置动作会正确反映组合筛选状态。
- [x] 数据规范化测试覆盖异常标签引用和缺失标签 ID。
- [x] 页面行为测试覆盖标签筛选、搜索加标签组合筛选、无结果和重置。
- [x] 类型检查和生产构建通过。

## Blocked by

- .scratch/src-data-catalog-page/issues/01-minimal-static-tool-catalog.md
- .scratch/src-data-catalog-page/issues/02-search-and-result-feedback.md
