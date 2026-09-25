# 森林动物立绘试样

内置 imagegen 逐张生成：小野猪幼崽和成年灰狼。透明底、完整全身、偏写实森林画风，单张静态立绘，未绑定骨骼或制作动画，未改场景和玩法。参考现有素材观察后编写风格描述，未上传参考图。

高清原图：`art-library/images/decorate/forest-new-preview-hd/forest-young-boar-v1.png` 和 `forest-wolf-v1.png`。

项目预览图：`assets/decorate/forest/new-preview/forest-young-boar-v1.png`（长边128）和 `forest-wolf-v1.png`（长边192）。使用同一X/Y系数等比缩小，整数画布余量不到1像素，透明通道验证通过。动物真实场景比例仍待摆放确认。

## 最终提示词

每张图片使用下面公共内容，加各自 Subject。

```
Use case: stylized-concept. Asset type: standalone full-body animal character illustration for a gritty temperate forest survival 2D game, matching semi-realistic hand-painted forest prop art with muted earth tones, textured weathered wood and mossy grey stones. Render as polished painterly game character art, detailed natural fur but not a studio photograph and not cartoon/chibi. One animal only, natural four-legged standing idle pose facing left in a three-quarter side view, slightly elevated camera looking down about 25 degrees. Anatomically correct, all four legs readable, full ears, muzzle and tail inside frame, no cropped extremities. Calm alert expression. Soft diffuse upper-left light, restrained dark contour, readable silhouette. Real transparent RGBA background including gaps between legs; no scenery, no ground patch, no pedestal, no halo, no shadow cloud, no baked checkerboard, no text, no watermark, no equipment, no clothing, no split panels or sprite sheet. Center full body with at least 8 percent transparent padding on every side. Subject: 
```

### young-boar

A small juvenile wild boar, compact rounded but natural body, short sturdy legs with cloven hooves, coarse warm dark-brown fur, faint tan longitudinal juvenile stripes on flanks, a short bristly mane, small pointed ears, dark eyes and earthy grey-brown snout. Young wild animal, NOT a pink domestic pig; no exaggerated tusks, no oversized cute eyes.

### wolf

An adult lean grey forest wolf with realistic wild canid proportions, thick layered grey-brown fur, dark charcoal saddle, lighter beige-grey muzzle and underside, amber eyes, upright pointed ears, long muzzle, four paws and bushy tail carried low. Alert but not snarling, mouth closed; NOT a husky, no blue eyes, not a fantasy monster.

