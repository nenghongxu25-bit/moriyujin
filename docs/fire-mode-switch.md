# 射击模式切换

使用 play_ui 中已有的 pre-switch 节点及其 Sprite 圆形图案，不新增 UI。

- 只有当前远程武器的配置 fireMode 为 auto 才显示按钮；该配置表示支持连发。
- 默认白色单点：拖动瞄准，松开一枪，持续按住不射击。
- 点击变为红色连发：沿用 500ms 延迟及腰射/精瞄阈值。
- 点击切换取消当前输入，不额外发射；本次运行按武器 itemId 记忆选择，不写入存档。
- 图案只在颜色变化时更新，未改动灯光。

备份：../backups/fire-mode-switch-20260917-173522（相对项目目录）。

验证：TypeScript --noEmit 通过。MCP 编辑器运行时诊断 14 项通过，见 fire-mode-switch-runtime.json。覆盖按钮事件切换、颜色状态、单发武器隐藏、模式记忆、切换取消，以及原射击/镜头行为。显隐测试通过临时切换装备元数据模拟能力变化；结束时恢复元数据和选择。inputDiagnosticsEnabled 最终为 false。

正常预览确认默认白色。MCP 坐标点击时视口在 813×398 与 1133×637 之间变化，出现点击落到攻击摇杆的现象，因此坐标点击验证不作为通过证据；上述切换测试通过运行时节点 click 事件完成。

后续补充验证：诊断改为将按钮中心转换为引擎输入坐标，通过 InputManager 的按下/抬起流程测试。三次命中均为 pre-switch，白→红、红→白及取消当前操作全部通过，未发现按钮命中被拦截。见 fire-mode-switch-click-runtime.json。测试开关已关闭。

实际颜色刷新修复：系统鼠标点击日志确认命中 pre-switch 且进入 click，但原先仅调用 Sprite.repaint，没有使 Graphics 的图形缓存失效。改为 graphic.graphics.repaint()，仅颜色改变时调用。修复后截图 fire-switch-red.png 与 fire-switch-white.png 确认颜色随模式变化。此前仅检查 switchColor 字段的断言未能发现此渲染问题。

本次 fire-switch-color-runtime.json 中按钮命中、双向切换及隐藏检查通过；整套射击诊断还有 4 项失败（精瞄、射速、单点按住镜头和松开出弹），因此不将本次运行记录为整套回归通过。此次生产改动仅为图形刷新调用，类型检查通过，临时日志和自动测试已关闭。
