# 建筑瓦片制作标准

## 平顶扩展（2026-09-22 用户新增要求）

新增 `assets/tileset/buildings/roofs/flat-concrete/flat-roof.tres`，支持两个等距方向连续扩展，不受旧双坡屋顶固定 7 格跨度约束。16 种外围收边组合，支持长方形、L 形与天井；手工选择边块。复用水泥材质，顶面高 268、板底高 256；仍用 256×128 网格、320×640 单片、(160,560) 锚点、(0,-240) 偏移及原 RoofTileLayer / HouseRoofVisibility。平顶不使用 GableLayer。此新增几何是用户指定的平顶例外，原双坡套装与地图保持不变。

使用说明见该目录 README.md。`tools/test-flat-roof.cjs` 检查资源及组件，`tools/bake-flat-roof.ps1` 检查三类轮廓的像素覆盖无透明裂缝。沿用唯一房屋试样临时验证，检查后按备份逐字节恢复；运行截图 `docs/flat-roof-runtime-outside.png`，拼接总览 `docs/flat-roof-preview.png`。

2026-09-21 用户确认：当前瓦片、碰撞、显隐关系即制作标准。今后的墙壁、室内地板和屋顶只换纹理，其他完全沿用。

## 验收基准

- 唯一试样：`assets/tileset/buildings/walls/brick/brick-wall-sample.ls`。
- 墙体：`assets/tileset/buildings/walls/brick/brick-wall.tres`、`brick-wall-atlas.png`。
- 地板：验收快照中的 `House_01 / IndoorFloorLayer` 使用 `assets/tileset/buildings/floors/terrain/terrain-diamond.tres`，作为网格、缩放及室内判定基准。新专用室内材质位于 `assets/tileset/buildings/floors/indoor-floor.tres`，现有试样已只换成木板纹理，绘制坐标不变。
- 屋顶：`assets/tileset/buildings/roofs/slate/slate-roof.tres`、两张 `slate-roof-*.png`。
- 独立山墙：`assets/tileset/buildings/walls/brick/brick-gable.tres`。屋顶不能重新绑定砖材质。
- 验收备份：`archives/building-standard-20260921.zip`；包内清单记录路径、大小和 SHA-256。
- 旧 README 记录了多轮修改历史。规则冲突时以本标准及最后验收版本为准。

## 固定规格

| 项目 | 标准 |
| --- | --- |
| 投影与墙格 | 2:1 等距，256×128 |
| 墙瓦片 | 256×384，锚点 (128,336)，墙高256，纹理偏移 (0,-144) |
| 墙体厚度 | 沿用现有轮廓；墙脚几何半厚为等距 u/v 坐标的 3/16 |
| 墙图集 | 1044×1556，4×4 共16种连接块，2px留边、4px间隔 |
| 墙块连接 | 沿用 +u/+v/-u/-v 四位连接编号、长墙尺寸、转角及交叉接口 |
| 入口 | 留空墙格；已删除的窄门洞瓦片不再生成 |
| 室内地板 | 沿用原生等距 TileMapLayer；试样地板层缩放0.25，墙格的四分之一尺寸 |
| 屋顶 | 固定7格跨度的双坡屋顶，沿屋脊接长，两个方向共42块；中段/起端/末端编号不变 |
| 屋顶单片 | 320×640，锚点 (160,560)，纹理偏移 (0,-240) |
| 屋顶图集 | 每方向2272×1936，7列×3行，2px留边、4px间隔 |

纹理变体必须保留原有透明轮廓、接缝位置、顶面/侧面分区和受光方向。不得通过缩放图片、重生成不同形状或移动锚点来凑拼接。

### 连接端面修正（2026-09-21）

最终方案：五种墙的图集保留完整端面，不再静态清空像素。BrickWallTileLayer 将连接端面单独切分，按相邻墙段的实际透明度动态控制；等透明度相接时不叠画内部端面，邻墙更透明或隐藏时补出端面，无邻墙时保留完整封口。邻墙须同 ActorLayer、同缩放、相邻格中心且有相反连接位；跨墙层也可识别。尺寸、锚点、格子编号和碰撞保持不变。此前静态删端面方案已废弃。

`tools/test-wall-caps.cjs` 验证双方向、缩放、跨层、透明度合成、邻墙隐藏／移除及端面边界；`tools/test-wall-seam-images.ps1` 核对原始完整端面已恢复。运行时修复前后见 `docs/wall-cap-before.png`、`docs/wall-cap-after.png`。`docs/wall-seams-comparison.png` 仅记录已废弃的静态删面方案。原始图片保存在 `archives/wall-seams-before-fix-20260921.zip`，同名图集条目依次为 brick、wood、concrete、plaster、stone。

## 层级与摆放

2026-09-21 标准模型升级：新增 `House / RoomRegions / Room_01`，区域层挂 RoomRegion，运行时隐藏青色逻辑瓦片。HouseRoofVisibility 优先读取独立区域，并通过 activeRoom 提供房间身份；显示地板不再决定新模型的室内范围。没有 RoomRegions 的旧房屋保留地板回退。原有墙体碰撞、视线、半透明规则和整栋屋顶淡出保持不变。使用方法见 `assets/tileset/buildings/ROOM-MODEL.md`，完整预制体为 `standard-house.lh`，空模板为 `house-template.lh`。下面涉及地板触发的内容仅适用于旧结构。

房屋放在 ActorLayer 下：House 包含 IndoorFloorLayer、BrickWallLayer、RoofLayer；可选 GableLayer 放在 RoofLayer 下跟随其显隐。墙、地板、屋顶独立选择材质。

沿用 HouseRoofVisibility、IndoorFloorLayer、BrickWallTileLayer、RoofTileLayer。保持墙层无旋转、正缩放，使用现有方向瓦片。地板范围要实际覆盖墙围内部，不能拿包围矩形替代已绘制地板。

当前试样地板位置 (-32,112) 是针对当前墙围的对齐值，不是所有房屋都要硬编码的偏移。新房屋应在相同父坐标下对齐实际格心，保持墙格与地板格的比例。换纹理不得改变已绘制地图。

## 碰撞和显示行为

1. 继续使用墙脚 DepthObstacle 和 TileBlockMovement；等距地面显式坐标换算，不能重新换成有分解误差的 Sprite 斜切矩阵。
2. 当前玩家占地椭圆半宽48、前后半径28；正式玩家脚底偏移80，试样脚底偏移0。换材质不调整接触距离。
3. 屋顶和房屋墙体共用 HouseInteriorState。玩家在室外时屋顶显示、房屋墙保持实心；室内屋顶隐藏。
4. 室内墙体根据墙背缘与玩家之间的地面视线判定半透明，不能因为玩家走到更靠前的位置，就把侧面的前墙恢复实心。墙段不透明度0.28，过渡0.18秒。
5. 实墙一直阻挡移动，也阻挡玩家到目标的视线；入口空格可通行、可看穿。墙透明不等于允许看到另一侧目标。
6. 玩家是 DepthSortable 视野来源；其他带该组件的对象按墙体视线显隐。角色自身豁免；墙前人物与枪作为整体显示，墙后不提前提升到前景。
7. 独立墙（没有房屋祖先）仍使用自身视线和前后判断。普通地板未添加战争迷雾，普通装饰碰撞不自动视为遮光墙。
8. 屋顶淡入淡出0.2秒，出地板范围的200ms缓冲保留。每栋房屋分别控制，不能相互串用状态。

## 新材质流程

- 木墙、水泥墙、白粉墙、石墙、砖墙等只替换材质母图/纹理，使用同一几何和切片流程。
- 原有资产替换纹理时保持 UUID；新增独立材质套装使用新资产 UUID，但瓦片编号、规格、脚本及参数与基准一致。
- 沿用 `tools/bake-brick-wall-tiles.ps1`、`build-brick-wall-kit.cjs`、`bake-slate-roof.ps1`、`build-slate-roof.cjs`、`build-brick-gables.cjs` 的几何约定。必要时仅参数化材质输入与输出，不重写几何规则。
- 提示词参考 `docs/brick-wall-tiles-prompt.txt`、`docs/slate-roof-prompt.txt`；AI只提供材质，最终拼接轮廓由既有规则保证。
- 不重建或覆盖用户地图，不增加重复测试场景；沿用唯一试样检查。

## 验收

运行相关检查：`test-brick-wall-kit.cjs`、`test-brick-wall-save.cjs`、`test-wall-collision.cjs`、`test-wall-foreground.cjs`、`test-wall-vision.cjs`、`test-house-roof.cjs`、`test-slate-roof.cjs`。

在 Laya 运行时复查双方向拼接、贴墙阻挡、入口通行、室内屋顶隐藏、屋外墙实心、室内三段侧墙透明、同侧目标可见与隔墙目标隐藏。按项目要求检查编辑后保存和编译后的表现。
