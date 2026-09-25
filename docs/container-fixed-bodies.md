# 七种物资点固定主体

已处理：弹药箱、医疗箱、工具箱、垃圾桶、帆布旅行包、电脑主机、军用补给箱。

硬质容器四帧复用同一张箱体，只有独立盖面围绕固定铰链投影。电脑主机复用同一机身，只有侧板转动。旅行包使用同一包体、侧面和提带，变化限制在袋口区域。各帧不再缩放整件物品。

弹药箱全开盖面从原始图集扩展取样，恢复此前被常规等分切片截去的顶部。分离图层位于 `art/container-fixed-layers/`；修改前的四帧备份位于 `art/container-bodies-before-lock/`。

图片仍在原 `assets/animation/container/loot-points-v1～v3/` 路径，四帧均为 512×512 透明 PNG，资源 UUID 与预制体未更改。固定部位逐像素检查报告：`docs/container-fixed-bodies-checks.json`。这些检查覆盖固定不透明区域；活动部位允许正常改变投影形状。

- 总览场景：`assets/scenes/loot-points-all.ls`
- 可暂停、逐帧查看的对比页：`docs/fixed-container-bodies-preview.html`
- 重建：`powershell -NoProfile -ExecutionPolicy Bypass -File tools/lock-container-bodies.ps1`
- 单个重建：增加 `-Only ammo_box` 等物件 ID。

旧的整帧配准脚本已跳过这些独立图层修正版，防止再次覆盖。本次复用现有画稿，没有新增图像生成调用。
