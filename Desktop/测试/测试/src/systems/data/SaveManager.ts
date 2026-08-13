import type { InventoryViewItem } from "./InventoryTypes";

export class SaveManager {
    public loadInventory(storageKey: string): InventoryViewItem[] {
        const storage = this.getStorage();
        const raw = storage.getItem(storageKey);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as Array<InventoryViewItem>;
        if (!Array.isArray(parsed)) {
            throw new Error(`Inventory storage "${storageKey}" is invalid.`);
        }

        const next: InventoryViewItem[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            const itemId = item && typeof item.itemId === "string" ? item.itemId : "";
            const name = item && typeof item.name === "string" ? item.name : "";
            const count = Number(item && item.count);
            const icon = item && typeof item.icon === "string" ? item.icon : undefined;
            if (!itemId) {
                throw new Error(`Inventory storage "${storageKey}" itemId is invalid at index ${i}.`);
            }
            if (!name) {
                throw new Error(`Inventory storage "${storageKey}" name is invalid for itemId ${itemId}.`);
            }
            if (!Number.isFinite(count) || count <= 0) {
                throw new Error(`Inventory storage "${storageKey}" count is invalid for itemId ${itemId}.`);
            }

            next.push({
                itemId,
                name,
                count: Math.floor(count),
                icon,
            });
        }

        return next;
    }

    public saveInventory(storageKey: string, source: Map<string, InventoryViewItem>): void {
        const storage = this.getStorage();
        const payload = Array.from(source.entries()).map(([itemId, item]) => ({
            itemId,
            name: item.name,
            count: item.count,
            icon: item.icon,
        }));
        storage.setItem(storageKey, JSON.stringify(payload));
    }

    private getStorage(): Storage {
        const scope = globalThis as any;
        if (!scope || !scope.localStorage) {
            throw new Error("localStorage is unavailable.");
        }

        return scope.localStorage as Storage;
    }
}