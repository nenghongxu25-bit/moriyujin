# 森林地块画风优化 v2

基准：`assets/decorate/forest/current/forest-pine-tree-v1.png`、`forest-fallen-log-v1.png`、`forest-abandoned-house-v1.png`。

预览：`assets/forest-style-v2-preview.ls`。这是独立的风格试作，正式森林和原图集不变。预览沿用试样已有的铺设与装饰，没有给正式森林填地块。

生成方式：内置 imagegen 编辑原图集，生成原稿 `generated-atlas.png` 为 1024×1536。按原图集尺寸缩放得到 `forest.png`（768×1152），使用已有 `tools/bake-forest-diamond-tiles.ps1` 转换为 54 张 128×64 菱形瓦片和 792×612 图集。`forest-diamond.tres` 沿用原瓦片编号与6×9布局，使用独立资源 UUID。

验证：54 张编号齐全，TileSet 已在 Laya 运行预览中加载；截图在 `docs/forest-style-v2-preview.png`。图像生成改变了岸边和材质交接的局部细节，不能视作与旧版逐像素一致的替换件，也尚未验证所有正反转角组合的无缝拼接。暂不替换正式地图。

提示词（内置工具编辑指令）：

Edit target is FIRST image only: the full 768x1152 forest terrain atlas. Other three images are STYLE REFERENCES ONLY, never put buildings trees logs or objects into the atlas. Produce an improved replacement terrain atlas matching the restrained richly shaded hand-painted semi-realistic post-apocalyptic woodland props. Keep EXACT same full canvas aspect 2:3, ideally 768x1152 pixels. Exact 6 columns x 9 rows, each cell square. Preserve all 54 cell identities, material placement and EVERY grass/water, grass/dirt and stone/dirt boundary silhouette and crossing point in exactly the same position. No gridlines labels text borders or margins. Top 384px: two opposite grass/water 3x3 transition groups; middle384px grass/dirt groups; bottom384px stone/dirt groups. This is technical tile art, top-down orthographic textures, NOT a perspective scene and NOT separate raised blocks. All repeated same-material tile edges must connect seamlessly. Preserve water regions and their original appearance as closely as possible. Improve land materials only: grass muted moss/sage/olive green with restrained dry brown blades, reduce electric yellow-green and the monotonous sharp V-shaped grass marks; organize grass into modest coherent tufts with dark soil visible in patches, subtle broad tonal variation and restrained microdetail. Earth muted warm grey-brown, moist loam with occasional tiny organic fragments, not uniform gritty dots. Stone irregular weathered grey stones with muted warm shading and subtle dirt in cracks, match the ruined house masonry reference. Keep illumination soft consistent upper-left, no dramatic baked shadows, no glossy sheen, no exaggerated outlines, no cute cartoon shapes, no photoreal photo collage. Preserve recognizability and color distinctions; do not make everything dark or desaturated grey. High-quality coherent hand-painted game terrain designed to sit naturally beneath the three reference props. Output ONLY edited atlas, fill full image precisely.
