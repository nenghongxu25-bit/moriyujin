# 地图 UI 处理规则

- 用户在 Laya 编辑器里摆好的 UI 节点，默认不要运行时搬移、复制、重建或改父节点；先按实际 `assets/map.ls` 结构读取和绑定。
- 地图右下角抽屉当前以 `mapDrawerHead.parent` 作为现有分组处理；如果需要压到地点预制体上方，只置顶这个现有分组。
- 如果父容器尺寸较小导致子按钮点不到，优先在 `Laya.stage` 点击里用全局坐标做命中兜底，不要为了解决点击问题改节点层级。
- 改地图 UI 前先用脚本确认 `mapDrawerHead`、`MapDrawerButtonRole/Bag/Formation/Menu` 的实际路径、数量、坐标和父容器尺寸。
- 右下角抽屉相关排查记录见 `.memory/tasks/2026-09-08-map-ui-drawer-click.md`。
