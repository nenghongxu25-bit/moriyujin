export interface InventoryViewItem {
    state?: 'expanded' | 'folded';
    contents?: InventorySlotItem[];
    instanceId?: string;
    gridWidth?: number;
    gridHeight?: number;
    rotated?: boolean;
    gridVersion?: number;
    itemId?: string;
    name: string;
    count: number;
    icon?: string;
}

export type InventorySlotItem = InventoryViewItem | null;
export type WeaponLoadoutSlot = "weapon" | "pistol" | "secondary" | "melee";
export type EquipmentSlotType = "insertPlate" | "helmet" | "weapon" | "armor" | "pistol" | "secondary" | "melee" | "rig" | "backpack";

export interface EquippedItem extends InventoryViewItem {
    itemId: string;
}

export interface BagView {
    setItems(items: InventorySlotItem[]): void;
    refreshPlayerStats?(): void;
}

export interface QuickSlotView {
    refreshQuickSlots(items: InventorySlotItem[]): void;
}

export interface WarehouseView {
    refresh(): void;
}

export type InventoryScope = "base" | "instance";
export type InventoryBucket = "active" | "warehouse";
