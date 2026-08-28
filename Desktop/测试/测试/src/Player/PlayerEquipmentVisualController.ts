import type { PlayerController } from "./PlayerController";
import { DataManager, type EquipmentSlotType } from "../systems/datamanager";

export class PlayerEquipmentVisualController {
    private lastWeaponVisualSignature: string = "__init";
    private equipmentVisualInitAttempts: number = 0;
    private readonly lastEquipmentIconUrls: Record<EquipmentSlotType, string> = {
        insertPlate: "",
        helmet: "",
        weapon: "",
        armor: "",
    };
    private readonly lastEquipmentAttachmentNames: Record<EquipmentSlotType, string> = {
        insertPlate: "",
        helmet: "",
        weapon: "__init",
        armor: "",
    };

    constructor(private controller: PlayerController) {
    }

    public onDestroy(): void {
        Laya.timer.clear(this, this.tryInitializeEquipmentVisuals);
    }

    public syncWeaponSpineSlot(force: boolean = false): boolean {
        const activeSlotName = this.resolveActiveWeaponSpineSlotName();
        const meleeSlotName = String(this.controller.weaponMeleeSpineSlotName || "").trim();
        const rangedSlotName = String(this.controller.weaponRangedSpineSlotName || "").trim();
        const visualSignature = this.resolveWeaponVisualSignature(activeSlotName);
        const shouldForce = force || visualSignature !== this.lastWeaponVisualSignature;

        if (shouldForce) {
            let cleared = true;
            if (meleeSlotName) {
                cleared = this.clearSpineSlotAttachment(meleeSlotName) && cleared;
            }
            if (rangedSlotName) {
                cleared = this.clearSpineSlotAttachment(rangedSlotName) && cleared;
            }
            if (!cleared) {
                return false;
            }
        }

        if (this.syncEquipmentSpineSlot("weapon", activeSlotName, shouldForce)) {
            this.lastWeaponVisualSignature = visualSignature;
            return true;
        }

        return false;
    }

    public syncEquipmentSpineSlots(force: boolean = false): boolean {
        let success = true;
        success = this.syncEquipmentSpineSlot("insertPlate", this.controller.insertPlateSpineSlotName, force) && success;
        success = this.syncEquipmentSpineSlot("helmet", this.controller.helmetSpineSlotName, force) && success;
        success = this.syncWeaponSpineSlot(force) && success;
        success = this.syncEquipmentSpineSlot("armor", this.controller.armorSpineSlotName, force) && success;
        return success;
    }

    public refreshFromData(): void {
        this.lastWeaponVisualSignature = "__force";
        this.controller.invalidateEquipmentStats();
        this.controller.syncEquipmentStats();
        this.scheduleInitialization();
    }

    public refreshVisualsFromData(): boolean {
        return this.syncEquipmentSpineSlots(true);
    }

    public scheduleInitialization(): void {
        Laya.timer.clear(this, this.tryInitializeEquipmentVisuals);
        this.equipmentVisualInitAttempts = 0;
        this.tryInitializeEquipmentVisuals();
    }

    public isEquippedRangedWeapon(): boolean {
        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        if (!weapon || !weapon.itemId) {
            return false;
        }

        const meta = DataManager.getInstance().resolveItemMeta(weapon.itemId);
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        return subCategory.includes("ranged");
    }

    public snapshot(): Record<string, any> {
        return {
            lastWeaponVisualSignature: this.lastWeaponVisualSignature,
            equipmentVisualInitAttempts: this.equipmentVisualInitAttempts,
            lastEquipmentIconUrls: { ...this.lastEquipmentIconUrls },
            lastEquipmentAttachmentNames: { ...this.lastEquipmentAttachmentNames },
        };
    }

    private syncEquipmentSpineSlot(slot: EquipmentSlotType, spineSlotName: string, force: boolean): boolean {
        const slotName = String(spineSlotName || "").trim();
        if (!slotName) {
            return true;
        }

        const attachmentName = this.resolveEquippedAttachmentName(slot);
        if (!attachmentName) {
            if (force || this.lastEquipmentAttachmentNames[slot]) {
                if (this.clearSpineSlotAttachment(slotName)) {
                    this.lastEquipmentAttachmentNames[slot] = "";
                    this.lastEquipmentIconUrls[slot] = "";
                    return true;
                }
                return false;
            }
            return true;
        }

        if (!force && attachmentName === this.lastEquipmentAttachmentNames[slot]) {
            return true;
        }

        if (this.applySpineSlotAttachment(slotName, attachmentName)) {
            this.lastEquipmentAttachmentNames[slot] = attachmentName;
            this.lastEquipmentIconUrls[slot] = this.resolveEquippedItemIconUrl(slot);
            return true;
        }

        return false;
    }

    private tryInitializeEquipmentVisuals = (): void => {
        this.equipmentVisualInitAttempts += 1;
        if (this.refreshVisualsFromData()) {
            return;
        }

        if (this.equipmentVisualInitAttempts < 20) {
            Laya.timer.once(50, this, this.tryInitializeEquipmentVisuals);
        }
    };

    private resolveEquippedItemIconUrl(slot: EquipmentSlotType): string {
        const item = DataManager.getInstance().getEquippedItem(slot);
        if (!item || !item.icon) {
            return "";
        }

        return this.resolveAssetUrl(item.icon);
    }

    private resolveEquippedAttachmentName(slot: EquipmentSlotType): string {
        const item = DataManager.getInstance().getEquippedItem(slot);
        if (!item) {
            return "";
        }

        if (slot === "weapon") {
            return this.resolveWeaponAttachmentName(item.itemId);
        }

        if (slot === "armor") {
            return "cloth";
        }

        return "";
    }

    private resolveWeaponAttachmentName(itemId: string): string {
        const map: Record<string, string> = {
            wood_club: "weapon_slot7",
            baseket_bat: "basekat_bat",
            cleaver: "weapon_slot",
            knife: "weapon_slot2",
            long_knife: "weapon_slot5",
            machete: "weapon_slot6",
            fal: "weapon_ranged_FAL",
            m16: "weapon_ranged_M16",
            geluoke: "weapon_ranged_geluoke",
            akm: "weapon_ranged_AK47",
        };

        return map[itemId] || "";
    }

    private resolveActiveWeaponSpineSlotName(): string {
        if (this.isEquippedRangedWeapon()) {
            return String(this.controller.weaponRangedSpineSlotName || this.controller.weaponSpineSlotName || "").trim();
        }

        return String(this.controller.weaponMeleeSpineSlotName || this.controller.weaponSpineSlotName || "").trim();
    }

    private resolveWeaponVisualSignature(activeSlotName: string): string {
        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        const itemId = weapon?.itemId || "";
        const attachmentName = itemId ? this.resolveWeaponAttachmentName(itemId) : "";
        const ranged = this.isEquippedRangedWeapon() ? "ranged" : "melee";
        return [
            ranged,
            itemId,
            attachmentName,
            activeSlotName,
            String(this.controller.weaponMeleeSpineSlotName || "").trim(),
            String(this.controller.weaponRangedSpineSlotName || "").trim(),
        ].join("|");
    }

    private applySpineSlotAttachment(slotName: string, attachmentName: string | null): boolean {
        const spine = this.controller.spineNode ? this.controller.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
        if (!spine) {
            return false;
        }

        const anySpine = spine as any;
        if (typeof anySpine.setSlotAttachment === "function") {
            try {
                anySpine.setSlotAttachment(slotName, attachmentName);
                return true;
            } catch (error) {
                return false;
            }
        }

        if (typeof anySpine.setAttachment === "function") {
            try {
                anySpine.setAttachment(slotName, attachmentName);
                return true;
            } catch (error) {
                return false;
            }
        }

        return false;
    }

    private clearSpineSlotAttachment(slotName: string): boolean {
        const spine = this.controller.spineNode ? this.controller.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
        if (!spine) {
            return false;
        }

        const anySpine = spine as any;
        let cleared = false;

        if (this.applySpineSlotAttachment(slotName, null)) {
            cleared = true;
        }

        if (typeof anySpine.setSlotAttachment === "function") {
            try {
                anySpine.setSlotAttachment(slotName, "");
                cleared = true;
            } catch (error) {
            }
        }

        try {
            const slot = typeof anySpine.findSlot === "function" ? anySpine.findSlot(slotName) : null;
            if (slot && typeof slot.setAttachment === "function") {
                slot.setAttachment(null);
                cleared = true;
            }
        } catch (error) {
        }

        return cleared;
    }

    private resolveAssetUrl(path: string): string {
        const normalized = String(path || "").trim().replace(/^assets\//, "");
        if (!normalized) {
            return "";
        }

        const url = (Laya as any).URL;
        if (url && typeof url.formatURL === "function") {
            return String(url.formatURL(normalized) || normalized);
        }

        return normalized;
    }
}