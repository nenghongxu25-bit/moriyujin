# Visual night lighting

The city scene keeps its existing cached `nightlayer`, `circle_cutout`
(`destinationOut`), and `vision_glow` sprites. UI stays in the separate `UILayer`.
Core, scatter, and ambient alpha are baked together; no runtime lights or shadows
are used, and no extra sprites or per-frame textures are created.

Edit `night-vision-settings.json`, then run from the project directory:

```powershell
& '../.tools/node-v24.21.0-win-x64/node.exe' tools/bake-night-vision-mask.cjs
```

Restart the scene preview after the editor imports the textures.

| Parameter | Meaning |
| --- | --- |
| coreLength / outerLength | Forward reach in world pixels, including the fade to zero |
| coreWidth / outerWidth | Full transverse envelope in world pixels; visible center is narrower |
| coreFalloffPower | Core distance attenuation exponent: 1 is the original falloff; 0.7 keeps the middle brighter while fading to zero at coreLength |
| edgeSoftness | Side feather fraction, 0–1 (minimum effective feather 0.05) |
| ambientRadius | Ambient reach in world pixels |
| ambientSoftness | Ambient feather fraction, 0–1 (minimum effective feather 0.05) |
| intensity | Core darkness removal, 0–1 |
| coreGain | Multiplier applied to core alpha before composition, capped at 1; 2 doubles unsaturated core contribution, not the final scene luminance |
| outerIntensity / ambientIntensity | Independent scatter and ambient darkness removal, 0–1 |
| glowIntensity | Small white overlay contribution; set to zero to disable |
| worldSize | Must match both existing light sprites' width and height |
| textureSize | Baked square texture resolution; default 512 |

These are offline parameters, not live inspector sliders. The existing
`DynamicCutoutProbe` component exposes `directionSmoothTime` (0.045 seconds) and
`positionSmoothTime` (0 seconds by default) in the inspector. Zero disables the respective
smoothing. Teleports over 160 world pixels snap immediately. Angles take the
shortest path through ±180 degrees. No idle wobble is added.

Position smoothing is disabled in the city scene so moving the player translates
the complete cached light layer without changing the cutout inside it. Direction
smoothing remains enabled. `setSelfBounds` fixes the cache extent to a conservative
rectangle containing the background and both light sprites at every rotation;
rotation still updates the cached image, but no longer changes its texture size.
Bounds are recomputed only into reused rectangles and applied only when dimensions
change. Re-enabling position smoothing reserves an additional 160-pixel margin.

Backup before this change: `../../backups/night-lighting-20260917-101431`.
To revert only this work, restore `assets/scenes/city.ls`,
`src/debug/DynamicCutoutProbe.ts`, `tools/bake-night-vision-mask.cjs`, and both
`assets/atlas/picture/night-vision-{soft,glow}.png` files from that backup.
