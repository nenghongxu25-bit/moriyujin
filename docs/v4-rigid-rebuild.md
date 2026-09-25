# 纸箱与白色吊柜：刚性分层重建

本次替换此前失败的跨帧遮罩拼接。旧方法不能保证箱口、柜门和主体的几何一致，先前“播放通过”的结论不代表形变问题已解决。

## 实际制作方式

- 内置 imagegen 分别补绘一张没有门的完整柜体、一张没有纸盖的完整空纸箱。原始输出保存在 `art/loot-points-v4/rigid-layers/{id}/body-source.png`。
- 门板取自备份关闭帧，纸盖纹理取自备份打开帧；每块活动部件只提取一次，保存为 `panel_*.png`。
- 四帧均从同一 `body.png` 开始绘制，门板/纸盖使用固定铰链和三角函数角度投影。中间帧不使用旧动画的整帧或局部形变图。
- 纸箱先开启外层长盖，再开启内层短盖；吊柜两扇门各自绕固定垂直轴运动。固定主体的构图只在准备阶段缩放一次。
- 对生成底图的近不透明内部像素恢复为完全不透明，避免图层合成的预乘透明度舍入导致静止区域颜色跳动。边缘抗锯齿仍保留。

## 复现与验证

运行 `powershell -NoProfile -ExecutionPolicy Bypass -File tools/build-v4-rigid-animation.ps1` 只产生候选帧、四帧并排图和检查报告；增加 `-Publish` 才在检查通过后覆盖项目的八张帧图，并保留旧版本备份。资源 UUID 不变。

- `docs/v4-rigid-contact.png`：浅色底四帧并排检查。
- `docs/v4-rigid-preview.html`：可暂停、逐帧及切换深浅背景的动画预览。
- `docs/v4-rigid-checks.json`：未被活动部件遮挡的固定表面像素比较、画布裁切检查。
- `art/loot-points-v4/rigid-layers/{id}/geometry.json`：每帧每块部件的角度和投影顶点，其中前两个顶点为不动的铰链端点。
- 项目入口仍为 `assets/loot-points-study/loot-points-batch4-preview.ls`，点击物件播放。

旧切图脚本对这些刚性分层素材会拒绝覆盖。不得再用四张独立生成的整图套遮罩重建这些动画。

## 内置 imagegen 的实际提示词

柜体（输入：原始全开柜子备份）：

> Edit this game sprite into a single clean FIXED CABINET BODY layer for skeletal animation. Remove BOTH swinging cabinet doors and their knobs entirely, repair any surfaces formerly hidden behind doors so the complete empty open cabinet body is visible. Keep the cream worn paint, two interior compartments and shelf, top cornice, exact isometric view and proportions of the cabinet housing. Single cabinet only, not a sprite sheet. No door leaves, no floating scraps, no wall, no floor, no shadow. Genuine transparent background. Entire body centered with generous transparent margins. This will be paired with separate door textures by an animation renderer; do NOT draw any doors.

纸箱（输入：原始全开纸箱备份）：

> Edit this isometric cardboard box into a SINGLE clean fixed body sprite for animation. REMOVE all FOUR top flap panels entirely at their fold lines, reconstruct the formerly occluded upper parts of the two exterior walls. Show a complete empty rectangular open-top corrugated cardboard box with NO flaps and NO lid, continuous straight rectangular rim, inner walls and bottom visible, all exterior walls complete from rim to base. Preserve worn brown cardboard material, exact isometric camera and original body proportions. Genuine transparent background. No loose fragments, no floor or shadows, no text. Single box centered with generous clear margin, not a sprite sheet. Independent flap layers will later be attached precisely to the four top rim edges by an animation renderer.
