# city 多房屋渲染修复

用户保持瓦片建房流程；不修改 city 布局、瓦片资源、墙脚碰撞或显隐判定。

## 调整

- BrickWallTileLayer 保留全地图墙脚碰撞与视线几何。仅在镜头范围外加 128 像素预留区内创建精细墙条；离开后释放节点及裁切纹理，再进入时重新创建。保存绘制数据与运行时逻辑不受裁剪影响。
- 同一墙条上端面之外的上下两部分共用一个 Sprite，保留原来的纹理像素、深度和透明度；端面仍独立控制，不改变邻墙半透明规则。
- RoomDarkness 保留全地图逻辑地块，黑暗和光照遮罩只绘制镜头外加 64 像素范围内的多边形，并裁切到有限矩形。为黑暗节点和共享光源遮罩设置有限缓存边界，避免房屋间距扩大整张渲染纹理。
- WorldViewport 通过 Area2D.transformPoint 处理 Camera2D，再转换到 ActorLayer 坐标。普通 Sprite.globalToLocal 不包含 Camera2D 的渲染变换，因此不能单独用它判断镜头范围。无 Camera2D 的标准试样仍使用普通坐标转换。

## 验证

原 6 栋房屋每栋 3202 个墙体显示/碰撞节点，总计 19212。修改后运行抽查显示节点约 2284–2614，碰撞节点始终 324；仅视口邻近墙体实例化。

室内逻辑地块仍为 2622；当前镜头实际绘制 399–437 个，缓存边界约 1462×878，与房屋分布距离无关。运行时切换到 standard-house、远处 standard-house_3、standard-house_5，再回到第一栋：视口随 Camera2D 更新、墙体重新创建、屋顶 alpha=0；本轮未监听到 webglcontextlost。已目视检查室内墙面与手电照明。没有承诺稳定60帧，进入场景仍有加载开销。

测试：test-city-render-window、test-room-darkness、test-room-wall-depth、test-wall-vision、test-wall-caps、test-wall-foreground、test-wall-collision、test-house-roof、test-tilemap-save。TypeScript `--noEmit --lib es2020,dom` 通过。

备份：`.tmp/city-render-backup/`；检查脚本 `.tmp/render-inspect.js`、`.tmp/render-tour.js`。MCP 旧会话失效后使用项目已有 `.tmp/vision-mcp.cjs` 建立新会话。性能和视口检查通过独立 Chrome 调试页执行，未保存测试时的人物位置。
