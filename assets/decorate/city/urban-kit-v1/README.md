# 城市独立元素 v1

10 件斜俯视、偏写实的独立透明 PNG。旧街区强调灰泥、砖墙、旧金属和生活设施；商业中心强调玻璃、浅色石材、办公和停车设施。使用项目原有森林建筑与废弃轿车作画风参考。

## 元素清单

| 文件 | 元素 |
| --- | --- |
| streets-corner-store.png | 老街便利店 |
| streets-apartment.png | 老公寓 |
| streets-bus-shelter.png | 旧公交站 |
| streets-dumpster.png | 垃圾箱与垃圾袋 |
| streets-delivery-van.png | 废弃面包车 |
| center-office-entry.png | 现代办公入口 |
| center-parking-entry.png | 地下停车入口 |
| center-security-barrier.png | 安保路障 |
| center-planter-bench.png | 花池与座椅 |
| center-utility-cabinet.png | 配电箱与电缆 |

## 查看与使用

打开 `urban-elements-preview.ls` 运行，上排是旧街区五件，下排是商业中心五件。预览按相同画布占位展示，方便查看细节，不代表世界中的真实比例。

单张 PNG 可以独立拖入场景。摆放时按角色身高调整比例，以物体底部落点对齐；垃圾箱应远小于建筑。本批只包含外观素材，不含碰撞体、遮挡逻辑、可进入室内或自动拼接模块。地形、道路瓦片未制作。

源图保留生成器输出尺寸，实际尺寸、透明像素和可见范围记录在 `manifest.json`。采用真实透明通道，未以黑色背景代替透明。完整建筑与少量贴附底部的碎屑作为同一个元素保留。

使用内置 imagegen 独立生成每件素材；提示词见项目根目录 `docs/urban-kit-v1-generation.md`。这是受街区与零号地带氛围启发的原创元素，不是原游戏资产提取或精确建筑复刻。
