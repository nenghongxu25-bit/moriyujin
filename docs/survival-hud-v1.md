# 生存风 HUD 第一版

主入口：`assets/prefab/prefab-ui/play_ui.lh`。正式森林等使用共享 HUD 的场景会同步采用新样式。

素材：`assets/ui/survival-hud/`。灰绿半透明底、浅色线形图标和薄边框，依据 `art-library/ui-concepts/forest-hud-concept-v1.png` 落地。简单图形由可编辑构图脚本 `tools/build-survival-hud-art.ps1` 导出透明 PNG，不含地图背景，不是整张 AI 效果稿截图裁切。没有更改原美术文件。

布局基准1334×750：账号信息左上；背包与制作右上；摇杆左下；攻击右下，射击模式与情境交互紧邻；四格快捷栏底部居中。

保留原节点ID、组件、绑定、快捷栏动态物品及攻击区武器图。奔跑仍沿用摇杆的外圈触发，原独立奔跑按钮保持禁用；射击模式保留原状态点。没有添加暂停功能或虚构状态数值。左上账号授权信息仍然保留，背包等弹窗内部尚未换肤。

备份：`backups/survival-hud-v1/` 中按原路径保存修改前文件。迁移脚本只用于首次迁移，不要重复执行；素材源脚本可单独重建PNG，保持.meta不变。

检查：`node tools/test-survival-hud.cjs`、`npx.cmd tsc --noEmit`。全套多指输入、所有场景和设备长宽比仍需后续真机验收。
