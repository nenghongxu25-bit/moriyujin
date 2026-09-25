# 狼与小野猪：行为试用版

## 入口

- 测试场景：`assets/scenes/animal-behavior-test.ls`，在 LayaAir 中打开并播放当前场景。
- Prefab：`assets/prefab/animals/wolf.lh`、`assets/prefab/animals/young-boar.lh`。
- 共用代码：`src/Animals/AnimalController.ts`、`AnimalFrameAnimator.ts`。
- 测试专用：`AnimalDemo.ts`、`AnimalTestTarget.ts`，不需要挂到正式场景。

## 测试操作

点击预览使其获得键盘焦点。油桶是可移动的测试目标，不是真实玩家，不读写玩家血量或存档。

- 方向键：移动油桶，观察狼的追击、攻击及脱离。
- B：对小野猪造成 5 点伤害，触发反击。
- K：击杀两只动物，观察停伤与淡出。
- R：重置动物和测试目标。
- T：重新运行自动行为检查。

## 行为与接入

狼主动发现并追击目标；小野猪在附近巡逻，受伤后反击。丢失目标或超出活动范围后尝试返回出生位置。移动与攻击使用已有瓦片、DepthObstacle 阻挡检查。

在正式场景拖入 Prefab，保持 `targetNode` 留空，会寻找当前 `PlayerController.activeInstance`；也可明确绑定目标节点。目标需有 `takeDamage` 组件。动物通过 `takeDamage()` / `isDead()` 接入现有近战和远程伤害识别。

根节点代表脚底位置，不随朝向翻转；只翻转 AnimalView，因此受击传感器不随镜像错位。动画帧通过 Prefab 的 Texture 引用加载，不依赖临时文件或运行时创建 UI。

在 AnimalController 属性中调整血量、巡逻/奔跑速度、警戒/脱离距离、攻击距离、伤害、冷却时间等。在 AnimalFrameAnimator 中调整帧率。`attackHitFrame` 从 0 开始，默认 3：10 FPS 时进入攻击约 0.3 秒尝试命中，每次攻击仅一次机会，目标离开范围、绕到身后或被障碍遮挡均可落空。

死亡立即关闭受击节点、取消攻击，发出 `animal-died` 事件，随后淡出并停用；调用 `resetAt(x, y)` 可复用。当前没有掉落、经验、刷新器、血条或死亡专用动画，也未自动投放到正式地图。

## 当前边界

- 采用直线追击与阻挡检查，没有 A* 绕路；复杂墙角可能停住。
- 动画仅有侧面，左右镜像，纵向移动没有独立朝向素材。
- 现有生成帧仍为试用素材，肢体连续性和边缘效果可以继续精修。
- 测试场景使用与 Prefab 相同配置的内嵌节点；后续修改 Prefab 时需同步场景配置。

## 验证记录（2026-09-19）

- `npx.cmd tsc --noEmit`：通过。
- `node tools/test-animal-controller.cjs`：15 项逻辑测试通过。
- Laya MCP 校验两个 Prefab 与测试场景结构：通过。
- Laya 编辑器实际播放日志：`[AnimalDemo] ALL PASS 20`；截图确认狼、小野猪、油桶、栅栏正常显示。
- 场景测试覆盖帧推进、朝向、追击/反击、前摇及单次伤害、闪避、失活目标、障碍阻挡、死亡与重置。
- 近战接入测试调用已有 AttackHitbox 的合成触发事件，远程接入调用已有 PlayerRangedController；尚未完成真实玩家在正式地图中的物理碰撞端到端验收。
