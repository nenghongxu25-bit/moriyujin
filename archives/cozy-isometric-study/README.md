# 柔和菱形地台：跨项目学习存档

这是独立的 2D 美术试样，含 45 个地块和 15 个摆件。PNG、原始图集、生成提示词、场景、资源 .meta、背景组件和运行截图均已保留。

在兼容的 LayaAir 3 项目中，关闭预览后将包内 assets/isometric-study 与 src/systems/IsometricStudyBackdrop.ts（含 .meta）按同路径导入。保留资源 .meta 以保留 UUID 引用。等待编辑器导入完成，打开 assets/isometric-study/isometric-study.ls，运行当前场景。

如目标项目已有同名目录或同 UUID 资源，先在独立测试项目中导入，避免覆盖。无需替换目标项目的 Main.ts、工程设置或启动场景。本存档不是完整游戏工程，不包含角色移动、碰撞和采集。

docs/isometric-study-preview.png 是实际 LayaAir 运行截图。素材由内置 imagegen 生成，生成提示词位于 assets/isometric-study/generation-prompt.txt。用于学习固定视角、柔和配色和 2D 菱形地台的组合方式。
