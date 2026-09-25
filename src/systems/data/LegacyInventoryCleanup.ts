import { SaveManager } from './SaveManager';

/** Remove retired content from saves, keeping the first pre-cleanup copy per slot. */
export function cleanLegacyInventorySaves(save: SaveManager, keep: (id: string) => boolean): number {
    const keys = ['laya_test_base_inventory_v1', 'laya_test_warehouse_inventory_v1',
        'laya_test_quick_slots_v1', 'laya_test_equipment_v1'];
    let removed = 0;
    for (const key of keys) {
        const original = save.loadJson<any>(key);
        if (!original || typeof original !== 'object') continue;
        let changed = false;
        const clean = (item: any) => {
            const id = typeof item === 'string' ? item : item?.itemId;
            if (item && (!id || !keep(id))) { changed = true; removed++; return null; }
            return item;
        };
        const next: any = Array.isArray(original) ? original.map(clean) : { ...original };
        if (!Array.isArray(original)) for (const slot of Object.keys(next)) next[slot] = clean(next[slot]);
        if (!changed) continue;
        const backupKey = key + '_before_retired_cleanup_20260921';
        if (save.loadJson(backupKey) === null) save.saveJson(backupKey, original);
        save.saveJson(key, next);
    }
    return removed;
}
