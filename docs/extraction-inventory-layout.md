# 装备与状态页面

参考用户提供的 `C:/Users/xunenghong/Downloads/1.jpg`。背包与仓库共用可编辑预制体布局：左侧为装备、口袋、弹挂、背包的纵向滚动区；右侧为真实玩家状态或仓库／搜索容器。顶部按钮可定位装备和背包。

健康、体力、水量与能量（饱食度）读取 PlayerStatsManager，每 200ms 更新显示。当前状态根据真实数值显示受伤、重伤、体力不足、缺水及饥饿，不生成虚构增益。

当前功能范围：头盔、护甲、原有手持武器、防弹插板、四个快捷收纳槽和背包沿用既有系统；口袋显示既有快捷槽，尚不是独立的四个单格容器。耳机、副武器、手枪、近战与弹挂是禁用的预留槽，显示“暂未开放”。尚未实现多武器同时装备或独立弹挂容量。

代码不在运行时创建布局节点。维护 `tools/build-tactical-inventory.cjs` 并重新生成两份预制体。GLoader 使用 Contain 和数值枚举居中，保持图像比例。

验证：`tools/test-extraction-layout.cjs` 使用隔离 Chrome CDP 9234 与不保存数据的测试场景，覆盖实际滚轮、定位按钮、状态值与血条、页签、Ctrl 点击转移及屏幕外网格判定。`tools/test-tactical-inventory.cjs` 验证后端物品操作。TypeScript 使用 `--noEmit --lib es2020,dom` 通过；默认 lib 的检查被既有建筑脚本的 Object.values 类型配置问题阻挡。
