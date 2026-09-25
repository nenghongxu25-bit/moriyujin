# 森林地形 v3 生成记录

使用内置 imagegen，以几何遮罩和 v2 地形图为参考生成两张源图；随后通过 MCP 导入 TileSet 并构建实际 TileMapLayer 场景。

## 草地与水

文件：`assets/tileset/forest-kit-v3/grass-water.png`

```text
PRODUCTION TILESET. Image1 is an EXACT GEOMETRY/MATERIAL MASK to texture, Image2 is pixel-art STYLE REFERENCE ONLY. Output exactly1536x1024, identical layout and material silhouettes to Image1. Replace olive-green regions with calm fine pixel-art forest grass; replace blue regions with deep blue-teal water texture. DO NOT redesign, move, enlarge or round the guide shapes differently. Preserve boundary crossings exactly where the guide has them, especially each 256px cell edge. Image1 encodes a 6column x4row atlas, no separators: upper-left768x768 is a grass-surrounded pond, upper-right768x768 is a WATER-SURROUNDED GRASS ISLAND (the inverse), bottom-left768x256 is three pure grass fill tiles, bottom-right768x256 is three pure water fill tiles. Land-water borders cross the straight edge cells exactly halfway at128pixels into each256pixel cell. The guide's corner silhouettes must remain unchanged so concave/convex quarter assembly can connect. Keep outside image edges and every256pixel cell boundary free of protruding reeds, flowers, rocks or large motifs. Fine low-contrast ground texture, tiny grass blades, quiet water ripples. A very narrow natural shoreline on the LAND side only, max8px, no stones, reeds or bank cliffs; consistent in both panels. No white flowers, no dark grid lines, no background panels, no labels, no text, no shadows, no gradients in lighting. Both materials need uniform color/scale across the whole atlas. A functional reusable pixel-art texture atlas, not a pretty example map.
```

## 草地与泥土

文件：`assets/tileset/forest-kit-v3/grass-dirt.png`

```text
PRODUCTION TILESET. Image1 is EXACT GEOMETRY/MATERIAL MASK. Image2 is detailed top-down pixel-art STYLE REFERENCE ONLY. Output exactly1536x1024. Texture the flat green regions of image1 with calm fine forest grass and its flat brown regions with brown earth. Preserve mask silhouettes EXACTLY, not approximately. No new shapes. Upper-left768x768 is a dirt clearing surrounded by grass; upper-right768x768 is a GRASS PATCH SURROUNDED BY DIRT, the reverse. Bottom-left768x256 consists of three solid grass fill tiles; bottom-right768x256 three solid dirt fill tiles. This is a6x4 grid of256pixel tiles with no visible grid lines. Straight material transitions cross every256pixel tile border at its EXACT midpoint (128px). Keep boundary crossings fixed; the guide corners are rounded but must not move. Quiet fine retro pixel art, low contrast, brown dirt with only tiny grain, grass short fine blades. Very narrow8px soft grass/dirt edging, never a thick outline. Uniform texture luminosity. All upper-left dirt and upper-right surrounding dirt must look identical. All grass must look identical. No flowers, no large tufts, no isolated stones, no watermark, no captions, no shadows, no grid, no texture frames. Tileable functional textures, not a composed landscape. Material coverage correctness and precise grid boundary alignment take priority over visual embellishment.
```

提示词中的严格几何要求是生成目标，不代表已经验证为逐像素无缝；实际验证范围见素材 README。

