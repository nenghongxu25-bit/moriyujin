# 动物帧动画试样

## 交付

- 项目帧目录：`assets/animation/animals-preview/{young-boar,wolf}/{walk,run,attack}/`
- 每只动物：走路8帧（8fps）、跑步8帧（12fps）、攻击6帧（10fps）。总计44张独立PNG及6份animation.json。
- 小野猪每帧160×160；狼每帧224×224。画布包含透明余量，主体不是拉伸成正方形。
- 高清源图：`art-library/images/animals-animation-hd/`，6张动作图集。
- 可播放预览：`art-library/previews/animals-animation/`，6个*.apng.png。用支持APNG的浏览器打开。攻击预览会重复并暂停在末帧以便观察，animation.json标记实际攻击不循环。
- 方向：朝左，保留原静态立绘的三分之二侧视方向。没有生成正背面或八方向。
- 小野猪攻击为低头前顶；狼攻击为前扑张嘴咬击。
- 未改场景、Prefab、角色代码或玩法；JSON为自定义帧清单，不是已经接好Laya动画组件的资源。

## 制作与验证

使用内置imagegen，每个动物/动作单独一次生成，共6次；以之前的高清立绘作为身份参考。没有使用CLI/API回退。

源图排版并非严格格子，因此按透明通道提取每个主体的连通区域，再按行列顺序排列，不直接等分裁切；外围游离噪点不带入帧。保留主体内像素纹理。每个动作使用固定缩放系数，X/Y等比，不对每帧单独缩放。不同动作按主体像素面积做近似尺寸归一，这不是经过精确骨架校准的角色比例。

水平按轮廓中心定位；走路/攻击按底部定位，跑步保留同一行内的腾空高度差。此对齐不等于真实骨盆追踪，仍可能有横向摆动或接地漂移。

验证内容：每张源图主体数量为预期6或8；44张帧的外边界透明；每个动作的PNG尺寸和格式一致；每套帧无完全重复图片；6个APNG的帧控制块数量、CRC和压缩图像载荷与原PNG一致。已抽看每套第4帧，未进行游戏运行时播放验收。

## 已知限制

生成式动作试样，不是最终动画：毛发、轮廓、四肢造型有帧间变化；走路步态尚不够自然；狼局部帧有红黄色边缘残色；攻击节奏、接地和循环衔接仍需视觉精修。不能仅凭PNG/APNG格式校验宣称动作自然连贯。不包含碰撞、命中时机、位移或镜像实现。

## 最终提示词

### young-boar/walk

Use case: precise-object-edit. Input image is the character identity reference. Create ONE production-style animation sprite sheet of THIS EXACT animal, matching its species, age, fur markings, body proportions, semi-realistic painted forest game style, and left-facing three-quarter side view. Do not redesign it. True transparent RGBA background, including gaps between legs. No ground, no shadows detached from body, no scenery, no labels, no frame numbers, no visible grid, no text, no additional animals. Critical: uniform cell size, each cell contains precisely ONE full animal with 12 percent transparent safety margins, no overlap between cells, fixed camera and zoom, consistent animal size and lighting, root/pelvis stays centered horizontally in every cell. Every frame anatomically correct with four legs, no extra limbs. EXACTLY 8 frames in 4 columns by 2 rows, read left-to-right then top-to-bottom. One full smooth in-place walking gait cycle. Frames 1-8 are 8 DISTINCT successive phases at 0,45,90,135,180,225,270,315 degrees of the gait: alternating front and rear limb contact, weight transfer, passing and lift. Slow walking with grounded footfalls, small body bob, no jumping. Keep feet contact on exactly the same horizontal ground baseline within each cell. Frame8 naturally transitions back to frame1 without a duplicate endpoint.

### young-boar/run

Use case: precise-object-edit. Input image is the character identity reference. Create ONE production-style animation sprite sheet of THIS EXACT animal, matching its species, age, fur markings, body proportions, semi-realistic painted forest game style, and left-facing three-quarter side view. Do not redesign it. True transparent RGBA background, including gaps between legs. No ground, no shadows detached from body, no scenery, no labels, no frame numbers, no visible grid, no text, no additional animals. Critical: uniform cell size, each cell contains precisely ONE full animal with 12 percent transparent safety margins, no overlap between cells, fixed camera and zoom, consistent animal size and lighting, root/pelvis stays centered horizontally in every cell. Every frame anatomically correct with four legs, no extra limbs. EXACTLY 8 frames in 4 columns by 2 rows, read left-to-right then top-to-bottom. One full smooth in-place running/galloping cycle, substantially different from walking: crouched gathering hindlegs, hindquarter push-off, airborne extended stride, forefoot landing, compression, rear legs swing through, gathered suspension, preparation for next push. Eight DISTINCT progressive poses, subtle body rise and fall; fixed pelvis horizontal center, ground-contact paws/hooves on common baseline. Frame8 naturally connects to frame1, no duplicate endpoint.

### young-boar/attack

Use case: precise-object-edit. Input image is the character identity reference. Create ONE production-style animation sprite sheet of THIS EXACT animal, matching its species, age, fur markings, body proportions, semi-realistic painted forest game style, and left-facing three-quarter side view. Do not redesign it. True transparent RGBA background, including gaps between legs. No ground, no shadows detached from body, no scenery, no labels, no frame numbers, no visible grid, no text, no additional animals. Critical: uniform cell size, each cell contains precisely ONE full animal with 12 percent transparent safety margins, no overlap between cells, fixed camera and zoom, consistent animal size and lighting, root/pelvis stays centered horizontally in every cell. Every frame anatomically correct with four legs, no extra limbs. EXACTLY 6 frames in 3 columns by 2 rows, read left-to-right then top-to-bottom. One attack sequence with 6 DISTINCT progressive poses: neutral ready, anticipatory weight shift, wind-up, attack extension, recoil, return to ready. No opponent, no blood, no effects. The small striped juvenile boar attacks with a lowered-head forward head-butt: lower snout, brace hindquarters, thrust head and shoulders forward, recoil, lift head back to ready. Do not grow adult tusks.

### wolf/walk

Use case: precise-object-edit. Input image is the character identity reference. Create ONE production-style animation sprite sheet of THIS EXACT animal, matching its species, age, fur markings, body proportions, semi-realistic painted forest game style, and left-facing three-quarter side view. Do not redesign it. True transparent RGBA background, including gaps between legs. No ground, no shadows detached from body, no scenery, no labels, no frame numbers, no visible grid, no text, no additional animals. Critical: uniform cell size, each cell contains precisely ONE full animal with 12 percent transparent safety margins, no overlap between cells, fixed camera and zoom, consistent animal size and lighting, root/pelvis stays centered horizontally in every cell. Every frame anatomically correct with four legs, no extra limbs. EXACTLY 8 frames in 4 columns by 2 rows, read left-to-right then top-to-bottom. One full smooth in-place walking gait cycle. Frames 1-8 are 8 DISTINCT successive phases at 0,45,90,135,180,225,270,315 degrees of the gait: alternating front and rear limb contact, weight transfer, passing and lift. Slow walking with grounded footfalls, small body bob, no jumping. Keep feet contact on exactly the same horizontal ground baseline within each cell. Frame8 naturally transitions back to frame1 without a duplicate endpoint.

### wolf/run

Use case: precise-object-edit. Input image is the character identity reference. Create ONE production-style animation sprite sheet of THIS EXACT animal, matching its species, age, fur markings, body proportions, semi-realistic painted forest game style, and left-facing three-quarter side view. Do not redesign it. True transparent RGBA background, including gaps between legs. No ground, no shadows detached from body, no scenery, no labels, no frame numbers, no visible grid, no text, no additional animals. Critical: uniform cell size, each cell contains precisely ONE full animal with 12 percent transparent safety margins, no overlap between cells, fixed camera and zoom, consistent animal size and lighting, root/pelvis stays centered horizontally in every cell. Every frame anatomically correct with four legs, no extra limbs. EXACTLY 8 frames in 4 columns by 2 rows, read left-to-right then top-to-bottom. One full smooth in-place running/galloping cycle, substantially different from walking: crouched gathering hindlegs, hindquarter push-off, airborne extended stride, forefoot landing, compression, rear legs swing through, gathered suspension, preparation for next push. Eight DISTINCT progressive poses, subtle body rise and fall; fixed pelvis horizontal center, ground-contact paws/hooves on common baseline. Frame8 naturally connects to frame1, no duplicate endpoint.

### wolf/attack

Use case: precise-object-edit. Input image is the character identity reference. Create ONE production-style animation sprite sheet of THIS EXACT animal, matching its species, age, fur markings, body proportions, semi-realistic painted forest game style, and left-facing three-quarter side view. Do not redesign it. True transparent RGBA background, including gaps between legs. No ground, no shadows detached from body, no scenery, no labels, no frame numbers, no visible grid, no text, no additional animals. Critical: uniform cell size, each cell contains precisely ONE full animal with 12 percent transparent safety margins, no overlap between cells, fixed camera and zoom, consistent animal size and lighting, root/pelvis stays centered horizontally in every cell. Every frame anatomically correct with four legs, no extra limbs. EXACTLY 6 frames in 3 columns by 2 rows, read left-to-right then top-to-bottom. One attack sequence with 6 DISTINCT progressive poses: neutral ready, anticipatory weight shift, wind-up, attack extension, recoil, return to ready. No opponent, no blood, no effects. This grey forest wolf attacks with a forward lunging bite: neutral, lower body and coil hind legs, open jaws and pull head back slightly, extend head and front body forward in snapping bite, jaws closing during recoil, return to neutral. Preserve normal wolf anatomy and the reference's facial appearance; no grotesque fangs.


