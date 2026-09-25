# City 等距菱形地块

从 `assets/tileset/city/city.png` 的 30 块方形地块逐格转换，保留完整纹理、配色和原有编号。使用与森林一致的 128×64、2:1 等距菱形，无侧壁。

- `city-diamond.tres`：可在 Laya 瓦片编辑器中铺设的原生等距 TileSet。
- `tiles/city-diamond-atlas.png`：6 列×5 行的透明图集，794×342，边距 2、间距 4。
- `tiles/tile-00.png` 至 `tile-29.png`：独立 128×64 PNG，按原图从左到右、从上到下编号。
- `city-diamond-preview.ls`：30 块原生 TileMapLayer 拼接预览，旋转 0、缩放 1。

额外保留右、下各 2 像素透明余量，以适配当前 Laya 对图集列数、行数的计算，避免末列和末行编号错误。运行时验证全部 30 个编号正确对应各自纹理。

原 city 图集与 city 场景保持原样。新 TileSet 供等距地图铺设；此资源转换不迁移 city 现有的地面坐标、人物、建筑和碰撞。素材本身已有的接缝和过渡形状保留。

原资源备份：`backups/city-before-diamond-20260921/`。

重建：先运行 `tools/bake-city-diamond-tiles.ps1`，再运行 `node tools/build-city-diamond.cjs`。重建保留已存在的资源 UUID。

运行截图：`docs/city-diamond-preview.png`。
