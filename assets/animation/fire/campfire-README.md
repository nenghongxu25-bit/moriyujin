# 篝火动画

目录更新：动画图集和预览在本目录，静态底座位于 `../../decorate/fire/campfire-base.png`，预览和配置已同步修改。

打开 `campfire-preview.html` 查看动画，默认每秒 8 帧，一秒循环。

`campfire-base.png` 是透明静态底座。火焰直接引用同目录已有的 `torch-flame-sheet.png`，没有复制或重新生成火焰。木柴与石圈保持固定，火焰显示尺寸为 650×650，根部对齐中央炭火。当前交付为素材和独立预览，尚未挂接游戏节点。

`campfire-animation.json` 为通用配置说明，不是 Laya 原生 atlas。游戏接入时可共用火把的已加载图集，只调整显示尺寸和偏移。

## 生成记录

底座由内置 imagegen 生成，以 torch-body.png 为风格参考，保留透明通道。火焰使用现有资源。

最终底座提示：

```text
Use case: stylized-concept. Generate a transparent 2D game prop: a CAMPFIRE BASE WITHOUT FLAMES. Input image is a STYLE REFERENCE ONLY: match its richly hand-painted cartoon wood grain, warm brown bark, dark outlines and readable survival-game silhouette. Not a torch. One small rustic campfire with 5 chunky split logs crossed in a low radial pile, charcoal blackened inner ends, a few subtle orange ember cracks in the central coal bed, surrounded by one modest irregular ring of 8 grey-brown stones. Slightly elevated three-quarter/top-down game view; show top faces and front faces, no horizon. True transparent alpha background, no scenery or ground patch, no text, no smoke, no sparks, NO FLAMES, no glow halo. Square 1024x1024 canvas. Place entire base within x150..874 and y570..900, leaving upper half empty transparent for a separately animated flame. Central ember bed where flame will attach is around x512 y690. Keep center low/open, no tall logs blocking the future flame. Soft warm highlights toward central ember bed. Beautiful game-ready isolated sprite with clean alpha edges. Do not include any torch handle or cloth.
```
