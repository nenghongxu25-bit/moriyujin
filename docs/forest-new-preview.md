# 森林新增素材试样

## 当前目录

- `assets/decorate/forest/current/`：原有 19 张已修复、已缩小的正式素材；此次仅移动，保留 .meta / UUID。
- `assets/decorate/forest/new-preview/`：本次 6 张新增试样，未接入搜刮逻辑、未修改场景。
- `art-library/images/decorate/forest-new-preview-hd/`：本次 6 张高清原始生成图。

旧目录中的 19 张图片由 MCP moveAssets 移动。此前文档记载的 `assets/decorate/forest/forest-*.png` 现在位于 current 子目录。

## 预览尺寸

| 物件 | 文件名 | 尺寸 |
| --- | --- | --- |
| 树桩 | forest-tree-stump-v1.png | 128×128 |
| 废弃轮胎 | forest-discarded-tire-v1.png | 128×108 |
| 废弃背包 | forest-abandoned-backpack-v1.png | 127×128 |
| 旧工具箱 | forest-rusty-toolbox-v1.png | 128×86 |
| 破木板 | forest-broken-planks-v1.png | 256×198 |
| 熄灭篝火 | forest-extinguished-campfire-v1.png | 128×86 |

采用内置 imagegen，一件一张，不从拼图裁切。基于现有森林素材观察到的灰绿、做旧质感和斜俯视方向编写描述；本批未向生成工具上传参考图片，不保证像素级风格一致。缩小后逐张检查，透明通道检查通过；X/Y 同一缩放系数，画布取整余量小于 1 像素。

## 生成提示词

各图片的最终提示词为下面公共提示词加对应 Subject。

```
Use case: stylized-concept. Standalone 2D game environment prop for a gritty forest survival scavenging game. Hand-painted semi-realistic sprite with fine weathered material texture, muted olive green, moss brown and charcoal palette, crisp readable silhouette, restrained dark contour, soft diffuse light from upper left. Elevated orthographic three-quarter view at about 40 degrees looking down, matching an illustrated forest cabin / rusty pickup prop set, not a flat UI inventory icon. One isolated complete object only, centered and filling about 85% of canvas with safe transparent margins; no clipping. REAL transparent RGBA background including holes and gaps, no background color, no baked checkerboard, no haze, no glow, no ground plane, no scenery, no labels, no text, no watermark, no sprite sheet. Keep shape readable when downscaled to 128 pixels. Subject: 
```

### tree-stump

One squat old cut pine tree stump, uneven exposed growth rings, cracked bark, a few roots flaring at the base and modest moss attached to bark. No surrounding soil patch.

### discarded-tire

One discarded worn black vehicle tire lying flat on its side, seen from above at an oblique angle, visible hollow center, cracked rubber tread, a little attached moss and dirt. No wheel rim, no surrounding debris.

### abandoned-backpack

One abandoned olive drab canvas field backpack resting upright with slightly slumped shape, two worn front pockets, buckles and attached straps, subtle dirt and frayed seams. Closed bag; no weapons or loose items.

### rusty-toolbox

One small closed vintage steel toolbox, squat rectangular box with a top carrying handle and two latches, faded dark red paint with worn rusty edges and dirt. No tools outside it, no logos.

### broken-planks

One compact overlapping pile of three broken old wooden planks, splintered irregular ends, weathered grey-brown wood grain, a few bent rusty nails embedded in wood and restrained moss. All three planks touch as a single prop. No surrounding debris.

### extinguished-campfire

One completely extinguished campfire: a low compact ring of irregular mossy grey stones enclosing three charred crossed logs and cold ash. Entire stone ring intact. Absolutely no flame, no glowing embers, no smoke. No surrounding soil patch.

