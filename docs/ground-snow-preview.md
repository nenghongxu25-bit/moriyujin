# 森林全场景地面积雪

- 场景：`assets/scenes/forest.ls`
- 节点：`Area2D/GroundDecorLayer/GroundSnowPreview`
- 脚本：`src/systems/GroundSnow.ts`
- 原图：`assets/tileset/ice/4.png`，未修改图片或导入参数。

现已扩大到整张森林。范围为地面局部坐标
`(-1280, -1536)`，大小 `7680 × 6784`，外边缘有柔化。覆盖层处于瓦片地面之上、
ActorLayer 之下，不影响碰撞、人物、树木和 UI；未修改飘雪实现。

运行后延迟 2 秒开始，覆盖参数每 30 秒增加 1，达到 0.9 后停止（约第 29 秒）。
固定位置的多尺度噪声遮罩使雪斑扩展并连片；纹理以 128 单位镜像平铺，
并非把整张图片拉伸或把全屏染白。coverage 是遮罩进度，不等于精确面积百分比。

在节点的 GroundSnow 组件里调整：

- `autoAccumulate`：自动演示开关。关闭后可直接设置 `coverage`（0 无雪、1 满雪）。
- `accumulationSeconds` / `startDelaySeconds` / `maxCoverage`：积累速度、延迟、上限。
- `textureSize` / `patchSize` / `edgeFeather`：纹理平铺大小、雪斑尺度、样板区域边缘柔化宽度。
- 尺寸及纹理类参数在启动时读取；运行中动态调整支持 coverage 和积累速度/开关。

当前自动演示与天气粒子独立，不会判断是否正在下雪，也未实现自动融雪、屋顶积雪或脚印。
已与雨天共用 ForestWeatherMask，排除空地块和当前森林图集的河水；详见 ground-rain-preview.md。
后续天气系统可关闭自动模式后驱动 coverage。
移除或禁用整个 GroundSnowPreview 节点即可关闭样板，原地面保持不变。

检查：`npx.cmd tsc --noEmit`；`node tools/test-ground-snow.cjs`。
MCP 的场景 Schema 校验器对场景已有 Prefab override 写法报告错误，不能称为全场景校验通过；
新增节点的 JSON、层级、UUID 绑定由测试检查，渲染效果另通过 MCP 预览确认。
