# city / forest 场景分层

两个场景使用相同的 Area2D 子层，按 zOrder 从低到高绘制：

| 层 | zOrder | 放置内容 |
| --- | --- | --- |
| GroundLayer | 0 | 地面、道路、地板 |
| GroundDecorLayer | 10 | 地面污渍、标线、落叶等不遮挡人物的贴图 |
| ActorLayer | 20 | 人物、树木、石头、车辆、箱子、展台等需要前后遮挡的实体 |
| RoofLayer | 30 | 屋顶、需要盖住实体的上层画面 |
| LightingLayer | 40 | 夜色遮罩和灯光；city 保留原灯光组件，forest 暂为空 |
| EffectLayer | 50 | 上层特效；city 原 fire 在此层 |
| LogicLayer | 60 | 阻挡与逻辑组织节点；不要在这里放普通可见装饰 |

场景根节点的 UILayer 为 zOrder=100。forest 原 WeatherLayer 保留在场景根节点，zOrder=50，位于世界上方、UI 下方。

## 放置素材

- 贴在地面上的装饰放 GroundDecorLayer。
- 需要与人物互相遮挡的对象放 ActorLayer 下对应的分类节点。添加或保留 DepthSortable，并把 groundY 设置为素材的落地点；仅拖入一张图片不会自动获得正确的深度排序或阻挡。
- ActorLayer 上的 ActorLayerGroups 在运行时将分类节点的直接子对象展开到共同排序层；编辑器中的分类不变。分类只放一层，Prefab 内部结构保留。
- 分类节点保持缩放为 1，旋转、斜切、轴心为 0，不挂交互组件。移动分类节点可整体平移对象。新增分类时，将其名称加入 ActorLayerGroups 的“分类节点”属性；运行时新生成的实体直接加入 ActorLayer。
- 碰撞体仍可随实体 Prefab 保存；LogicLayer 用于独立阻挡和逻辑节点，分层本身不会生成碰撞。
- RoofLayer 只是预留的绘制层，不会自动实现进屋隐藏屋顶。

原 InteractLayer 和类别分组的空节点保留在 LogicLayer，以保留原节点标识。新实体请放 ActorLayer 的分类中。city 的 LightingLayer 保持直接挂在 Area2D，供原灯光脚本使用共同坐标空间。

forest 分类：Characters、Pines、Oaks、Rocks、Branches、Bushes、Mounds、Devices、Enemies。
city 分类：Characters、Walls、Containers、Props。
分组前备份在 .tmp/actor-groups；分类只整理层级，不合并独立实体或减少实体数量。

## 本次调整与验证

实体移动到新父节点时补偿了位置；保留原节点 ID、Prefab 引用和组件配置。DynamicCutoutProbe 增加了对 LogicLayer/roomnight 与 EffectLayer/fire 的查找，兼容原结构。

调整前备份及迁移检查报告位于 .tmp/world-layers。tools/standardize-world-layers.cjs 只准备 MCP 编辑请求，并检查原节点位置、引用和组件是否保留；已有备份时拒绝再次运行。

MCP 的严格场景校验器不支持本项目原有的部分 Prefab override 格式，原始场景也会报同类错误，因此不能把该校验器当作通过依据。本次保留该格式，通过 MCP 资产编辑、编辑器预览和迁移前后对比检查。
