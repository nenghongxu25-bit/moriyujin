# 图片素材分类约定

按用户 2026-09-19 指定的分类组织；本文件是当前目录规范，优先于早先清理记录中的目录位置。

| 目录 | 素材用途 |
| --- | --- |
| assets/animation/fire | 火焰序列帧、帧图集及配套动画预览配置 |
| assets/animation/container | 开箱等容器动画帧 |
| assets/animation/weather | 天气粒子图片、图集及配套材质；部分雪花是粒子变体，并非时间序列 |
| assets/animation/ui | UI 动画及序列图集 |
| assets/tileset | 全部现有瓦片集、瓦片纹理和配套资源，按城市、森林、矿洞等分目录 |
| assets/decorate/city | 城市静态装饰 |
| assets/decorate/forest | 森林生存风格素材，按用户要求从备用库移回的 21 张图片 |
| assets/decorate/ground | 湖面、地面坑洞等独立装饰图片 |
| assets/decorate/harvestables | 树木、石块、矿石等可采集对象的外观图片；交互脚本不变 |
| assets/decorate/fire | 火把木柄、篝火底座及静态参考图 |
| assets/container | 箱子、空投、袋子、保险箱的静态外观 |

开箱动画按“动画帧优先”的规则放在 animation/container，而不是混在静态容器图片中。

Spine 骨骼源图片和导出图集不是逐帧动画，保持 assets/spine 内成套存放。UI、物品图标和光照遮罩继续使用现有专用分类，不强行归入装饰或瓦片。

备用素材仍在 art-library，不重新导入游戏；其装饰、容器和瓦片预览也使用 decorate、container、tileset 分类。备用库中的素材若要使用，应将图片和 .meta 一起放回 assets 对应目录。

## 本次迁移

搬移 96 张图片及 9 个配套文件，图片内容和资源 UUID 保持不变。更新了开箱帧路径、湖面工具路径，以及火把和篝火预览中指向静态底图的相对路径。没有删除图片，也没有修改场景布局。

完整映射：image-material-layout-manifest.json。
改动前备份：.tmp/image-layout-backup-20260919/before/。
早先去重备份仍在 .tmp/image-cleanup-backup-20260919/，是不同时间点的备份，回退时要同时核对资源路径与代码引用。

验证：96 张图片哈希及原 UUID 校验通过，配套配置和代码路径检查通过，TypeScript 检查通过。通过 MCP 获取运行日志确认，本轮迁移的 63 张游戏内图片全部按原 UUID 成功加载，失败数为 0；另外 33 张位于备用库。临时加载探针已移除。清理了 18 个已搬空的目录，目录元数据保存在本轮备份中。
