# 备用图片素材库

更新：用户要求查看的 21 张森林素材已于 2026-09-19 移回 `assets/decorate/forest/`，保留原 UUID；下方 48 张是首次整理时的历史数量。

这里存放 2026-09-19 整理时未在项目场景、Prefab、配置、脚本或配套文件中查到直接引用的 48 张图片。它们不在 assets 下，不参与当前引擎资源导入，但仍可取回使用。

“未查到引用”不等于已经证明永远无用；没有永久删除这些原创图片。`.meta` 与图片一起保留，方便恢复原 UUID。

- `images/decorate/city/`：城市物件备用图。
- `images/decorate/forest/`：森林物件和素材组合图。
- `images/tileset/previews/`：瓦片预览图。
- `images/container/`：容器备选图。
- 其余目录保留原有用途分类：装饰、界面模块、NPC、特效等。

恢复时将图片和同名 `.meta` 一起移回 assets 下的合适分类目录，并等待 IDE 导入；如存在同名文件，先核对，勿直接覆盖。当前目录规范见 `docs/image-material-layout.md`，本轮分类映射见 `docs/image-material-layout-manifest.json`；早先清理映射保留在 `docs/image-cleanup-20260919-manifest.json`。
