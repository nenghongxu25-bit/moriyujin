# Combat VFX sample pack

Transparent VFX prototypes generated on 2026-09-24. Rifle muzzle flash and tracer visuals are connected to the player ranged-fire path in `src/Player/PlayerRangedController.ts` and `assets/prefab/prefab_player.lh`. Grenade explosion, smoke release, and tear-gas release art remain prototypes.

- `rifle_muzzle_flash_sheet.png`: 512x512, 2x2 grid with four 256x256 frames. Runtime plays the individual `rifle_muzzle_flash_f00.png` through `f03.png` frames at the muzzle, oriented to shot direction.
- `tracer_round.png`: 512x128 transparent streak. Runtime rotates it to shot direction and spawns it from the muzzle end of the equipped weapon image. Player prefab scale is 0.16; tune per weapon/caliber if needed.
- `grenade_explosion_sheet.png`: 512x512, 2x2 grid with four 256x256 frames. Suggested one-shot duration is about 0.3-0.4 s.
- `smoke_release_sheet.png`: brief canister vent/bloom only. Use the particle cloud texture for lingering smoke.
- `tear_gas_release_sheet.png`: four muted yellow-gray release stages, not the lingering damage area.
- `smoke_particle_cloud.png`: 1254x1254 alpha texture for persistent smoke particles.
- `smoke-particle-presets.json`: starting ShurikenParticle2DRenderer parameter references for smoke and tear gas; these values are not yet imported as serialized Laya prefabs.

Individual cropped frames are in this folder. Original source sheets are preserved in `art/extraction-vfx-test-20260924/source/`. Static preview: `docs/combat-vfx-samples-20260924.html`.
- Runtime-loaded copies live at `assets/animation/effects/combat-vfx/` so Laya's image loader receives ordinary `.png` paths instead of atlas UUIDs.
