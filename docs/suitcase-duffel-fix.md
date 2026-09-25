# 旅行箱与帆布旅行袋修正

硬壳旅行箱（suitcase）改为四帧共用固定箱体，箱盖绕固定铰链投影，不再对整件物品逐帧缩放。源帧备份在 `art/container-bodies-before-lock/suitcase/`。

帆布旅行袋（duffel_bag）保留固定包体及包口动画。合成前清除各源帧透明区域中的独立碎片，合成后再检查连通轮廓；保留主体边缘的一像素低透明度抗锯齿。原帧分别清除了 973、765、990、857 个残留像素。

修改直接写入原项目 PNG 路径，尺寸仍为 512×512，未变更资源 UUID。没有调用图像生成。

验证：旅行箱固定区域通过 14,562 次像素比较，旅行袋通过 56,439 次；第一、第二批 Laya 预览共加载 48 张纹理，12 个容器均完成开启动画。浅色底四帧检查图为 `bag-suitcase-fixed-frames.png`，动态对比为 `fixed-container-bodies-preview.html`。

在 `assets/scenes/loot-points-all.ls` 预览。已经开启的预览需要停止后重新运行，以重新加载纹理。
