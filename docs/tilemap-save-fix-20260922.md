# 普通路面保存缺块

city/GroundLayer/Sprite 使用原生 TileMapLayer，原先未覆盖墙体、屋顶、室内地板各自的保存保护。

实测引擎 `_setCell` 在替换旧类型的最后一格时删除旧 `_cellDataRefMap[oldGid]`，却从 `_refGids` 删除新 gid。编辑器格子仍在，`compressData` 按错误的编号列表保存，运行时整组瓦片缺失。`transFlags` 从实际格子列表序列化，因此文件中仍留有位置记录。

修复前备份中路面保存了 2009 格，另有 269 个 transFlags 位置没有对应瓦片编号。编译保护后再次核对，原 269 个位置全部恢复为有效瓦片（编号 25、24、8）；当时场景共 2310 格，未发现孤立的位置记录。用户继续绘制后运行时加载到 2567 格。未根据邻居推测纹理、未重建或覆盖地图。

`TileMapSerialization.ts` 统一修复所有 TileMapChunkData 的保存索引：保存前按仍有格子的类型重建索引，绘制/擦除前后维护一致性；幂等安装，同时覆盖已有索引损坏。通过已有 IndoorFloorLayer 的编辑器脚本入口加载，编译到 bundle.scene.js 和 bundle.js，适用于普通路面而不依赖另挂室内脚本。无每帧轮询。

验证：test-tilemap-save（实际引擎替换方法、0号瓦片、即时保存、已有损坏、旋转标志、序列化往返、重复安装）、test-brick-wall-save、test-house-roof。运行时确认全局保护已安装，模拟缺失索引的存活数据能完整序列化。TypeScript `--lib es2020,dom` 检查通过。

原场景备份 `.tmp/road-save-backup/city.ls`，恢复位置明细 `.tmp/road-save-recovery.json`。如果场景已经重新载入且旧瓦片数据已丢失，保护只能防止再次丢失，不能从单独的位置记录猜出原始材质。
