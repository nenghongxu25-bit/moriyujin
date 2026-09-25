# 美术制作记录汇总与备份

备份包：`archives/art-records-20260920.zip`。这是现存制作记录的汇总，不是整个项目或全部图片源文件的备份。

## 提示词与记录入口

| 内容 | 记录 |
| --- | --- |
| 森林补充素材：歪松、枯树、幼松 | docs/forest-expansion-prompts-recovered.json：从生成会话参数恢复的原文 |
| 森林补充素材：岩壁 | assets/forest-generation-records/expansion-v1/rock-cliff-prompt.txt：原文 |
| 森林补充素材：灌木、松针落叶、断枝、芦苇、泥岸 | assets/forest-generation-records/expansion-v1/README.md：主题摘要；未找到完整逐字请求 |
| 森林新增杂物 | docs/forest-new-preview.md；.tmp/forest-new-generation.json |
| 森林动物与动画试样 | docs/forest-animal-preview.md、animal-animation-preview.md；对应 .tmp 请求记录 |
| 森林瓦片、地形与水面 | docs/forest-grass-generation-prompt-v1.txt、forest-kit-v2-generation.txt、forest-v3-generation.md、forest-water-generated.md |
| 森林元素重绘与修复 | docs/forest-elements-v2-generation.md、forest-image-repair-review.md |
| 城市与博物馆素材 | docs/urban-kit-v1-generation.md、urban-props-v2-generation.md、museum-props-v1-generation.md |
| 旧等距研究 | archives/cozy-isometric-study/assets/isometric-study/generation-prompt.txt |
| 素材分类与路径变更 | docs/forest-asset-moves.json、forest-asset-catalog.html |
| 分层、碰撞与区域规划 | docs/forest-decoration-layers.md、forest-region-layout.md |
| 已删除的18个测试场景 | archives/test-scenes-cleanup-20260920.zip；同名 .json 为原路径清单 |

## 完整性说明

现存记录已集中打包，保留原文和原路径。近期9张补充素材中，4张有完整原提示词，5张只有已保存的主题摘要与公共风格要求。没有把重新撰写的描述冒充原始请求，也不保证历史上每次生成或失败重试都留有原文。

旧文档中的素材与预览路径保留为历史记录；素材现在的位置以 forest-asset-moves.json 为准，删除的测试场景可从场景备份包找回。备份包含相关制作脚本，但不保证它们在目录调整后无需修改即可重新运行。

压缩包内 MANIFEST.json 记录每个条目的原路径、文件大小和 SHA-256。包内相对链接需要按清单将资源恢复到项目中后使用；图片主体仍保存在项目素材目录。
