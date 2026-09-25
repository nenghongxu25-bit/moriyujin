# 暗区参考页面模板

入口场景：assets/scenes/cunzhuang.ls

模板位于 assets/prefab/prefab_interface/ReferenceTemplates/，共10个 .lh。模板内容为编辑器节点；ReferenceTemplates.ts 仅绑定导航和选择，不生成 UI。

角色入口仍打开原仓库；模式下一步打开原地图选择。个人信息有4个可切换页面。市场/邮件为展示模板，不执行交易或发放奖励。所有示例数值、战绩和联系人名称仅供布局展示。

人物卡片的 PortraitSlot/ReplaceablePortrait 和装扮 ReplaceableArtwork 是美术替换位置，当前使用已有占位图；商品/武器图片使用项目现有素材。

选中切换使用 pick:组:编号，相关内容命名 view:组:编号；跨页导航使用 go:页面名。Selected 节点是可编辑选中条。返回 go:lobby。

备份：archives/cunzhuang-before-page-templates.ls。
