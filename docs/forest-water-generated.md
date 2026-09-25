# 森林水面图片替换

使用内置 imagegen 生成水面，再机械合成到 `assets/tileset/forest/forest.png` 的水域。
没有启用新的水面材质。上次未完成的 ForestRiverSurface 节点、脚本和测试已移除并归档。

备份和生成原稿：`backups/forest-water-generated-20260919-01/`。
原 PNG、meta、TileSet 均已备份；生成原稿为 generated-water.png，平铺水块为 water-128.png。
输出保持 768×1152、6×9 格、每格 128 像素；UUID、切片配置及地图瓦片数据不改。
只修改前 3 行原有蓝绿色水域，其他像素和 alpha 保持不变。
检验结果：120070 个水域像素替换；非水域变化 0；alpha 变化 0；水域识别丢失 0；水块对边差异 0。
水面是静态生成纹理，不宣称新增动态河流。原积水涟漪和踩水代码保留。

复现合成：tools/replace-forest-water.ps1，使用备份 forest.png 和 generated-water.png。
恢复原图只需将备份 forest.png 复制回 assets/tileset/forest/forest.png，不替换元数据。

## 内置 imagegen 提示词

Use case: stylized-concept. Asset type: seamless repeating water texture for a top-down 2D painted forest survival game, to be downsampled to 128x128 pixels. Generate ONE square texture showing ONLY calm river water edge-to-edge, perfectly overhead orthographic. Soft understated painterly muted grey teal / slate blue-green water, soft broad gentle tonal variations, sparse delicate short elongated ripples, a little silky reflected overcast light. More polished and tranquil than noisy pixel-speckled water. Medium-dark base approximately RGB(55,85,95); lighter ripple tones approximately (75,107,116). Keep blue and green higher than red across the entire texture, including highlights. Even lighting, uniform scale and density, seamless wrap both horizontally and vertically. Opaque flat game texture, no shore, land, stones, objects, vegetation, bubbles, large circular rings, white foam, bright cyan, caustic net pattern, horizon, perspective, vignette, borders, text, grid or watermark. Avoid a large central feature or obvious repeated wave bands. This is a material swatch, not a landscape illustration. 1024x1024.
