import { DataManager } from "../../systems/datamanager";

export class BagPreviewSpineController {
    private lastWeaponAttachmentName: string = "__init";
    private lastAnimationName: string = "__init";

    constructor(private panel: any) {
    }

    public refreshWeapon(): void {
        const slotName = this.resolveWeaponSpineSlotName();
        if (!slotName) {
            return;
        }

        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        const attachmentName = weapon ? this.resolveWeaponAttachmentName(weapon.itemId) : "";
        this.refreshAnimation();
        if (!this.clearWeaponSlots()) {
            this.scheduleRefreshWeapon();
            return;
        }

        if (!attachmentName) {
            if (this.lastWeaponAttachmentName) {
                if (this.applySpineAttachment(slotName, null)) {
                    this.lastWeaponAttachmentName = "";
                } else {
                    this.scheduleRefreshWeapon();
                }
            }
            return;
        }

        if (this.applySpineAttachment(slotName, attachmentName)) {
            this.lastWeaponAttachmentName = attachmentName;
        } else {
            this.scheduleRefreshWeapon();
        }
    }

    private scheduleRefreshWeapon(): void {
        Laya.timer.callLater(this.panel, this.panel.refreshPreviewSpineWeapon);
    }

    private scheduleRefreshAnimation(): void {
        Laya.timer.callLater(this.panel, this.panel.refreshPreviewSpineWeapon);
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

    private resolveWeaponSpineSlotName(): string {
        if (this.isPreviewRangedWeapon()) {
            return String(this.panel.previewWeaponRangedSpineSlotName || this.panel.previewWeaponSpineSlotName || "").trim();
        }

        return String(this.panel.previewWeaponMeleeSpineSlotName || this.panel.previewWeaponSpineSlotName || "").trim();
    }

    private isPreviewRangedWeapon(): boolean {
        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        if (!weapon || !weapon.itemId) {
            return false;
        }

        const meta = DataManager.getInstance().resolveItemMeta(weapon.itemId);
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        return subCategory.includes("ranged");
    }

    private refreshAnimation(): void {
        const animationName = this.resolveAnimationName();
        if (!animationName || animationName === this.lastAnimationName) {
            return;
        }

        const spine = this.getPreviewSpine();
        if (!spine) {
            this.scheduleRefreshAnimation();
            return;
        }

        if (!this.isSpineReady(spine)) {
            this.scheduleRefreshAnimation();
            return;
        }

        if (!this.hasAnimation(spine, animationName)) {
            return;
        }

        try {
            (spine as any).play(animationName, true, true);
            this.lastAnimationName = animationName;
        } catch (error) {
            this.scheduleRefreshAnimation();
        }
    }

    private resolveAnimationName(): string {
        return this.isPreviewRangedWeapon()
            ? String(this.panel.previewRangedAnimation || this.panel.previewMeleeAnimation || "").trim()
            : String(this.panel.previewMeleeAnimation || "").trim();
    }

    private hasAnimation(spine: Laya.Spine2DRenderNode, animationName: string): boolean {
        const templet = (spine as any).templet;
        if (templet && typeof templet.hasAnimation === "function") {
            return !!templet.hasAnimation(animationName);
        }

        const anySpine = spine as any;
        if (templet && typeof anySpine.getAnimNum === "function" && typeof anySpine.getAniNameByIndex === "function") {
            const count = Math.max(0, Number(anySpine.getAnimNum()) || 0);
            for (let i = 0; i < count; i++) {
                if (anySpine.getAniNameByIndex(i) === animationName) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    private isSpineReady(spine: Laya.Spine2DRenderNode): boolean {
        const anySpine = spine as any;
        const templet = anySpine.templet;
        if (!templet) {
            return false;
        }

        if (typeof templet.getAnimationCount === "function") {
            try {
                return Number(templet.getAnimationCount()) > 0;
            } catch (error) {
                return false;
            }
        }

        return true;
    }

    private clearWeaponSlots(): boolean {
        const meleeSlotName = String(this.panel.previewWeaponMeleeSpineSlotName || "").trim();
        const rangedSlotName = String(this.panel.previewWeaponRangedSpineSlotName || "").trim();
        let cleared = true;

        if (meleeSlotName) {
            cleared = this.clearSpineAttachment(meleeSlotName) && cleared;
        }

        if (rangedSlotName) {
            cleared = this.clearSpineAttachment(rangedSlotName) && cleared;
        }

        return cleared;
    }

    private clearSpineAttachment(slotName: string): boolean {
        const spine = this.getPreviewSpine();
        if (!spine) {
            return false;
        }

        const anySpine = spine as any;
        try {
            const slot = typeof anySpine.findSlot === "function" ? anySpine.findSlot(slotName) : null;
            if (slot && typeof slot.setAttachment === "function") {
                slot.setAttachment(null);
                return true;
            }
        } catch (error) {
        }

        return this.applySpineAttachment(slotName, null);
    }

    private applySpineAttachment(slotName: string, attachmentName: string | null): boolean {
        const spine = this.getPreviewSpine();
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

    private getPreviewSpine(): Laya.Spine2DRenderNode | null {
        const spineNode = this.panel.previewSpineNode || this.findChildByName(this.panel.personPageNode, "Sprite");
        return spineNode ? spineNode.getComponent(Laya.Spine2DRenderNode) : null;
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }
}