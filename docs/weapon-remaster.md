# 武器图标重制 · 2026-09-21

重绘全部 12 件已配置武器，使用内置 `image_gen`，每件单独生成。统一写实装备材质、左上柔光、透明背景；枪械侧面朝右，近战武器尖端或击打端朝上。

游戏实际素材仍位于 `assets/atlas/picture/items/weapons/rangeds/` 和 `assets/atlas/picture/items/weapons/melees/`。替换 PNG，保留原 `.meta`、UUID、路径、物品 ID、战斗属性和占格配置。没有修改角色 Spine 的内嵌武器贴图。

交付尺寸：长枪 5×2 = 1280×512；手枪 2×1 = 512×256；近战 1×2 = 256×512 或 1×3 = 256×768。生成原图裁去多余透明留白后等比缩放，四周至少 16 像素透明边距。没有拉伸物体或烘焙稀有度底色。

- 原图及原资源标识备份：`backups/weapons-before-remaster-20260921/`。
- 生成原始文件项目副本：`art/weapons-remaster-20260921/source/`。
- 每件完整提示词、生成来源、目标尺寸和缩放记录：[weapon-remaster-manifest.json](weapon-remaster-manifest.json)。
- 按统一格子大小预览：[weapon-remaster-gallery.html](weapon-remaster-gallery.html)，[整套截图](weapon-remaster-preview.png)。
- [实际背包仓库截图](weapon-remaster-runtime.png)：使用不写存档的独立预览环境，12 件武器均已加载。

验证：`node tools/test-weapon-icons.cjs` 检查 12 件替换、精确占格尺寸、RGBA、生成源文件已入项目以及原 `.meta` 未改动；安装过程对每张生成图检查有效物体和真实透明像素。浏览器逐张加载与游戏界面显示均已检查。
