# Spine bone rotation runtime experiment — 2026-09-19

Verified in LayaAir editor preview via MCP at 127.0.0.1:18188, scene assets/scenes/city.ls.
Actual renderer: SpineOptimizeRender2D. Player source: res://f87ec402-9dd0-4a49-90f0-2352581455dc.

Temporary probe obtained the live skeleton from the player's Spine2DRenderNode._spineRender.getSkeleton().
It disabled this renderer's animation cache and wrapped this instance's render method to modify bArmUR.rotation after animation application, before world transform calculation and rendering. Local rotation was restored after each render to avoid accumulation.
Both animation tracks remained idle/idle_ranged_firearm. No scene nodes or UI were created.

| Offset | Applied bArmUR rotation | fistR worldX | fistR worldY | Spine node rotation | External gun node rotation |
| --- | --- | --- | --- | --- | --- |
| 0 | -183.309999 | -449.678335 | 1066.481189 | 0 | 0 |
| +55 | -128.309999 | -425.642931 | 1061.277313 | 0 | 0 |
| -55 | -238.309999 | -459.201710 | 1089.154660 | 0 | 0 |
| restored 0 | -183.309999 | -449.678335 | 1066.481189 | 0 | 0 |

MCP screenshots spine-bone-baseline.png, spine-bone-plus55.png and spine-bone-minus55.png show arm pose changes while the external gun stays horizontal.

Conclusion: direct manipulation of a player Spine bone visibly works in this project's editor Web preview, alongside animation playback. A complete joystick aiming implementation still needs angle conversion, coordinated arms and gun attachment/following, and validation while walking, firing and flipping. ByteDance device behavior was not tested. The experimental integration used an internal renderer hook, not a verified stable cross-version API. Cache-on behavior was not tested.

Cleanup: probe hook and cache state restored; preview stopped (originally stopped); temporary TypeScript import, call, source and generated meta removed. Only diagnostic helper, screenshots and this report retained under .tmp.
