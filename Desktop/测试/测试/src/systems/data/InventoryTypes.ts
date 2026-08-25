export interface InventoryViewItem {
    itemId?: string;
    name: string;
    count: number;
    icon?: string;
}

export type InventorySlotItem = InventoryViewItem | null;
export type EquipmentSlotType = "insertPlate" | "helmet" | "weapon" | "armor";

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
