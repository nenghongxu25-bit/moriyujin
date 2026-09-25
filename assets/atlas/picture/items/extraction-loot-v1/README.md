# 搜打撤物资第一批

## 占格规格（已修正）

每格 256×256 像素：1×1 为 256×256、1×2 为 256×512、2×1 为 512×256、2×2 为 512×512、2×3 为 512×768。成品按透明轮廓裁切后等比缩放、居中，保留至少约 16 像素边距。扳手旋转 24 度，沿竖向两格摆放。物体保持真实比例，不强行撑满两个方向。

原始生成稿备份：`backups/loot-before-grid-fit-20260921/`。`prompt` 字段保留原生成记录；最终成品尺寸以 `pixelWidth/pixelHeight` 为准，`fitting` 记录等比排版过程。

复检命令：`node tools/test-loot-icon-sizes.cjs`。总览按同一格子大小展示，便于发现比例问题。

67 件原创独立透明底 PNG，由内置 image_gen 逐件生成。风格为写实旧化、低饱和、偏俯视的三分之四视角。图片不含稀有度底色或边框，供背包 UI 另行添加。

分类：industrial（五金 10 件）、electronics（电子 11 件）、household（生活 10 件）、valuables（收藏 10 件）、samples（特殊样本 10 件）、medicines（医疗 10 件）。

`manifest.json` 保存中文名、文件路径、规划占格、稀有度和每件完整生成提示词。提示词要求：单件独立物品、真实透明背景、清晰轮廓、柔和左上光、保留完整外形、无品牌和文字标签；各条目末尾描述具体物体。

浏览总览：`docs/extraction-loot-v1.html`。规划字段尚未写入游戏物品配置，也未改变此前停用的物品开关。

新增四件：军用加密数据盒、铁路检修怀表、稀有金属样本、折叠皮腔相机。生成原稿保存在 `art/extraction-loot-additions-20260923/source/`。素材位于 electronics/、valuables/、samples/；仍为美术资源，未登记到游戏物品表。

普通物资新增九件：帆布工作手套、搪瓷杯、麻绳卷（gray/白档）；黄铜指南针、手摇手电筒、折叠手锯（green）；双筒望远镜、手持 GPS、便携急救包（blue）。PNG 保持透明底，稀有度底色由 UI 绘制。原始图保存在 art/extraction-loot-common-20260923/source/。

新增普通物资 20 件，六类总数为 industrial 10、electronics 11、household 10、valuables 10、samples 10、medicines 10。新增稀有度为 gray 7 件、green 7 件、blue 6 件；PNG 均为透明底，稀有度背景由 UI 绘制。原始图保存在 art/extraction-loot-balance-20260923/source/。


投掷物新增 6 件：破片手雷、闪光弹（blue）；烟雾弹、震撼弹（green）；燃烧瓶、诱饵弹（gray）。PNG 均为透明底，稀有度底色由 UI 绘制。生成原图保存在 art/extraction-loot-throwables-20260923/source/。投掷物目前仅为美术资源，尚未登记到游戏物品表。


医疗物资新增 13 件：药包、手术包、止痛药各分基础/标准/高级三级；另有肾上腺素针、强效恢复针、强效体力针、强效负重针。图标为透明 PNG，稀有度底色由 UI 绘制。原始图保存在 art/extraction-loot-medical-20260923/source/。目前仍为美术资源，未登记到游戏物品表。


医疗物资外观已按具体游戏物资型号修订并覆盖：926快速急救包、STO急救套装、TMK野战医疗包；简易手术袋、标准军用手术包、TMK军用手术包；消炎止痛药、速效止痛药、AP镇痛片；肾上腺素、Propital、SJ6、M.U.L.E.。手术包格数按 1x1、1x2、1x3 设置。原先通用概念图已被替换，生成原图存放于 art/extraction-loot-medical-refs-20260923/source/。
