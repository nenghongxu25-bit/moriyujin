# AGENTS.md

## 背包物资图标规格

- 制作物资前先确定占格宽高、物体朝向与构图；按占格比例交付透明 PNG，每格 256×256 像素。
- 例如 1×2 输出 256×512，2×1 输出 512×256，2×3 输出 512×768。不得用统一方形画布冒充完成的多格物资素材。
- 裁去多余透明留白后等比缩放，不拉伸物体；保留适量边距。稀有度底色由 UI 添加。
- 交付前核对清单尺寸，并按统一格子大小预览整批图标。现有核对工具为 `tools/test-loot-icon-sizes.cjs`。

## 物资图片与容器开启动画

- 后续制作或修复物资图片、容器序列帧前，阅读 `docs/loot-art-animation-standard.md`；刚性开合动画必须先按 `docs/rigid-container-animation-recipe.md` 的操作单复用 `tools/build-v4-rigid-animation.ps1`，新物件只改专用图层和几何参数。
- 门盖也必须复用同一纹理和固定几何，禁止四张独立生成整图之间套遮罩拼接。缺失内壁先一次性补出完整无门/无盖主体。候选需通过固定表面、固定铰链、裁切和目视播放检查再发布；“能加载、能播完”不等于“无形变”。
- 当前地图容器使用 512×512 透明画布、4 帧、8 fps、不循环；这是地图素材规格，不替代背包图标按占格输出的规则。
- 容器各帧共用固定主体、落地点和锚点，只变换盖子、门或包口。不得将独立生成的整物帧逐帧缩放居中后直接视为稳定动画。
- 先完成一个同类结构样件的项目内验证，再批量制作；修改前备份，保留 UUID，不覆盖已修正资源。
- 交付前逐帧及循环检查主体稳定、铰链和遮挡、透明区域残片、部件裁切；同时看浅色/深色/棋盘格背景和实际显示尺寸。像素检查不能替代目视检查。

## 建筑瓦片制作标准（用户确认，2026-09-21）

- 标准房屋使用 House/RoomRegions/Room_01 独立逻辑区域，显示地板与判定分离；无 RoomRegions 的旧房屋才回退至 IndoorFloorLayer。完整预制体为 assets/tileset/buildings/standard-house.lh，空模板为 house-template.lh。新增房间不得复制共用墙。室内黑暗试样使用 ActorLayer 下唯一的 room-lighting.lh（RoomDarkness），不可每房间重复叠放；详见 assets/tileset/buildings/ROOM-MODEL.md。
- city 已接入 RoomDarkness.externalNightLayer，共用现有 DynamicCutoutProbe 手电、柔光和火光，补足环境暗度而非叠加完整黑幕。旧 LogicLayer/roomnight 已停用；复制房屋时不要再复制照明节点或启用旧矩形房间组。无房间区域时新层不影响现有布局。

- 后续墙壁、室内地板、屋顶均以当前 `assets/tileset/buildings/walls/brick/brick-wall-sample.ls` 为已验收标准，只替换纹理。
- 必须保持等距角度、几何轮廓、厚度、高度、网格、切片、锚点、拼接编号、碰撞和显隐行为一致；不要为不同材质另写一套规则。
- 房屋墙体与屋顶共用室内状态：室外墙实心；室内屋顶隐藏，挡住可见室内区域的墙半透明，不再用玩家脚底Y排除侧面前墙。实墙仍阻挡移动和目标视线。
- 制作前阅读 `docs/building-tiles-standard.md`；以此文档及验收快照为准，不按旧 README 的历史阶段描述回退。

## Laya 项目约束

- 只要问题涉及 LayaAir 项目、运行时行为、场景树、UI 绑定、Prefab、组件、渲染、相机、输入、动画、资源加载或日志排查，必须优先使用 MCP 读取运行时状态、日志和节点信息。
- 禁止只靠文件检索、静态 grep、猜测代码行为来下结论。
- 在回答 Laya 相关问题前，必须先验证运行时事实；如果 MCP 不可用，必须明确说明不可用，再退回到本地文件检查。
- 对于“为什么画面和代码不一致”“为什么编译后行为变了”“为什么节点/visible/层级不符合预期”这类问题，必须优先查 MCP，而不是只看源码。
- 如果已经通过 MCP 得到运行时证据，回答时要基于证据说明原因，不要用推测代替验证。


- Do not generate any UI in code without explicit user permission; use existing scene/prefab nodes and the placeholder image asset instead of drawRect/drawCircle fallbacks.

## 双材质地形图集制作约定

- 用户指定：今后制作双材质交接地块，默认沿用 `assets/tileset/forest/reference/grass-dirt.png` 的双向九宫格形状模式：圆润转角，边界可有细碎自然起伏，切片接口固定。
- 形状参考与材质纹理分开。调整已有地块时，保留其现有纹理与配色，不擅自替换成参考图的材质。
- 修改已有图集前先备份；保持图片尺寸、格子位置、材质对应关系、UUID 和切片配置，除非用户明确要求重排。
- 细则见 `docs/terrain-transition-standard.md`。双向九宫格不自动等于完整自动地形系统；扩展凹角、分叉或三材质交汇时单独验证。
