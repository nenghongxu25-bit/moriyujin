import type { InventorySlotItem } from "./InventoryTypes";

export class SaveManager {
    public loadInventory(storageKey: string): InventorySlotItem[] {
        const storage = this.getStorage();
        const raw = storage.getItem(storageKey);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as Array<InventorySlotItem>;
        if (!Array.isArray(parsed)) {
            throw new Error(`Inventory storage "${storageKey}" is invalid.`);
        }

        const next: InventorySlotItem[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            if (!item) {
                next.push(null);
                continue;
            }

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

    public saveInventory(storageKey: string, source: InventorySlotItem[]): void {
        const storage = this.getStorage();
        const payload = Array.isArray(source)
            ? source.map((item) =>
                  item
                      ? {
                            itemId: item.itemId,
                            name: item.name,
                            count: item.count,
                            icon: item.icon,
                        }
                      : null,
              )
            : [];
        storage.setItem(storageKey, JSON.stringify(payload));
    }

    public loadJson<T>(storageKey: string): T | null {
        const storage = this.getStorage();
        const raw = storage.getItem(storageKey);
        if (!raw) {
            return null;
        }

        return JSON.parse(raw) as T;
    }

    public saveJson(storageKey: string, value: unknown): void {
        const storage = this.getStorage();
        storage.setItem(storageKey, JSON.stringify(value));
    }

    private getStorage(): Storage {
        const scope = globalThis as any;
        if (!scope || !scope.localStorage) {
            throw new Error("localStorage is unavailable.");
        }

        return scope.localStorage as Storage;
    }
}
