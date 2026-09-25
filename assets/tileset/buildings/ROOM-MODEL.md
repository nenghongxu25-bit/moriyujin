# 标准房屋与房间模型

`standard-house.lh` 是从已验收试样提取的已绘制房屋，拖入 ActorLayer 即可使用；`house-template.lh` 是同结构的空模板。唯一试样仍为 `walls/brick/brick-wall-sample.ls`。

```text
House（HouseRoofVisibility）
├─ RoomRegions
│  └─ Room_01（TileMapLayer + RoomRegion，逻辑范围）
├─ IndoorFloorLayer（显示地板）
├─ BrickWallLayer（整栋房屋共用墙，只画一遍）
└─ RoofLayer
   └─ GableLayer
```

## 编辑方法

1. 选择 Room_01 的 TileMapLayer，用青色菱形瓦片涂房间内部。格子大小和原室内地板相同，缩放 0.25。青色只在编辑器显示。
2. 新增房间时，把 `regions/room-region-layer.lh` 拖入 RoomRegions 并重命名，再绘制新范围。每个房间一个区域层，不要重叠。所有区域层在同一父坐标系中对齐。
3. 显示地板可以随意换纹理、删去或混铺，均不改变室内判定。
4. 外墙、隔墙放在共同墙层，只画一次。屋顶仍由整栋房屋统一管理。
5. 门口的可行走过渡格要划入一侧房间，或建立单独的过道区域；不要留大段未标记的空白，以免走到空白处被视为室外。

进入任一所属区域时，整栋房屋屋顶隐藏，墙沿用现有视线／半透明规则。HouseRoofVisibility.activeRoom 提供当前准确房间；roomAtFoot(globalFoot) 可供后续照明系统查询。不同房间的独立照明、门透光、独立屋顶隐藏尚未实现。

有 RoomRegions 时区域数据是唯一判定来源，即使区域为空也不会回退到显示地板。没有 RoomRegions 的旧房屋继续使用 IndoorFloorLayer，方便渐进迁移。房间区域没有碰撞、不挡光。

试样的区域由原地板绘制数据复制而来，墙／地板／屋顶布局保持不变。迁移前场景备份为 `archives/room-model-before-20260921.ls`。

## 室内黑暗与手电试样

依据墙后是否存在房间逻辑格识别前墙，前墙及封口绘制在黑暗层之上，沿用原透明度与切片顺序，避免被黑幕盖没；后墙仍在黑暗层之下。室外实心前墙也保留外侧墙面，停用照明后恢复原排序。屋顶、碰撞和挡光判定不受此绘制顺序影响。

室外状态下，整圈墙体及封口统一位于室内黑暗层之上，避免连接处跨越两种排序而露出黑色竖缝。进入室内后恢复前墙／后墙的照明区分。封口透明度计算同时考虑黑暗层前后：黑暗层下的墙不能替代黑暗层上的封口。

人物靠近已提升照明排序的墙前时，DepthSortable 必须通过 BrickWallTileLayer.lightingActorDepth 映射到同一排序范围；人物连同武器整体处理。只提升墙而保留人物旧的地面 Y 排序，会导致墙外人物上半身被墙覆盖。墙后人物不进行此前景提升，物理碰撞继续使用原地面坐标。

现有 `walls/brick/brick-wall-sample.ls` 已加入 `ActorLayer/RoomLightingLayer`。运行后 WASD 移动，F 切换手电，L 切换示范灯。选中 RoomLightingLayer 的 RoomDarkness 组件可以调整黑暗强度，默认 0.86；移动 lamp_cutout 可调整示范灯的位置。

其他场景将 `room-lighting.lh` 拖入共同的 ActorLayer 一次即可，不要每个房间重复放置。玩家留空时跟随正式 PlayerController，试样已显式指定测试角色。照明节点应保持位置 0、缩放 1；房屋可在同一个 ActorLayer 下移动。

黑暗范围来自 RoomRegion 绘制区域，沿墙高向上投影，合并后统一施加透明度，避免共用边界重复变黑。显示地板不参与判定。复用 city 的手电／柔光纹理及攻击、摇杆方向输入，未修改 city 的旧照明系统。手电和示范灯用墙体地面视线裁剪，墙变透明也不代表光能穿墙。

这是按逻辑格裁剪的等距照明试样，并非三维阴影。当前统一黑暗强度、一盏示范灯；每个房间独立电源、门的透光状态尚未接入。修改运行中的区域或墙高后可调用 RoomDarkness.rebuild() 重建范围。照明加入前备份为 `archives/room-before-lighting-20260921.ls`。

## city 接入

正式玩家预制体已添加 PlayerOutline 常驻轮廓。仅采样 viewnode 骨骼画面的透明边缘，描边独立显示在 Area2D 最上方，仍位于场景 UILayer 下；不改变玩家本体的排序、碰撞或室内可见性。默认宽度 2、透明度 0.55，可在 prefab_player.lh 的 PlayerOutline 组件调整，停用组件可关闭。当前轮廓包含骨骼自带的脚底阴影外缘，不包含血条、粒子和单独的枪械节点。禁用时隐藏，销毁时释放渲染纹理及材质。

`assets/scenes/city.ls` 的 ActorLayer 已放置唯一的 RoomLightingLayer，externalNightLayer 指向原来的 Area2D/LightingLayer。旧 LogicLayer/roomnight 矩形房间组已停用并保留；原来的室外黑夜、手电、柔光、火光和闪电继续由 DynamicCutoutProbe 管理。

正式场景的室内光束直接同步上述光源的纹理、位置、旋转、缩放和强度，在原驱动更新完后再更新，避免重复跟随造成偏移。室内黑暗只补足环境暗度缺少的部分：环境 0.8、室内目标 0.86 时，附加层为 0.3，未受光区域合成后为 0.86。光束的柔边仍由两层纹理混合，属于二维照明近似；旧环境手电本身没有新增墙体阴影。

共享光源使用固定在 ActorLayer 坐标中的遮罩容器，纹理作为子节点旋转／缩放。不要把光源变换直接施加到带 mask 的容器，否则旋转时缓存裁剪边界可能形成硬斜线和明暗分块。

闪电时室内目标暗度与全局黑夜 alpha 同步衰减，再计算补充暗度；不能用固定的室内目标去补偿闪电，否则环境变亮时室内附加黑幕反而变浓，尤其会在墙边暴露黑条。

将 standard-house.lh 拖入 city 的 ActorLayer 即可接入；房屋、玩家共用 ActorLayer，保持房屋内部层级。直接复制试样 House_01 时清空 HouseRoofVisibility.player，自动绑定正式玩家。不要再次复制 RoomLightingLayer 或测试人物。没有 RoomRegion 时新照明层不生效，不改变现有独立墙的排序。正式 city 不使用试样的独立 F/L 光源开关，跟随已有光源。

city 接入前备份：`archives/city-before-room-lighting-20260921.ls`。场景未额外保留测试房屋，房屋布局由使用者绘制。
