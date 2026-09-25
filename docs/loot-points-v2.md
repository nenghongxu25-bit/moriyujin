# 第二批物资点

| 容器 | 开启动作 | 地图显示画布 |
| --- | --- | --- |
| 旧式文件柜 | 上层抽屉拉出 | 300×300 |
| 旧木衣柜 | 柜门侧开 | 360×360 |
| 老式冰箱 | 冰箱门侧开 | 340×340 |
| 硬壳旅行箱 | 箱盖掀开 | 224×224 |
| 旧式收银机 | 钱箱抽屉拉出 | 192×192 |
| 翻盖垃圾桶 | 桶盖翻起 | 220×220 |

每种 4 张 512×512 透明 PNG，8 FPS，播放一次后保持打开。显示尺寸包含透明留白，并非物件实际宽度或背包占格。

素材位于 `assets/animation/container/loot-points-v2/`，预制体位于 `assets/prefab/prefab-interact/loot-points-v2/`。拖入 ActorLayer 后通过 contentsJson 设置物资，默认内容为空；未替换地图已有点位。

收银机与冰箱按固定机身顶部对齐，其余按右下边界对齐；同组使用一致缩放。生成方式为内置 image_gen，完整提示词与修订记录见 `loot-points-batch2-art-manifest.json`，原稿保存在 `art/loot-points-v2/source/`。

预览网页：`loot-points-batch2-preview.html`；Laya 场景：`assets/loot-points-study/loot-points-batch2-preview.ls`。切帧透明检查、TypeScript 编译、六种容器 24 帧加载及播放终态检查均通过。
