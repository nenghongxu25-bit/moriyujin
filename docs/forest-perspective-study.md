# 森林纯二维等距场景

入口：`assets/forest-isometric-study/forest-isometric-study.ls`，播放当前场景。

- 按用户要求移除该场景的 `PerspectiveWorld` 和 `FixedPerspectiveCamera`，不再通过 3D 相机生成地面或摆件。
- 直接显示原生二维 `NativeIsometricGround` 瓦片层、`SoilFoundation` 底座、`ContactShadows` 接触阴影和 `ForestProps` 摆件。
- `IsometricStudyBackdrop` 仅设置米白背景色，并在禁用时恢复先前背景色；不再创建网格或隐藏二维节点。
- 保留场景中当前绘制的地块、额外瓦片层、素材和摆件位置。
- 这是等距画面小样，尚未接入人物、碰撞、天气或交互。

本次修改前的场景和脚本备份：`backups/forest-before-pure-isometric-20260920/`。
