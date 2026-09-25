# 森林图片切割检查

## 尺寸分档已完成（2026-09-19）

用户确认按类别等比缩小，19 张正式图片全部处理。使用同一个缩放系数处理 X/Y，不拉伸、不裁切、不重画。PNG 整数画布向上取整，余量小于 1 像素；图像本身按浮点等比变换绘制，不为凑整数尺寸改变宽高比。透明通道、文件尺寸及 .meta 保持检查通过。此处“文件尺寸检查”指输出符合计划，原始分辨率已按下表改变。

| 类别 | 长边上限 |
| --- | --- |
| 篝火、油桶、发电机 | 128 |
| 灌木 | 192 |
| 倒木、木堆、厕所、木栅栏 | 256 |
| 松树 | 320（高度） |
| 皮卡、木桥 | 384 |
| 木屋、废屋、地堡、检查站、帐篷、锯木厂、瞭望塔、岩石高地 | 512 |

19 张 PNG 总大小从 20,669,106 字节降到 3,624,852 字节。高清原图与 .meta 保留在 `art-library/backups/forest-before-resize-20260919/`，资源目录内只有当前缩小版本。该备份的 resized 子目录是输出校验副本。缩小是有损采样，后续修改应从高清原图重新导出。

抽查松树、油桶、木屋缩放后图片；MCP 已等待资源导入。未改场景节点尺寸、碰撞体或显示缩放；实际摆放比例仍由场景设置决定。下文为历史记录，等待尺寸确认的事项已完成。

## 旧版和源图移出资源目录（2026-09-19）

`assets/decorate/forest` 仅保留 19 张最新处理后的独立 v1 图片。两张 kit 源图、campfire-v2 生成式试样、rusty-pickup-clean-v2 清理试样及其 .meta 已移至 `art-library/images/decorate/forest-source-archive/`，哈希一致，未删除。最新结果是 v1，而非历史试样 v2。

MCP queryRefs 因既有 JSON 的 BOM 解析失败，退回检查 assets/src/settings 内的 UUID 与文件名引用，未发现上述 4 张图片的静态引用；MCP waitAssetBusy 已返回成功。

尺寸暂未改动。建议参考现有小物件 128、灌木 192、树高 320 的档位，为这批素材分级等比缩放；等待用户确认方案。当前编辑器未运行游戏，未验证场景内最终视觉比例。

## 截断恢复已完成（2026-09-19）

从原始图集中重新提取完整主体，替换以下 v1 文件，未使用生成式修补、未缩放或重绘。保留原始像素，四周留 8px 透明边距，文件名和 .meta 不变。

| 图片 | 恢复后的尺寸 | 恢复内容 |
| --- | --- | --- |
| campfire | 333×284 | 左侧完整石圈 |
| sawmill | 722×467 | 底部木料和地面 |
| military-checkpoint | 664×358 | 顶部立柱及底部边缘 |
| watchtower | 340×527 | 完整棚顶 |
| rocky-lookout | 764×469 | 完整树梢 |

修复前图片与元数据：`art-library/backups/forest-crop-restoration-20260919/`。逐像素验证恢复后的主体与源图一致。检查站与瞭望塔在源图中有边缘相连，按两物件间的空隙分离。原图本身的红绿色边缘瑕疵未重绘处理。

注意：画布尺寸、主体相对画布的位置改变了；如果外部场景按旧尺寸或锚点手工摆放，需复查位置。以下各节为此前处理记录，其中“截断仍待处理”已由本节完成。

## 像素清理已执行（2026-09-19）

按用户确认的办法直接清空外围杂像素，不使用 AI 重绘。修改 15 张 v1 图片：木屋、帐篷、皮卡、木堆、篝火、木桥、地堡、检查站、倒木、油桶、发电机、厕所、松树、灌木、木栅栏。保留主体附近不确定的细节和连接在主体上的背景光晕。

文件尺寸与 .meta 不变，逐像素验证清理区域之外无变化。原始文件及元数据备份在 `art-library/backups/forest-fragment-cleanup-20260919-125643/`。`cleaned-` 前缀文件为清理后的校验副本。

主体截断仍待单独重新裁切：篝火左缘、锯木厂底部、检查站顶部、瞭望塔屋顶、高地树梢。这次仅删除多余像素，不补画缺失部分。此前的 v2 篝火与皮卡试样保留，但正式清理更新的是原 v1 文件。

以下为先前检查及生成式试样记录。

已逐张查看 assets/decorate/forest 中 19 张独立图片与 2 张原始图集。

明显问题：皮卡、木堆、木桥混入相邻素材残片；篝火左侧截断并带入上方残片；锯木厂底部、检查站顶部、瞭望塔屋顶、高地树梢被截断；地堡带入上下相邻素材残片。原始图集中能找到这些主体的完整轮廓。

倒木、发电机、松树、木栅栏另有明显背景光晕，本次尚未处理。

## 单张修复试样

- 输出：assets/decorate/forest/forest-campfire-v2.png
- 方法：内置 imagegen，以原始 environment 图集为参考提取并重绘单个篝火。
- 原文件全部保留，尚未批量修复或替换。
- 注意：这是生成式修复，不是像素无损裁切，局部纹理有所变化。
- 提示词：Extract ONLY the complete stone-ring campfire in the bottom-left of the reference into one standalone game sprite. Preserve its original elevated viewing angle, shape, stones, logs, orange flames, texture, muted gritty hand-painted realistic forest survival game art style. Entire stone ring intact, centered with transparent margin. Actual transparent RGBA background, no black backdrop, no baked checkerboard, no glow outside object, no text. Remove every other asset completely. Single campfire, NOT a sprite sheet.
