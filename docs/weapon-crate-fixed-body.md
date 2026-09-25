# 军用武器箱固定箱体修正

之前整帧配准仍留下第三帧箱体变宽的问题。本次从现有画稿中分离固定箱体、前侧板和箱盖，四帧使用相同箱体像素，箱盖沿同一铰链分别投影到 0°、18°、58°、90°。不再对整箱做逐帧缩放。

输出仍为 `assets/animation/container/loot-points-v1/weapon_crate/frame_00.png` 至 `frame_03.png`，512×512，原 UUID 和预制体尺寸不变。总览场景 `assets/scenes/loot-points-all.ls` 使用这些修正帧。

重建脚本：`tools/lock-weapon-crate-body.ps1`。运行时播放检查通过，55,341 次固定正面像素比较完全一致。此前的全批配准脚本会跳过此容器，避免覆盖专门修正。

修改前备份：`art/weapon-crate-before-fixed-body/`。本次只使用已有图稿分层与投影，没有新增绘图生成调用。
