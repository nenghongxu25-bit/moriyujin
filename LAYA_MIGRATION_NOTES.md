# LayaAir Migration Notes

This file records the current Godot project structure in one place so it can be rebuilt in another project, especially LayaAir.

## Project Summary

- Project type: 2D UI-heavy game/project
- Main flow:
  - `menu.tscn` -> `main_map.tscn` or `qinghuai_map.tscn`
  - Pages open as overlay panels:
    - `team_page.tscn`
    - `inventory_page.tscn`
    - `formation_page.tscn`
    - `character_page.tscn`
  - `battle_page.tscn` is a separate combat UI scene
- Core content style:
  - Button-driven menus
  - Panel overlays
  - Attribute/configuration screens
  - Map node selection screens

## Shared Assets

### Images

- `picture/actor/player.png`
- `picture/qingpingshan.png`
- `picture/baiyangzhuang.png`
- `picture/zhaoyangfu.png`
- `picture/qinghuaizong.png`
- `picture/fengqiaozhen.png`
- `picture/liujindu.png`
- `picture/黄土集.png`
- `picture/item/qinghuai.png`

### Audio

- `sound/bfx/gun/huigun.mp3`
- `sound/bfx/quantou/2lianquan.mp3`
- `sound/bfx/quantou/quanji.mp3`
- `sound/bfx/jian/4lianjianji.mp3`
- `sound/bfx/jian/jian.mp3`

## Scene Inventory

## `menu.tscn`

- Script: `menu.gd`
- Root node: `MenuRoot` (`Control`)
- Main nodes:
  - `Backdrop` (`ColorRect`)
  - `GlowLeft` (`TextureRect`)
  - `GlowRight` (`TextureRect`)
  - `MainPanel` (`PanelContainer`)
  - `MainPanel/MarginContainer`
  - `MainPanel/MarginContainer/Content`
  - `MainPanel/MarginContainer/Content/TitleBlock`
  - `Title`
  - `Subtitle`
  - `Divider`
  - `Actions`
  - `StartButton`
  - `SettingsButton`
  - `QuitButton`
  - `AnimationPlayer`
- Script behavior:
  - Sets the window title to the project name
  - Fades the menu in on ready
  - Sets button labels
  - Stores glow image base positions
  - Connects button events
  - Animates left/right glow textures in `_process`
  - `StartButton` changes scene to `main_map.tscn`
  - `SettingsButton` currently only prints a placeholder
  - `QuitButton` exits the game

## `main_map.tscn`

- Script: `main_map.gd`
- Root node: `MainMapRoot` (`Control`)
- Main nodes:
  - `Backdrop` (`ColorRect`)
  - `GlowLeft` (`TextureRect`)
  - `GlowRight` (`TextureRect`)
  - `MainPanel` (`PanelContainer`)
  - `MainPanel/MarginContainer/Content`
  - `TitleBlock`
  - `MapSection`
  - `MapGrid` (`GridContainer`)
  - `RegionBox_0` through `RegionBox_8` (`Button`)
  - `DrawerButton`
  - `DrawerPanel`
  - `DrawerPanel/MarginContainer2/DrawerStack`
  - `PartyButton`
  - `BagButton`
  - `MapButton`
  - `FactionButton`
  - `FormationButton`
- Script behavior:
  - Connects drawer buttons
  - Instantiates and hides:
    - `team_page.tscn`
    - `inventory_page.tscn`
    - `formation_page.tscn`
  - Listens for `close_requested` from overlay pages
  - Locates map buttons by node name:
    - `RegionBox_0`
    - `Location_0`
    - `RegionBox_4`
    - `Location_4`
  - Opens map-connected scenes:
    - `RegionBox_0` / `Location_0` -> `next_scene_path`
    - `RegionBox_4` / `Location_4` -> `fengqiao_scene_path`
  - Handles drawer open/close animation
  - Repositions drawer and drawer button on resize

## `qinghuai_map.tscn`

- Script: `main_map.gd`
- Root node: `MainMapRoot` (`Control`)
- Main nodes:
  - `Backdrop`
  - `GlowLeft`
  - `GlowRight`
  - `MainPanel`
  - `MapSection`
  - `MapGrid`
  - `Location_0` through `Location_6`
  - `DrawerButton`
  - `DrawerPanel`
  - `PartyButton`
  - `BagButton`
  - `MapButton`
  - `FactionButton`
  - `FormationButton`
- Script behavior:
  - Same code as `main_map.tscn`
  - Scene uses `Location_x` button names instead of `RegionBox_x`
  - Acts as a parallel map variant with the same drawer and page overlay logic

## `fengqiao_map.tscn`

- Script: `fengqiao_map.gd`
- Root node: `FengqiaoMap` (`Control`)
- Main nodes:
  - `Backdrop` (`ColorRect`)
  - `MainPanel` (`PanelContainer`)
  - `MainPanel/MarginContainer/RootVBox`
  - `Header`
  - `BackButton`
  - `Title`
  - `Spacer`
  - `SubTitle`
  - `RegionGrid`
  - `ShopPanel`
  - `DrawerButton`
  - `DrawerPanel`
  - `DrawerPanel/DrawerMargin/DrawerStack`
  - `PartyButton`
  - `BagButton`
  - `MapButton`
  - `FactionButton`
  - `FormationButton`
- Script behavior:
  - Builds region cards with custom button styles
  - Routes region button clicks
  - Shows `ShopPanel` when `枫桥药铺` is selected
  - Hides `ShopPanel` for other regions
  - Instantiates and overlays:
    - `team_page.tscn`
    - `inventory_page.tscn`
    - `formation_page.tscn`
  - Handles drawer open/close and repositioning
  - `BackButton` returns to `back_scene_path` (`qinghuai_map.tscn` by default)

## `team_page.tscn`

- Script: `team_page.gd`
- Root node: `TeamPageRoot` (`Control`)
- Main nodes:
  - `Shade`
  - `ContentPanel`
  - `ContentPanel/MarginContainer`
  - `ContentPanel/MarginContainer/Layout`
  - `Header`
  - `Title`
  - `CloseButton`
  - `ScrollContainer`
  - `CardList`
  - `Card_0` through `Card_3`
  - Each card contains:
    - `CardMargin`
    - `Row`
    - `Avatar` on card 0
    - `CardLayout`
    - `Name`
    - `Line1`
    - `Line2`
- Script behavior:
  - Opens on top of the current page as an overlay
  - Closes through `close_requested`
  - Instantiates `character_page.tscn`
  - For each card:
    - Clicking the card opens character detail
    - Reads `Name` label if present
    - Reads `Avatar` texture if present
  - Passes selected name and avatar into `character_page.set_character_data(...)`

## `character_page.tscn`

- Script: `character_page.gd`
- Root node: `CharacterPageRoot` (`Control`)
- Main nodes:
  - `Shade`
  - `ContentPanel`
  - `ContentPanel/MarginContainer`
  - `ContentPanel/MarginContainer/Layout`
  - `Header`
  - `Title`
  - `CloseButton`
  - `ScrollContainer`
  - `Body`
  - `TopRow`
  - `AvatarCard`
  - `AvatarImage`
  - `EquipmentCard`
  - `EquipmentGrid`
  - `KungfuCard`
  - `KungfuGrid`
  - `MiddleRow`
  - `RightColumn`
  - `IntroCard`
  - `IntroText`
  - `InfoCard`
  - `AttributeCard`
  - `BasicAttributeGrid`
  - `BattleAttributeGrid`
  - `EquipmentDetailCard`
- Script behavior:
  - Large character detail page with:
    - Avatar display
    - Intro text
    - Basic attributes
    - Battle attributes
    - Kungfu slots
    - Equipment slots
    - Equipment detail panel
  - `set_character_data(character_name, avatar_texture)`:
    - Updates title and intro
    - Updates avatar
    - Resets config if the character changed
  - Builds styles for slot buttons and list buttons
  - Builds kungfu and equipment dropdown slots
  - Builds basic attribute controls:
    - free attribute points
    - `+`
    - confirm
    - cancel
    - reset
  - Builds attribute section layout and toggle visibility
  - Updates derived combat values from base attributes
  - Shows equipment detail when an equipment slot is selected
  - Emits `close_requested` on close

### Character Page Function Groups

- `_ready()`
  - Initializes panel size and close button
  - Builds styles and all UI sub-sections
  - Initializes labels and default character data
- `_build_styles()`
  - Creates slot and list style boxes
- `_build_config_sections()`
  - Creates kungfu and equipment slot buttons
  - Builds dropdown popups for each slot
- `_build_basic_attribute_controls()`
  - Adds free-point counter and attribute action buttons
- `_reflow_attribute_section()`
  - Reorganizes the attribute section into a header row plus two columns
- `_refresh_attribute_ui()`
  - Recomputes displayed combat values
- `_refresh_config_ui()`
  - Syncs button labels with selected kungfu/equipment
- `_on_basic_attribute_plus_pressed()`
  - Spends a free point into a temporary pending pool
- `_on_basic_attribute_confirm_pressed()`
  - Commits pending points to the base stat
- `_on_basic_attribute_cancel_pressed()`
  - Returns pending points to the free pool
- `_on_reset_attribute_points_pressed()`
  - Restores the default attribute state
- `_toggle_dropdown()`
  - Shows or hides slot option popups
- `_show_equipment_detail()`
  - Fills the equipment detail card

## `inventory_page.tscn`

- Script: `inventory_page.gd`
- Root node: `InventoryPage` (`Control`)
- Main nodes:
  - `Backdrop`
  - `Window`
  - `Window/MarginContainer`
  - `MainVBox`
  - `Header`
  - `Title`
  - `CloseButton`
  - `FilterRow`
  - `AllButton`
  - `JunkButton`
  - `EquipButton`
  - `SkillButton`
  - `StatusRow`
  - `ScrollContainer`
  - `SlotGrid`
- Script behavior:
  - Populates a 300-slot inventory grid
  - Provides category filters:
    - all
    - junk
    - equipment
    - skill
  - Updates slot labels according to the active filter
  - Makes the scroll area respond to mouse wheel input
  - Emits `close_requested` and hides the page on close

## `formation_page.tscn`

- Script: `formation_page.gd`
- Root node: `FormationPageRoot` (`Control`)
- Main nodes:
  - `Shade`
  - `ContentPanel`
  - `MarginContainer`
  - `RootVBox`
  - `Header`
  - `Title`
  - `CloseButton`
  - `StatusLabel`
  - `Body`
  - `BoardColumn`
  - `BoardCard`
  - `BoardGrid`
  - `RoleColumn`
  - `RoleScroll`
  - `RoleList`
- Script behavior:
  - Manages a 4x4 deployment board
  - Maintains role selection state
  - Builds role cards for:
    - `青槐`
    - `白杨`
    - `昭阳`
    - `黄土`
  - Lets the user:
    - select a role
    - place it on a board slot
    - replace or move by reselecting role/slot logic
  - Displays status text for feedback
  - Emits `close_requested` on close

## `battle_page.tscn`

- Script: `battle_page.gd`
- Root node: `BattlePageRoot` (`Control`)
- Main nodes:
  - `Shade`
  - `ContentPanel`
  - `MarginContainer`
  - `RootVBox`
  - `Body`
  - `PlayerColumn`
  - `PlayerCard`
  - `PlayerGrid`
  - Multiple `Cell_*` nodes under player grid
  - Additional combat UI sections continue below the top-level nodes
- Script behavior:
  - Currently minimal
  - Sets `mouse_filter` to stop input propagation
  - `close_requested` signal is declared but not yet used in the script

## Script-to-Scene Mapping

- `menu.gd` -> `menu.tscn`
- `main_map.gd` -> `main_map.tscn`
- `main_map.gd` -> `qinghuai_map.tscn`
- `fengqiao_map.gd` -> `fengqiao_map.tscn`
- `team_page.gd` -> `team_page.tscn`
- `character_page.gd` -> `character_page.tscn`
- `inventory_page.gd` -> `inventory_page.tscn`
- `formation_page.gd` -> `formation_page.tscn`
- `battle_page.gd` -> `battle_page.tscn`

## Migration Notes for LayaAir

- Reuse directly:
  - images
  - audio
  - numeric data
  - text content
- Rebuild manually:
  - all `.tscn` layouts
  - all `.gd` scripts
  - signal wiring
  - overlay/popup management
- Good migration order:
  1. `menu`
  2. `main_map` / `qinghuai_map`
  3. `fengqiao_map`
  4. `team_page`
  5. `inventory_page`
  6. `formation_page`
  7. `character_page`
  8. `battle_page`

## Implementation Notes

- The project is UI-centric, so the LayaAir port is mostly a scene rebuild plus TypeScript logic rewrite.
- The map scenes use different button naming conventions:
  - `main_map.tscn`: `RegionBox_*`
  - `qinghuai_map.tscn`: `Location_*`
- `character_page.gd` is the largest and most stateful script.
- `main_map.gd` and `fengqiao_map.gd` both manage the same auxiliary overlay pages.
- `team_page.gd` opens `character_page.tscn` as a nested overlay.

