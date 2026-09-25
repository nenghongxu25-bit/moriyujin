# 建筑瓦片目录

标准房屋已升级为独立房间区域模型：完整房屋用 `standard-house.lh`，空房屋用 `house-template.lh`，新增房间用 `regions/room-region-layer.lh`。详见 [房间模型说明](ROOM-MODEL.md)。新模型的地板只负责显示，室内范围由 RoomRegions 下的逻辑瓦片决定；下文旧地板判定说明仅适用于未迁移房屋。

沿用已验收的建筑标准，只替换纹理。尺寸、连接编号、锚点、碰撞及房屋显隐规则不变。

| 文件夹 | 材质 | 瓦片集 |
| --- | --- | --- |
| walls/brick | 原砖墙 | brick-wall.tres |
| walls/wood | 旧木板墙 | wood-wall.tres |
| walls/concrete | 旧水泥墙 | concrete-wall.tres |
| walls/plaster | 旧白粉墙 | plaster-wall.tres |
| walls/stone | 灰石墙 | stone-wall.tres |
| floors | 木板、水泥、石板地板 | indoor-floor.tres，依次为编号 0、1、2 |
| roofs/terracotta | 旧红瓦屋顶 | terracotta-roof.tres |
| roofs/metal | 锈蚀金属屋顶 | metal-roof.tres |
| roofs/slate | 原灰石板屋顶 | slate-roof.tres |

每种墙有16块，另有两个方向共14块独立山墙；每种屋顶有两个方向共42块。原砖墙和石板屋顶已一并归类，原资源 UUID 保留。山墙跟随对应墙材质放在 walls 子目录。

`materials` 保存新材质母图；根目录的 `house-template.lh` 是空房屋模板。部分旧图集及通用组件沿用 brick/slate 技术名称，材质请按所在目录和 `.tres` 名称区分。木材视觉优化尚未进行，本次仅整理目录。

## 使用

- 新房屋：把本目录 `house-template.lh` 拖到 ActorLayer 下，自己绘制墙、室内地板和屋顶。模板各层为空，没有自动填图。
- 已有房屋：选择相应层的 TileMapLayer，替换 tileSet 资源即可。四种新墙与原砖墙编号一致；两种新屋顶与原石板屋顶编号一致。
- 地板是新的专用瓦片集。旧森林瓦片编号不能直接带入新地板集，应选择新地板重画。地板层保留 IndoorFloorLayer，缩放 0.25；实际绘制范围决定室内判定，地板为空就没有室内范围。
- 屋顶和墙独立选材质。山墙在 RoofLayer 下，单独选择与墙匹配的 `*-gable.tres`，随屋顶隐藏。屋顶仍是原标准的固定7格跨度，沿屋脊接长。
- 入口留空墙格，不使用已退役的小门洞瓦片。
- 继续使用原来的唯一试样 `walls/brick/brick-wall-sample.ls` 查看木墙、木地板和红瓦组合，没有新增测试场景。正式地图未填充。

## 制作记录

使用内置 imagegen 生成六张材质母图，原图保存在 `materials`。提示词在 `docs/building-materials-prompts.json`；预览在 `docs/building-materials-preview.png`。

重建：用 `tools/bake-brick-wall-tiles.ps1` 和 `tools/bake-slate-roof.ps1` 的 OutputFolder / MaterialPath 参数烘焙各材质；地板运行 `tools/bake-indoor-materials.ps1`；再运行 `node tools/build-building-materials.cjs` 生成资源。新资源保留已有 UUID。

验证：`tools/test-building-materials.cjs` 检查规格、编号和组件；`tools/check-building-material-images.ps1` 逐像素比较原版与新材质的透明轮廓，并生成预览图。详细规则见 `docs/building-tiles-standard.md`。
