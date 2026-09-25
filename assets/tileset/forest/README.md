# 森林当前使用的图集

森林场景 `assets/scenes/forest.ls` → `Area2D/GroundLayer/1` 使用：

- **forest-diamond.tres**：铺设地面时选择此 TileSet，128×64 等距菱形。
- **forest-diamond-atlas.png**：上述 TileSet 实际引用的图集。
- **rain-water.png**：森林积水效果的水面采样贴图。
- **water-flow.png**：森林水流效果贴图。
- **reference/grass-dirt.png**：用户确认的双材质边界形状参考，仅供制作参考，不是当前地面图集。

房屋模板仍引用的另一套高清地板已归入 `assets/tileset/buildings/floors/terrain/`。

所有保留资源的 UUID、文件内容和切片配置均未改变。旧森林图集目录已从 assets 清理，原件集中备份在 `backups/forest-atlas-cleanup-20260921/assets/`，不参与资源导入。
