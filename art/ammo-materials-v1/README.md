# 子弹与改装材料立绘

使用内置 imagegen 分别绘制 8 张独立透明立绘。完整提示词见 `prompts.json`，原始生成图备份到 `originals/`，对应关系见 `sources.json`。

项目图标目录：`assets/atlas/picture/items/ammo-materials-v1/`。
子弹、改装零件和精密组件占 1×1 格（256×256）；维修套件占 2×1 格（512×256）。统一按透明内容边界等比缩放，保留边距，不拉伸。

| 文件 | 名称 | 用途 / 等级上限 |
| --- | --- | --- |
| ammo-762x39.png | 7.62×39 | 1–5 级弹 |
| ammo-762x51.png | 7.62×51 | 1–6 级弹 |
| ammo-556x45.png | 5.56×45 | 1–5 级弹 |
| ammo-545x39.png | 5.45×39 | 1–5 级弹 |
| ammo-9x19.png | 9×19 | 1–3 级弹 |
| modification-parts.png | 改装零件 | 武器改装经验 |
| precision-components.png | 精密组件 | 属性洗炼材料 |
| repair-kit.png | 维修套件 | 耐久修复材料 |

同口径各级子弹共用一张立绘。1–6 级对应白、绿、蓝、紫、金、红背景，背景由 UI 单独显示，图片中不绘制背景、文字或等级。建议显示名称为“7.62×39 · 3级弹”。本次仅交付美术资源，未修改物品数据、掉落、商店或升级逻辑。

重新导出：在项目根目录运行 `powershell -File tools/export-ammo-material-icons.ps1`。检查预览：运行 `powershell -File tools/preview-ammo-material-icons.ps1`，打开本目录 `preview.png`，检查深色、浅色、棋盘格与小尺寸效果。
