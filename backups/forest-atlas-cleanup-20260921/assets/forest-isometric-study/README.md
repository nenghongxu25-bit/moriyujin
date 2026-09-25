# 森林原生菱形瓦片试样

打开 forest-isometric-study.ls，运行当前场景查看效果。仅此试样使用新瓦片集，原森林场景、纹理和 TileSet 均未修改。

## 瓦片资源

- forest-diamond.tres：原生 Isometric TileSet，格子尺寸 128×64。
- tiles/forest-diamond-atlas.png：54 个菱形地块，6 列×9 行，图集 792×612；外边距 2，间隔 4。
- tiles/tile-00.png 至 tile-53.png：54 张可独立复用的透明背景菱形图片，每张 128×64，编号对应原图集从左到右、从上到下的顺序。

材质来自现有 assets/tileset/forest/forest.png，逐块投影为菱形，保留草地、泥土、石地、水面及过渡纹理。这是几何转换，未重新绘制材质，也没有自动增加缺失的过渡组合。

场景地面为真正的 TileMapLayer，使用新的菱形 TileSet；地面层旋转为 0、缩放为 1。保留原 forest 地图从 (23,28) 开始的 8×8 区域及 64 个地块编号，坐标转换为 Laya 的交错行菱形网格。可继续在瓦片编辑器使用此 TileSet 铺设。

树木、灌木、石块、倒木、接触阴影和土层底座保留。土层底座仍是整体展示图片，未拆成可拼接侧面。此试样未迁移人物、碰撞、寻路或天气。

## 重建与验证

工具 tools/bake-forest-diamond-tiles.ps1 从原图集生成菱形 PNG。tools/configure-forest-native-isometric.cjs 生成 MCP 更新请求，须通过 MCP 应用；不会直接写场景或 TileSet。tools/build-current-forest-isometric.cjs 同样生成 MCP 场景请求。

运行截图：docs/forest-native-isometric-preview.png。已检查场景结构和运行画面。改动前备份：backups/forest-native-iso-20260919-233410/。

此前柔和画风试样保留于 assets/isometric-study，学习包为 archives/cozy-isometric-study.zip。
