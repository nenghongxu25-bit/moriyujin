# LayaAir Project Structure

This structure is designed for a LayaAir project where scenes, UI, prefabs, Spine, and atlases are built visually in the editor, while TypeScript only handles behavior and game flow.

## Principles

- `assets/` stores editor-created content and imported resources.
- `src/` stores code only.
- Scenes and UI are not rebuilt in code unless you need dynamic runtime generation.
- Game flow is separated from entity behavior.
- Shared logic is extracted only after it is truly repeated.

## Recommended Layout

```text
assets/
├── scenes/                     # .ls scene files created in the editor
├── prefabs/                    # .lh prefabs
├── ui/                         # UI prefabs or scene files
├── spine/                      # Spine assets
├── atlas/                      # Atlas / texture resources
├── resources/                  # Data resources used by the game
└── config/                     # Optional JSON config exported for runtime

src/
├── core/                       # Framework-level code
│   ├── EventManager.ts
│   ├── Singleton.ts
│   ├── StateMachine.ts
│   └── ObjectPool.ts
│
├── game/                       # Overall game flow
│   ├── GameManager.ts          # Base -> Raid -> Base
│   ├── GamePhase.ts            # Game phase enum
│   ├── BaseSession.ts          # Base-side session logic
│   └── RaidSession.ts          # Raid-side session logic
│
├── systems/                    # Global systems / singletons
│   ├── DataManager.ts          # Loads config and provides query APIs
│   ├── SaveManager.ts          # Save/load
│   ├── UIManager.ts            # Open/close panels
│   ├── AudioManager.ts         # Sound effects / music
│   └── CombatManager.ts        # Damage calculation and combat result
│
├── domain/                     # Gameplay domain logic
│   ├── inventory/
│   │   ├── InventoryModel.ts
│   │   ├── InventoryManager.ts
│   │   └── StorageService.ts
│   │
│   ├── crafting/
│   │   ├── CraftingModel.ts
│   │   ├── CraftingManager.ts
│   │   └── RecipeService.ts
│   │
│   ├── base/
│   │   ├── BaseModel.ts
│   │   ├── BuildingManager.ts
│   │   └── BaseConstructionService.ts
│   │
│   ├── raid/
│   │   ├── RaidModel.ts
│   │   ├── RaidManager.ts
│   │   ├── SpawnManager.ts
│   │   └── ExtractionService.ts
│   │
│   └── combat/
│       ├── HitResult.ts
│       ├── DamageCalculator.ts
│       └── CombatRules.ts
│
├── entities/                   # Scripts mounted on nodes
│   ├── actor/
│   │   ├── BaseActor.ts
│   │   ├── player/
│   │   │   ├── PlayerController.ts
│   │   │   ├── PlayerCombat.ts
│   │   │   └── PlayerAnim.ts
│   │   └── monster/
│   │       ├── ZombieController.ts
│   │       ├── BanditController.ts
│   │       └── MonsterSensor.ts
│   │
│   ├── item/
│   │   ├── PickupItem.ts
│   │   ├── Container.ts
│   │   └── DropItem.ts
│   │
│   └── building/
│       ├── BaseBuilding.ts
│       ├── Warehouse.ts
│       └── ProductionBuilding.ts
│
├── ui/                         # UI behavior scripts only
│   ├── BaseUI.ts
│   ├── UIMainHUD.ts
│   ├── UIInventory.ts
│   ├── UIContainer.ts
│   ├── UICrafting.ts
│   ├── UIBuildingSelect.ts
│   └── UIRaidResult.ts
│
├── scenes/                     # Scene lifecycle scripts
│   ├── BaseScene.ts
│   ├── HomeScene.ts
│   └── RaidScene.ts
│
├── data/                       # Type definitions and runtime data helpers
│   ├── interfaces/
│   │   ├── IItemData.ts
│   │   ├── IBuildingData.ts
│   │   ├── IMonsterData.ts
│   │   ├── IMapData.ts
│   │   └── IPlayerStats.ts
│   └── configs/
│       ├── items.json
│       ├── buildings.json
│       ├── monsters.json
│       └── maps.json
│
└── utils/
    ├── MathUtils.ts
    ├── GridUtils.ts
    └── SaveUtils.ts
```

## How The Game Loop Fits

### Base Phase

- Player enters the base scene.
- `HomeScene` loads.
- `UIManager` opens base-related UI.
- `BuildingManager` handles construction and production.
- `InventoryManager` handles warehouse access.
- Player can craft, store, and withdraw items.

### Raid Phase

- Player chooses a map.
- `GameManager` switches to raid phase.
- `RaidScene` loads the map.
- `SpawnManager` creates enemies, loot, and containers.
- Player fights enemies, gathers materials, and loots containers.
- Player stores items in backpack during the raid.
- Player reaches extraction point.
- `RaidManager` settles the run and returns results.

### Return To Base

- Raid rewards are converted into persistent inventory or progress.
- `SaveManager` stores changes if needed.
- `GameManager` switches back to base phase.

## Where Existing LayaAir Resources Belong

- `.ls` scene files stay in `assets/scenes/`
- `.lh` prefabs stay in `assets/prefabs/`
- UI prefabs or UI scenes stay in `assets/ui/`
- Spine files stay in `assets/spine/`
- Atlases stay in `assets/atlas/`

## Folder Responsibilities

### `core/`

Reusable technical foundation. No game-specific logic.

### `systems/`

Global singleton services used across the whole game.

### `domain/`

Actual gameplay rules and state. This is where most of your business logic should live.

### `entities/`

Scripts attached to scene nodes and prefabs. They read editor-assigned references and call into `domain/` or `systems/`.

### `scenes/`

Scene entry scripts that react to loading and unloading.

### `ui/`

Only UI behavior and UI event binding. Visual layout remains in the editor.

### `data/`

Interfaces and config loading contracts.

### `utils/`

Pure helper functions that do not depend on game state.

## Migration Strategy

If you already have working code in `src/zombie-1/`, migrate in this order:

1. Keep the current prefab and scene layout unchanged.
2. Move zombie-specific logic into `entities/actor/monster/`.
3. Move reusable behavior into `core/` only when it is shared by at least two systems or entities.
4. Add `RaidScene` and `HomeScene` scripts after the flow is stable.
5. Move inventory, crafting, and building logic into `domain/`.

## Practical Rule

If something is created or positioned in the LayaAir editor, it should usually stay in `assets/`.
If something decides what happens in the game, it should live in `src/`.
