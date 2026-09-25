# 暂停生产与非武器物品

当前仅启用 `assets/config/items/weapons.json` 中的武器。材料、食物、药品、杂项表使用顶层 `enabled: false` 暂停；条目也支持独立的 `enabled: false`。定义、图标保留，停用物品不可使用、分配到快捷栏或装备，已装备的停用护具不提供防御。

普通制造和快捷制造通过 `src/systems/data/ContentAvailability.ts` 的 `CRAFTING_ENABLED = false` 一起关闭。原始配方保留，配方查询为空，直接按配方 ID 制造也会失败。制造页面本身保留，不提供可用配方。

采集掉落、容器生成、直接奖励和拾取会检查启用状态；签到不展示或发放停用奖励，已有邮件的停用附件暂不能领取。需要全部成功的奖励接口会拒绝含停用物品的整批奖励，避免部分发放后扣除领取机会。

2026-09-21 更新：重新运行游戏后，加载存档时清理背包、仓库、装备和快捷栏中的已停用物资及未知旧 ID，保留武器。每个发生清理的存档在本地保存一份带 `_before_retired_cleanup_20260921` 后缀的首次备份，不覆盖已有备份。旧云存档再次导入时也会清理；角色数值、签到和邮件不在清理范围。以后启用的新物资不会被此逻辑删除。备份仅保存在同一运行环境的本地存储中。

恢复时，将对应物品表的 `enabled` 改为 `true`，需要恢复制作时再将 `CRAFTING_ENABLED` 改为 `true`，然后重新运行。

验证：`node tools/test-content-availability.cjs`、`node tools/test-spatial-inventory.cjs`、`node tools/test-legacy-inventory-cleanup.cjs`。此次修改不包含任务系统，也不调整饥饿、口渴等生存数值。
