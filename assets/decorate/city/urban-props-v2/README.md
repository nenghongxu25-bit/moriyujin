# 城市独立物件 v2

沿用 urban-kit-v1 的写实斜俯视画风，补充室内和街边可单独摆放的物件。没有建筑主体、墙体部件或地块。

| 文件 | 元素 |
| --- | --- |
| shop-shelf.png | 便利店货架 |
| checkout-counter.png | 收银台 |
| office-desk.png | 办公桌及桌上电脑 |
| filing-cabinet.png | 文件柜 |
| staff-locker.png | 员工储物柜 |
| waiting-sofa.png | 等候沙发 |
| vending-machine.png | 自动售货机 |
| mechanic-tool-cart.png | 维修工具车 |

每件为独立透明 PNG，可以拖入场景。打开 `urban-props-preview.ls` 查看两排四列的素材预览，顺序与上表一致。预览的相同占位便于看图，不代表真实世界比例；使用时按角色身高分别缩放。

柜门、抽屉和收银机当前是静态关闭状态。素材尚未绑定碰撞、搜索、开关或其他交互逻辑；桌上电脑属于办公桌同一张图。以后需要独立交互的部位可以再拆分并补充状态图。

实际图片尺寸、可见范围及透明检查见 `manifest.json`。使用内置 imagegen，完整提示词见项目根目录 `docs/urban-props-v2-generation.md`。
