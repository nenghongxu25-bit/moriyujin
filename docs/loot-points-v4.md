# 第四批物资点：住宅与办公

**修正记录：纸箱与厨房吊柜先前的跨帧遮罩拼接仍存在变形，现已由独立刚性图层重建替换。制作依据、重建脚本与验证见 [v4-rigid-rebuild.md](v4-rigid-rebuild.md)。下文旧遮罩制作描述不再代表这两个物件的当前实现。**

本批包含 4 个可搜索容器：旧木床头柜、旧式办公桌、旧纸箱、厨房吊柜。每个容器有关闭至完全打开的 4 帧透明 PNG，512×512、8 FPS、不循环。

正式接入：`assets/prefab/prefab-interact/loot-points-v4/` 中四个预制体使用 `LootPoint`，保留搜索感应区域、深度排序与遮挡组件。`contentsJson` 默认空，掉落内容需在地图实例配置。预览场景使用独立副本及 `LootPointPreview`，只播放动画。生成脚本先保存正式预制体，再生成预览副本，禁止用预览组件覆盖正式资产。

验证命令：`node tools/test-loot-point-gameplay.cjs --batch4` 加载实际预制体，验证正式开启动画、忙碌时拒绝重复开启、一次性容器用尽状态；`node tools/test-loot-point-ui.cjs --batch4` 验证点击预览。

资源已接入：

- 配置：[loot-points-v4.json](../assets/config/loot-points-v4.json)
- 独立预览场景：`assets/loot-points-study/loot-points-batch4-preview.ls`
- 浏览器逐项预览：`docs/loot-points-batch4-preview.html`
- 原始图与生成提示：[loot-points-batch4-art-manifest.json](loot-points-batch4-art-manifest.json)

动画规则：床头柜和办公桌仅移动抽屉；纸箱仅打开顶部纸盖；厨房吊柜仅绕固定铰链打开双门。纸箱重建为固定下箱体叠加活动纸盖；吊柜重建为固定关闭柜体叠加正面门/内部开口，避免整件物品缩放变形。吊柜全开帧曾出现顶部孤立残片，已从最终帧清除，原始未清理帧备份在 `art/loot-points-v4/repair-backups/`。

验证结果：项目运行时加载 4 个预制体和 16 张帧纹理；全部序列能到达第 4 帧。运行时全开截图为 `docs/loot-points-batch4-preview-runtime-open.png`。
