# 物资点开启动画稳定处理

原因：旧切片将各帧完整轮廓分别贴右、贴底，活动盖子和门板改变轮廓后使固定物件发生位移；部分切片还含相邻格的孤立边角。生成图中的固定箱体存在少量尺度与局部绘制差异。

已对三批 18 种物资点处理：移除与主体不连通的切片碎片，以关闭帧的不动区域为基准估计统一缩放与平移，不拉伸宽高比例，不使用活动盖子作为基准，并限制变换防止裁切。柜体以右侧、收银机以上部、箱包以底部为参照。

72 张 PNG 已更新，路径、512×512 画布和资源 UUID 保持不变。54 个移动帧的参照区域误差均不高于处理前。三批 Laya 实际纹理加载与终帧播放测试通过。这是整体对齐修正，并不消除生成原稿的所有局部形变或纹理差异。

- 对比页：`docs/loot-frame-stabilization.html`
- 变换与误差记录：`docs/loot-frame-registration.json`
- 原始帧备份：`art/loot-frame-stabilization-before/`
- 重建：`powershell -NoProfile -ExecutionPolicy Bypass -File tools/stabilize-loot-frames.ps1`
- 旧切片安装脚本已加保护，避免重新切片覆盖修正结果。

本次未调用图像生成服务。
