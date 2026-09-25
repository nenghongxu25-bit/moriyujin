# 物资点素材与开启动画

六种原创搜打撤容器：军用武器箱、钢制弹药箱、急救医疗箱、工业工具箱、帆布旅行袋、机械保险箱。

- 素材：`assets/animation/container/loot-points-v1/<id>/frame_00.png` 至 `frame_03.png`。每帧 512×512，透明 PNG；四个状态为关闭、初开、半开、全开。每组使用同一缩放倍率并对齐右侧底部，未逐帧拉伸。
- 地图预制体：`assets/prefab/prefab-interact/loot-points-v1/`。显示画布分别为 320、176、208、208、224、240 像素，实际物体轮廓小于画布。这些是地图物件，不是背包占格物品。
- 每组 `animation.json` 记录帧序、8 FPS 和落地点；`LootPoint` 复用现有 ContainerBase 搜索交互，打开后停留最后一帧，预加载四张纹理。
- 将预制体拖入地图 ActorLayer，按位置设置唯一 instanceId；在 contentsJson 配置掉落。默认内容为空。未改动现有 city/forest 点位、旧容器素材与掉落表。
- Laya 预览场景：`assets/loot-points-study/loot-points-preview.ls`。网页动画预览：`docs/loot-points-preview.html`。
- 使用内置 image_gen 生成；完整提示词与生成文件记录：`docs/loot-points-art-manifest.json`。选定原稿保存在 `art/loot-points-v1/source/`。
- 验证：切帧脚本检查真实透明通道；TypeScript 编译通过；`tools/test-loot-point-ui.cjs` 在 Laya 运行时验证六种组件、24 张纹理加载和打开后最后一帧。

后续需要更细腻的慢速开启时，可以在当前四个关键姿态之间增加中间帧；本版为四帧快速开启。
