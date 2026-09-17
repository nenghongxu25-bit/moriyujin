import type { PlayerController } from "./PlayerController";
import { DataManager, type EquipmentSlotType } from "../systems/datamanager";

interface RangedWeaponVisualConfig {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    rotation?: number;
}

export class PlayerEquipmentVisualController {
    private static readonly RANGED_WEAPON_VISUALS: Record<string, RangedWeaponVisualConfig> = {
        akm: {
            src: "atlas/picture/items/weapons/rangeds/ak47.png",
            x: 59,
            y: -75,
            width: 128,
            height: 85,
            scaleX: -1.5,
            scaleY: 1.5,
        },
        fal: {
            src: "atlas/picture/items/weapons/rangeds/fal.png",
            x: -138,
            y: -79,
            width: 128,
            height: 85,
            scaleX: 1.5,
            scaleY: 1.5,
        },
        m16: {
            src: "atlas/picture/items/weapons/rangeds/m16.png",
            x: 55,
            y: -82,
            width: 128,
            height: 85,
            scaleX: -1.5,
            scaleY: 1.5,
        },
        geluoke: {
            src: "atlas/picture/items/weapons/rangeds/geluoke.png",
            x: -55,
            y: -50,
            width: 128,
            height: 128,
            scaleX: 0.5,
            scaleY: 0.5,
        },
    };

    private lastWeaponVisualSignature: string = "__init";
    private lastRangedWeaponImageSignature: string = "__init";
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
        const isRanged = this.isEquippedRangedWeapon();
        this.syncRangedWeaponImage(force);
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

        if (isRanged) {
            const slotName = rangedSlotName || activeSlotName;
            if (!slotName) {
                this.lastWeaponVisualSignature = visualSignature;
                this.lastEquipmentAttachmentNames.weapon = "";
                this.lastEquipmentIconUrls.weapon = "";
                return true;
            }

            if (this.clearSpineSlotAttachment(slotName)) {
                this.lastWeaponVisualSignature = visualSignature;
                this.lastEquipmentAttachmentNames.weapon = "";
                this.lastEquipmentIconUrls.weapon = "";
                return true;
            }

            return false;
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
            lastRangedWeaponImageSignature: this.lastRangedWeaponImageSignature,
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

        try {
            const slot = typeof anySpine.getSlotByName === "function" ? anySpine.getSlotByName(slotName) : null;
            if (slot && typeof slot.setAttachment === "function") {
                slot.setAttachment(null);
                cleared = true;
            }
        } catch (error) {
        }

        try {
            const skeleton = this.resolveSpineSkeleton(anySpine);
            const slot = skeleton && typeof skeleton.findSlot === "function" ? skeleton.findSlot(slotName) : null;
            if (slot && typeof slot.setAttachment === "function") {
                slot.setAttachment(null);
                cleared = true;
            }
            if (skeleton && typeof skeleton.updateWorldTransform === "function") {
                const physics = (globalThis as any).spine?.Physics?.update ?? 2;
                skeleton.updateWorldTransform(physics);
            }
        } catch (error) {
        }

        this.markSpineRenderDirty(anySpine);

        return cleared;
    }

    private syncRangedWeaponImage(force: boolean): void {
        const root = this.resolveRangedWeaponRootNode();
        const image = this.resolveRangedWeaponImageNode(root);
        if (!root && !image) {
            return;
        }

        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        const itemId = String(weapon?.itemId || "");
        const config = this.isEquippedRangedWeapon()
            ? PlayerEquipmentVisualController.RANGED_WEAPON_VISUALS[itemId]
            : null;
        const signature = config
            ? `${itemId}|${config.src}|${config.x}|${config.y}|${config.width}|${config.height}|${config.scaleX}|${config.scaleY}|${config.rotation || 0}`
            : "hidden";

        if (!force && signature === this.lastRangedWeaponImageSignature) {
            return;
        }

        this.lastRangedWeaponImageSignature = signature;

        if (root) {
            this.setNodeVisible(root, !!config);
        }

        if (!image) {
            return;
        }

        this.hideSiblingRangedWeaponImages(root, image);
        this.setNodeVisible(image, !!config);

        if (!config) {
            return;
        }

        const anyImage = image as any;
        if ("autoSize" in anyImage) {
            anyImage.autoSize = false;
        }
        anyImage.src = config.src;
        anyImage.x = config.x;
        anyImage.y = config.y;
        anyImage.width = config.width;
        anyImage.height = config.height;
        anyImage.scaleX = config.scaleX;
        anyImage.scaleY = config.scaleY;
        anyImage.rotation = config.rotation || 0;
    }

    private resolveRangedWeaponRootNode(): Laya.Node | null {
        if (this.controller.rangedWeaponRootNode && !this.controller.rangedWeaponRootNode.destroyed) {
            return this.controller.rangedWeaponRootNode;
        }

        return this.findChildByName(this.controller.owner as Laya.Node | null, "ranged");
    }

    private resolveRangedWeaponImageNode(root: Laya.Node | null): Laya.Node | null {
        if (this.controller.rangedWeaponImageNode && !this.controller.rangedWeaponImageNode.destroyed) {
            return this.controller.rangedWeaponImageNode;
        }

        if (!root) {
            return null;
        }

        const named = this.findChildByName(root, "ranged_weapon_image");
        if (named) {
            return named;
        }

        return this.findFirstGImage(root);
    }

    private hideSiblingRangedWeaponImages(root: Laya.Node | null, activeImage: Laya.Node): void {
        if (!root) {
            return;
        }

        this.visitNodes(root, (node) => {
            if (node !== activeImage && this.isGImageNode(node)) {
                this.setNodeVisible(node, false);
            }
        });
    }

    private findFirstGImage(root: Laya.Node | null): Laya.Node | null {
        let result: Laya.Node | null = null;
        this.visitNodes(root, (node) => {
            if (!result && this.isGImageNode(node)) {
                result = node;
            }
        });
        return result;
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        const childCount = (root as any).numChildren || 0;
        for (let i = 0; i < childCount; i++) {
            const found = this.findChildByName(root.getChildAt(i), name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private visitNodes(root: Laya.Node | null, visitor: (node: Laya.Node) => void): void {
        if (!root) {
            return;
        }

        visitor(root);
        const childCount = (root as any).numChildren || 0;
        for (let i = 0; i < childCount; i++) {
            this.visitNodes(root.getChildAt(i), visitor);
        }
    }

    private isGImageNode(node: Laya.Node): boolean {
        return (node as any)?._$type === "GImage"
            || typeof (node as any)?.src === "string"
            || (typeof (globalThis as any).Laya?.GImage === "function" && node instanceof (globalThis as any).Laya.GImage);
    }

    private setNodeVisible(node: Laya.Node, visible: boolean): void {
        const anyNode = node as any;
        anyNode.visible = visible;
        if ("active" in anyNode) {
            anyNode.active = visible;
        }
    }

    private resolveSpineSkeleton(spine: any): any | null {
        const render = spine?._spineRender;
        if (!render || typeof render.getSkeleton !== "function") {
            return null;
        }

        try {
            return render.getSkeleton();
        } catch (error) {
            return null;
        }
    }

    private markSpineRenderDirty(spine: any): void {
        if (!spine) {
            return;
        }

        try {
            if ("_needUpdate" in spine) {
                spine._needUpdate = true;
            }
        } catch (error) {
        }
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
