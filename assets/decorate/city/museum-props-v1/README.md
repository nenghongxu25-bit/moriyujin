# 博物馆展台 v1

六件独立透明 PNG，采用与城市素材一致的写实斜俯视画风；主要材质为石材、深色木材、金属和玻璃，保留室内积尘及轻度磨损。

| 文件 | 元素 |
| --- | --- |
| glass-display-case.png | 立式玻璃展柜 |
| table-display-case.png | 卧式玻璃展柜 |
| artifact-pedestal.png | 文物方形底座 |
| round-display-plinth.png | 圆形雕塑底座 |
| exhibit-table.png | 开放式陈列台 |
| museum-info-stand.png | 博物馆说明台 |

打开 `museum-props-preview.ls` 可查看两排三列预览，顺序与上表一致。单件 PNG 可分别拖入场景；预览尺寸只用于看图，不代表世界实际比例。

本批不绘制建筑、墙体或地块；展台不附带展品。当前为单张静态素材，玻璃框架、柜体没有分层，不含开柜动画、碰撞或交互逻辑。若需要展品置于玻璃后并正确遮挡，后续应拆分柜体、展品、前玻璃层。

实际尺寸、透明及边缘检查记录在 `manifest.json`。使用内置 imagegen，完整提示词见项目根目录 `docs/museum-props-v1-generation.md`。
