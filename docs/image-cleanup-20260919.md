# 图片素材整理记录

## 整理结果

- 初始扫描：assets 下 1,773 张图片，84.43 MiB。
- 合并 22 张字节完全相同且导入设置一致的副本，约 0.52 MiB；原图和 .meta 已移入可恢复备份。
- 将 48 张未查到直接引用的图片移到 art-library 备用库，约 43.38 MiB，未永久删除。
- 将 59 个保留在 assets 中的素材及配套文件分类，其中包括 51 张 PNG；保持原 UUID。
- Spine 源图片、导出图集及瓦片资源保持完整。动画源图中的重复副本本轮没有删除，避免破坏编辑源文件的路径依赖。
- 整理过程中出现的新森林瓦片和测试场景不属于本轮清理对象，保持原样，因此当前总数与初始统计的简单相减可能不同。

## 分类位置

| 目录 | 用途 |
| --- | --- |
| assets/atlas/picture/items/shared | 合并后的通用占位图标 |
| assets/atlas/picture/effects/fire | 火把、篝火、火焰图集、独立帧及配套预览 |
| assets/atlas/picture/effects/weather | 雪花、雪粒子及配套材质 |
| assets/atlas/picture/effects/lighting | 火光、夜视、室内遮罩贴图 |
| assets/atlas/picture/environment/city | 已引用的城市环境图片 |
| art-library/images | 未引用的备用素材，按用途分类 |

原有 items、interacts、ui 等分类继续使用。尚未确认用途的成套素材没有按单张拆散删除。

## 引用与存档兼容

重复物品图标已统一引用共享图片，同步更新物品配置、合成及其他硬编码引用，并去除构建清单中的重复资源条目。光照图片生成工具已更新输出目录。

旧存档可能保存被合并图片的 UUID 或路径。LegacyItemIconAliases.ts 在 SaveManager 读取 JSON 时，仅转换已知旧 icon 字段，不改变物品 ID、数量、名称或其他字段，不主动覆盖玩家存档。

以后给单个物品换图，应给该物品配置新的图片资源；不要直接替换共享 PNG，否则所有共用该占位图的物品都会一起变化。

## 备份与验证

清理映射见同目录 image-cleanup-20260919-manifest.json。重复副本和改动前文件位于 `.tmp/image-cleanup-backup-20260919/`，不要在需要回退时清空该目录。

已检查图片哈希、UUID 保持一致、失效引用、106 种旧存档图标地址迁移及 TypeScript 编译。通过 MCP 观察临时运行时加载探针，51 张迁移后保留在 assets 中的图片全部按原 UUID 加载成功，失败数为 0；探针已移除。完整回退需要同时恢复资源文件与引用配置，不能仅复制回重复 PNG。

MCP 的 queryRefs 接口因项目中带 BOM 的 JSON 解析错误而无法完成，因此未引用判断使用了本地 UUID、完整路径和文件名扫描；未引用图片采用可恢复备用库处理，没有据此永久删除。
