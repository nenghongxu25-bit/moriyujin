# 独立森林元素

24 张独立 PNG，均为 256×256，保留原图集的 RGBA 像素和透明留白，没有缩放、重画或压缩损失。已逐像素验证全部 1,572,864 个像素与原图对应区域相同，且每张均有可见内容和透明背景。

可在 LayaAir 资源面板中分别选择图片，拖入场景使用。以 0.5 缩放显示时，每张图片的画布占 128×128 世界单位；元素本身的大小和透明留白各不相同。

| 文件名（.png） | 元素 |
| --- | --- |
| grass-short | 矮草丛 |
| grass-tall | 高草丛 |
| fern | 蕨类 |
| bush-round | 圆灌木 |
| broadleaf | 阔叶草 |
| flowers-white | 白花草丛 |
| rock-moss-small | 小苔石 |
| pebbles-three | 小石群 |
| boulder-moss | 大苔石 |
| rocks-flat | 扁石群 |
| rocks-round | 圆石群 |
| gravel-scatter | 碎石散布 |
| stump | 树桩 |
| branch-fallen | 枯枝 |
| roots | 树根 |
| log-moss | 倒木 |
| leaves-dry | 落叶 |
| mushrooms | 蘑菇 |
| reeds | 芦苇 |
| lily-pads | 浮叶 |
| bush-berries | 浆果灌木 |
| sapling-pine | 小松树 |
| tree-small | 小阔叶树 |
| sapling-dead | 枯树苗 |

`manifest.json` 记录原图校验值和每个切片坐标。切分脚本位于项目 `tools/split-forest-props.ps1`，默认拒绝覆盖已有图片。
