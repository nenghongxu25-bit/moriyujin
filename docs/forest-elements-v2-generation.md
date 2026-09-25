# 森林元素统一风格

使用内置 imagegen 编辑原始元素图集，参考 decorate/forest 中的松树、灌木、倒木。最终源图：`forest-elements-v2-source.png`。24 张独立切片保存于 `assets/decorate/forest-elements-v2/`。

## 首轮重绘提示词

Edit image 1, the existing forest props sprite atlas, restyling its SAME 24 objects to match images 2-4 (style references: muted realistic painterly forest pine, shrub and fallen log). This is a production game sprite atlas, not a scene. EXACT output canvas 1536x1024, 6 columns by 4 rows, each cell256x256. Preserve the object order and object categories. Row1 short grass, tall grass, fern, round bush, broadleaf plant, tiny white wildflowers. Row2 small moss rock, three pebbles, large moss boulder, flat rocks, round rocks, gravel scatter. Row3 stump, fallen branch, exposed roots, mossy log, dry fallen leaves, mushrooms. Row4 reeds, lily pads, berry bush, young pine, small deciduous tree, dead sapling. Each object must be fully contained within its own cell with at least24 pixels empty margin on all sides; no overlap between cells. Real transparent alpha background across all empty pixels, no colored backdrop, no checkerboard painted in, no ground tiles, no rectangular bases, no glow, no labels or grid. Consistent elevated three-quarter camera and soft upper-left light, consistent with the supplied isolated props. Replace cartoon chunky pixel art with fine hand-painted realistic game sprite detail, subdued olive and grey-green foliage, weathered grey-brown bark, rough grey rocks with sparse dull moss, dusty brown litter. No neon yellow-green, no thick black outlines, no orange glowing mushrooms, no exaggerated white rock highlights. Maintain clear silhouettes and all24 distinct subjects. Lily pads are isolated leaves without a water rectangle. Entire atlas must be true RGBA transparency; no diffuse shadow beyond the object. The reference images are style only, do not insert buildings or extra objects.

## 留白修正提示词

Edit this atlas for exact production slicing. Keep its current realistic muted painterly art and all24 subjects and ordering. Canvas1536x1024 exactly, six columns four rows,256x256 cells. CRITICAL shrink EVERY object by about25 percent inside its OWN cell and recenter it, so all visible pixels of each object fit inside local x32..223 and y32..223. Empty transparent32px minimum gutters inside every cell. Rows boundaries y0,256,512,768,1024; columns x0,256,512,768,1024,1280,1536. Some current leaves cross rows; fix ALL. Top row fern,bush,broadleaf,flowers must end before y224. Bottom row pine starts after y800. NO object parts can intersect a grid boundary. Preserve current high detail, camera, soft lighting, muted olive foliage, grey rocks, weathered wood. Maintain identical24categories and positions. Real fully transparent RGBA background, no painted background, no grid, labels, backdrop, cast shadow or tile bases. Do not enlarge objects to fill whitespace; the whitespace is REQUIRED for reusable sprite cutting.

## 切分验证

1536×1024 RGBA 源图，256×256 独立切片。为避开最下排植物顶部，四排实际裁切起点 y 为 0、256、490、744；x 为列号乘256。未缩放或修改素材像素。验证全部24张有透明区域和可见内容，四边均无 alpha >32 的像素；1,572,864 个切片像素与源图对应区域完全一致。详细坐标见素材 manifest.json。

