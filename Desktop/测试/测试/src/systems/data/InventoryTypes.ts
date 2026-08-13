export interface InventoryViewItem {
    itemId?: string;
    name: string;
    count: number;
    icon?: string;
}

export interface BagView {
    setItems(items: InventoryViewItem[]): void;
}

export type InventoryScope = "base" | "instance";
export type InventoryBucket = "active" | "warehouse";
