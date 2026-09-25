# 手电外围过渡加宽

备份：`D:/Desktop/测试/backups/flashlight-feather-20260917-131217`。

`tools/night-vision-settings.json` 的外围散射宽度 outerWidth 从 760 增至 1100，长度 outerLength 从 520 增至 610。核心长度、宽度、增益及外围强度均保持不变；房间遮挡羽化宽度、室内 alpha 0.25 不变。

运行 `tools/bake-night-vision-mask.cjs` 重新生成手电扣除与微弱光晕纹理。全局夜色和房间手电副本复用相同扣除纹理，因此同步生效。没有扩大场景 Sprite、缓存尺寸或增加光层。

校验：输出仍为 512×512，原来 alpha=255 的像素全部保持 255，纹理四边 alpha 全为 0。通过 MCP 重新运行场景检查预览。中心核心公式未变；核心外围与扩大散射相交的区域会更亮一些，这是更宽过渡的预期效果。
