# 地图右下角抽屉点击与层级问题

date: 2026-09-08
status: completed

## 背景

用户调整了 `assets/map.ls` 的节点布置。右下角抽屉相关节点当前在：

```text
/Scene2D/UI/node/mapDrawerHead
/Scene2D/UI/node/MapDrawerButtonRole
/Scene2D/UI/node/MapDrawerButtonBag
/Scene2D/UI/node/MapDrawerButtonFormation
/Scene2D/UI/node/MapDrawerButtonMenu
```

其中 `UI/node` 本身约为 `100x100`，位置在右下角，内部按钮用本地坐标摆放。Laya 里这种父容器较小、子节点超出或靠近边界的布局，直接依赖子节点鼠标事件可能失效。

## 问题

- 打开最底级地图预制体后，右下角抽屉按钮被 `MapPanels` / 地点面板层级盖住。
- 早期尝试运行时创建 `DrawerControls` 并搬移抽屉节点，会造成 UI 像被复制或跑到其他位置。
- 搬节点还会引入坐标系变化风险，不适合用户已经在编辑器里摆好的 UI。

## 修改

- `src/MapScene.ts` 不再创建新的 `DrawerControls`，也不再搬移用户现有节点。
- 直接使用 `mapDrawerHead.parent`，也就是当前的 `UI/node`，作为抽屉控件分组。
- 只对这个分组做置顶、`mouseEnabled = true`、`mouseThrough = true`。
- 增加 `handleDrawerStageClick(stageX, stageY)`：在 `onStageClick` 里先用屏幕坐标兜底判断是否点中抽屉头或已展开按钮。
- 抽屉兜底点击放在 `isBlockingPanelOpen()` 前面，保证打开地点预制体后仍可点击右下角抽屉。

## 经验

- 不要运行时搬移用户在 Laya 编辑器里已经摆好的 UI 节点，除非用户明确要求。
- 需要解决层级问题时，优先置顶现有分组；需要解决点击问题时，优先加全局坐标命中兜底。
- 读取节点时要按实际 `assets/map.ls` 结构查找，不要假设按钮和抽屉头同父级。

## 验证

执行：

```text
npx --yes -p typescript@5.5.4 tsc --noEmit
```

结果没有新增本次相关错误。仍存在旧错误：

```text
src/SceneJumpButton.ts(15,21): Property 'mouseEnabled' does not exist on type 'Node'.
src/systems/DailySignInManager.ts(80,48): Property 'padStart' does not exist on type 'string'.
src/systems/DailySignInManager.ts(81,41): Property 'padStart' does not exist on type 'string'.
```
