# 灰绿生存风 UI 页面第一版

## 公共控件补齐

2026-09-20：整理按钮、物品操作菜单、战令/签到小页签改用公共按钮贴图；背包、仓库及公共物品格统一名称和右上数量排版，快捷栏改用细边框格子。物品选中态改为低饱和金色边框/名称，长按详情底色改为灰绿。保留原节点与组件绑定，没有新增运行时 UI。

本次备份：`backups/survival-controls-v1/`（含 listTemplate.ts）。补齐脚本：`tools/refine-survival-controls.cjs`。检查命令：`node tools/test-survival-pages.cjs backups/survival-controls-v1`。实际背包预览：`art-library/ui-concepts/components-bag.png`。选中态已在运行画面看到；长按详情没有成功截到展示状态，不记为交互验收通过。

已落入原有场景和 Prefab，不只是效果图。签到、战令、工作间、快速制作、背包、仓库、邮箱、商店及地图选择共用灰绿底板、细边框、米白文字和低饱和强调色；公共按钮、物品格、状态遮罩和垂直滚动条一并统一。营地顶部入口已避开背包/制作按钮。

## 查看

打开 `assets/scenes/ui-style-preview.ls`，选择运行当前场景。数字 1–9 或左右方向键切换：签到、战令、工作间、快速制作、背包、仓库、邮箱、商店、地图选择。

该场景引用真实页面与现有数据，不模拟奖励。请勿为了看美术点击领取、购买或制作；这些仍是真实业务按钮。预览场景不作为游戏启动场景。

实际运行截图：`art-library/ui-concepts/pages-v1/`。美术素材：`assets/ui/survival-pages/`；滚动条：`assets/prefab/prefab_interface/Common/SurvivalVScrollBar.lh`。

## 验证与边界

- MCP 运行预览检查了九个主要页面及营地；签到滚动条拖到月底，能看到第 29–31 天。
- `npx.cmd tsc --noEmit` 通过。
- `node tools/test-survival-pages.cjs` 检查 36 份备份资产，原节点 ID、组件/引用、active/visible 状态保留。
- `node tools/test-survival-hud.cjs` 通过。
- 未修改奖励、配方、购买规则或开启原本隐藏的入口。商店预览仍显示原有占位文案，没有补做商店业务或本地化。未执行领取、制作、购买等数据操作。
- 编辑器没有抖音 `tt` 环境，原有登录/云存档/广告能力不能在这里验证。
- 原有物品图标及人物美术保留；物品名称与图片是否匹配不属于本次改动。

## 维护与回退

现有节点/布局在各页面 Prefab 中维护。公共 PNG 可由 `tools/build-survival-pages-art.ps1` 重建；主题批量迁移工具 `tools/theme-survival-pages.cjs` 用于这次迁移，后续手动调整页面后不要随意重跑，以免覆盖新布局。

原有场景和 Prefab 首次修改备份在 `backups/survival-pages-v1/`，按相同相对路径恢复即可回退对应资产。另有 `BagPanel.ts` 两处纯颜色改动：普通物品文字从黑色改为米白色，选中态从亮绿改为灰绿。预览脚本只切换已创作的页面节点，不在运行时生成 UI。
