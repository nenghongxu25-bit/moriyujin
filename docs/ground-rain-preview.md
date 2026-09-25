# 森林全场景地面积水

节点：forest / Area2D / GroundDecorLayer / GroundRainPreview。
范围与积雪相同：(-1280,-1536)，7680×6784，位于人物和物件之下。
此边界已通过 MCP 读取运行时 TileMapLayer.rect 确认；保留 Preview 节点名以兼容已有绑定。
使用现有 grass-water.png 内部水面区域，没有更改原图和瓦片数据。

进入森林后 18 秒逐渐完成积水演示：湿地变暗、不规则浅水洼扩大，水面有扩散淡出的椭圆涟漪。
涟漪被水洼遮罩裁切，不会显示在干地上。纹理和水洼固定在地面，不跟随玩家。

GroundRain 参数：
- wetness：0～1，积水进度（不是面积比例）。
- autoAccumulate：自动增加进度；关闭后可手动指定 wetness。
- accumulationSeconds：雨量为 1 时从干到湿的秒数。
- rainIntensity：0～1，控制积累速度和水圈亮度。设为 0 停止积累和涟漪，保留水洼。
- puddleSize / edgeFeather：水洼尺度、样板区域边缘柔化，启动时读取。

此版本已覆盖整张森林，未接入天气系统、真实雨滴碰撞、水面反射或自动蒸发。
ForestWeatherMask 在启动时读取当前地面瓦片，建立 60×53 的查找纹理，排除未铺地块和
当前森林图集中的蓝绿色河水，岸边按原图像素区分。纹理仍按原尺寸平铺，没有拉伸。
这是针对当前森林图集、无旋转瓦片的遮罩，不是通用室内/屋顶识别；以后换图集、旋转瓦片或
新增室内地形时需要相应适配。运行中新增瓦片需要重建遮罩；扩地图边界需同步扩覆盖节点。
雨天原样板区域的水洼位置通过 u_rainPattern 偏移保留，脚步检测也使用同一个陆地遮罩。
为了查看雨天，GroundSnowPreview 和 WeatherLayer 内雪花实例被设为 inactive；代码和参数保留。
恢复雪天：关闭 GroundRainPreview，开启 GroundSnowPreview 和雪花实例，按需关闭雨粒子实例。
没有改动 ScreenWeatherEmitter 或相机代码。

验证命令：node tools/test-ground-rain.cjs；node tools/test-ground-snow.cjs；npx.cmd tsc --noEmit。
全图遮罩与所有已铺地块覆盖检查：node tools/test-forest-weather-mask.cjs。
MCP 截图：`.tmp/forest-rain-north.png`、`.tmp/forest-rain-river-verified.png`、
`.tmp/forest-snow-river-verified.png`。测试用位置跳转和强制积水/积雪已移除。

## 玩家踩水反馈

GroundRain 的 playerNode 已绑定森林玩家。footOffsetY=80，与当前玩家地面接触偏移一致。
按实际移动累计距离触发（stepDistance 默认 72），不是按摇杆意图触发；静止、撞墙、
瞬移和后台长帧不会堆出水纹。跑步触发更密、强度略高；footRipples 可关闭脚步反馈。
这版是距离驱动的落脚近似，并非 Spine 左右脚骨骼的精准动画事件。

使用同一个 GPU 水洼遮罩判断落脚点与水纹可见区域，避免 CPU 与着色器噪声精度不同。
接触检测在顶点阶段计算；片元阶段只绘制最多 6 个水纹，不生成额外节点、纹理或粒子。
脚步水纹约 1.35 秒扩散淡出，半径大于雨滴水圈，位置留在地面。
即使 rainIntensity=0，只要水洼保留，脚步仍有反馈。

已用 MCP 摇杆移动验证脚步触发和地面水圈，截图 `.tmp/step-water-live.png`；
临时触发日志已移除。逻辑测试覆盖静止、瞬移、步距、跑步强度、停雨和禁用清理。
