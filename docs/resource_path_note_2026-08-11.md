# 2026-08-11 Resource Path Note

## Problem

Inventory icon loading failed when runtime UI code used `assets/atlas/...` as the image source.
The file existed on disk, but the UI loader expected a runtime resource path, not the editor-root-prefixed path.

## Resolution

- Use `atlas/...` in item configs and runtime fallback icons.
- Keep `assets/atlas/` as the physical storage location only.
- Normalize old values by stripping a leading `assets/` prefix before binding image sources.

## Affected Files

- `assets/config/items/materials.json`
- `assets/config/items/foods.json`
- `src/systems/datamanager.ts`
- `src/PlayUI/listTemplate.ts`

## Rule

If a path is going into `Image.src` or a similar runtime resource field, write it as a resource-relative path such as `atlas/picture/...`, not as an editor filesystem path such as `assets/atlas/picture/...`.
