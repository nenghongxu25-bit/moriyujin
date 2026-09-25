# 森林装饰预制体

`asset-roles.json` 列出 `assets/decorate/forest/` 与 `assets/decorate/forest-elements-v2/` 中每张 PNG 的用途分类和对应预制体。图片仍留在原目录，Prefab 引用原图片 UUID；可以重复拖入场景。

| 类型 | 使用方式 | 场景位置 |
| --- | --- | --- |
| 地表贴花 | 直接拖 PNG，无碰撞节点 | `GroundDecorLayer` |
| 可穿过但需前后排序的植被、装饰 | 使用 `可穿过_*.lh`，包含 `DepthSortable` 与图片遮挡轮廓，不含碰撞 | `ActorLayer/可穿过装饰_草丛芦苇` |
| 区域自动铺草 | 只拖一次 `森林装饰区域.lh`，选中后拖动四个角点画定区域；运行场景时按数量与种子自动撒草、蕨、花和芦苇 | `ActorLayer/可穿过装饰_草丛芦苇` |
| Shader 效果 | 自动铺设的草叶及单体草、蕨、花和芦苇轻微随风摆动；`地表_lily-pads.lh` 轻微浮动 | 自动生成物自带 Shader；睡莲放 `GroundDecorLayer` |
| 树木、岩石、建筑及其他实体 | 使用 `阻挡_*.lh`，包含深度排序、图片遮挡轮廓和脚下阻挡区域 | `ActorLayer/阻挡装饰_树木岩壁路障` |
| 动物图片 | 仅作美术来源；使用项目现有动物行为预制体 | `ActorLayer/Enemies` |

Prefab 根节点的原点按图片底部附近设置，方便直接摆放。碰撞只覆盖脚下/底部区域，不覆盖整张图片；不同场景尺寸或门口位置需要在 Laya 编辑器里微调 `DepthObstacle` 的矩形属性。地表图片本身没有碰撞和深度排序。

选中 `森林装饰区域` 后可拖动四个角点修改铺设形状，数量、最小间距和随机种子可在组件属性中调整。装饰在运行时自动创建为同层子节点并参与人物深度排序，区域销毁时清理。Shader 由 `src/systems/ForestDecorationShader.ts` 实现。

4 个已存在的样板保持原 UUID 与组件配置：`地表_落叶`、`可穿过_灌木`、`阻挡_松树`、`阻挡_岩壁`。其余 48 个单物件 Prefab 由 `tools/build-forest-decoration-prefabs.cjs` 生成。
