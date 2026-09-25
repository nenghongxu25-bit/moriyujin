# city 房屋性能优化

通过 Laya MCP 确认当前运行 city；日志中一层 18 格墙展开为 3202 个渲染/碰撞节点。随后在独立 Chrome 调试页显式加载 `scenes/city.ls` 采样（初始空页面数据已排除）。CPU 热点首先为 RoomDarkness.visibility 调用的 wallBlocksSight，伴随临时数组分配。

改动：
- 墙脚几何按连接编号缓存为不可变数组；视线求交复用标量，并先排除包围范围不相交的墙。保持旧算法的边界容差。
- 每个灯光遮罩缓存世界坐标下的可见地块。原点移动、墙体重建/移除、房间区域重建立即失效；仅相机/灯光变换变化时重算坐标，不重复求射线。一次计算仿射基底，替代逐顶点的两次坐标转换。
- 墙节点透明度、显隐、排序仅在值改变时赋值；光照前景状态不变时跳过切片遍历。切片精度、碰撞、墙厚、房屋布局、显隐规则均保留。

浏览器采样：修改前 FPS 约 17–22；修改后静止采样显示约 40–52，180 帧窗口平均约 21.7–22.3ms，P95 约 36ms。不是严格锁定相机位置/天气的基准，也不是稳定60帧保证。后续热点已转为墙切片渲染、合批和排序。

验证：test-wall-ray-equivalence（5万组确定性随机射线与旧公式一致）、test-wall-vision、test-wall-collision、test-wall-foreground、test-wall-caps、test-room-wall-depth、test-room-darkness。额外验证灯光静止缓存、相机变换、原点移动、墙体变更失效。TypeScript 使用 `--lib es2020,dom` 无错误；原 tsconfig 的 es6 默认 lib 对项目既有 Object.values 报错，未改项目编译配置。

原文件备份 `.tmp/city-perf-backup/`；CPU 采样及截图在 `.tmp/city-*.cpuprofile` 和 `.tmp/city-perf-*.png`。
