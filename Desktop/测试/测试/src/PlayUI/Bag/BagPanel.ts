const { regClass, property } = Laya;

import { DataManager, type EquippedItem, type EquipmentSlotType, type InventorySlotItem } from "../../systems/datamanager";
import { glist } from "../CommonUI/glist";
import type { ListTemplateData } from "../CommonUI/listTemplate";

interface EquipSlotBinding {
    slot: EquipmentSlotType;
    node: Laya.Node | null;
    emptyLabel: string;
}

interface SelectedBagSlotState {
    item: ListTemplateData;
    slotIndex: number;
}

@regClass()
export class BagPanel extends Laya.Script {
    @property(Laya.Node)
    public containerNode: Laya.Node | null = null;

    @property(Laya.Node)
    public bagNode: Laya.Node | null = null;

    @property(Laya.Node)
    public containerGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public bagGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public personPageNode: Laya.Node | null = null;

    @property(Laya.Node)
    public quickEquipNode: Laya.Node | null = null;

    @property(Laya.Node)
    public insertPlateSlotNode: Laya.Node | null = null;

    @property(Laya.Node)
    public helmetSlotNode: Laya.Node | null = null;

    @property(Laya.Node)
    public weaponSlotNode: Laya.Node | null = null;

    @property(Laya.Node)
    public armorSlotNode: Laya.Node | null = null;

    @property(Laya.Node)
    public previewSpineNode: Laya.Node | null = null;

    @property(String)
    public previewWeaponSpineSlotName: string = "weapon_slot";

    @property(Number)
    public defaultState: number = 0;

    private currentState: number = -1;
    private bagGlist: glist | null = null;
    private containerGlist: glist | null = null;
    private selectedBagSlot: SelectedBagSlotState | null = null;
    private lastPreviewWeaponAttachmentName: string = "__init";

    onAwake(): void {
        this.bindControllers();
        this.bindEquipSlots();
        DataManager.getInstance().registerBagView(this);
        this.openDefault();
        this.refreshEquipSlots();
        Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
    }

    onEnable(): void {
        this.bindControllers();
        this.bindEquipSlots();
        DataManager.getInstance().registerBagView(this);
        this.syncVisibleState();
        this.refreshEquipSlots();
        Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
    }

    onDisable(): void {
        DataManager.getInstance().unregisterBagView(this);
    }

    onDestroy(): void {
        DataManager.getInstance().unregisterBagView(this);
    }

    public setItems(items: InventorySlotItem[]): void {
        this.bindControllers();
        this.bindBagList(items);
        this.refreshEquipSlots();
    }

    public openDefault(): void {
        this.currentState = 0;
        this.syncVisibleState();
    }

    public openContainerSearch(): void {
        this.currentState = 1;
        this.syncVisibleState();
    }

    public closePanel(): void {
        this.setNodeVisible(this.personPageNode, false);
        this.setNodeVisible(this.quickEquipNode, false);
        this.setNodeVisible(this.containerNode, false);
        this.setNodeVisible(this.containerGlistNode, false);
        this.setNodeVisible(this.bagNode, false);
        this.setNodeVisible(this.bagGlistNode, false);
    }

    public showDefaultState(): void {
        this.openDefault();
    }

    public showContainerSearchState(): void {
        this.openContainerSearch();
    }

    public showState(stateIndex: number): void {
        this.currentState = this.normalizeState(stateIndex);
        this.syncVisibleState();
    }

    public refresh(): void {
        this.bindControllers();
        this.bindEquipSlots();
        this.syncVisibleState();
        const snapshot = DataManager.getInstance().getInventorySnapshot();
        this.bindBagList(snapshot);
        this.refreshEquipSlots();
    }

    private bindControllers(): void {
        this.bagGlist = this.resolveGlistController(this.bagGlistNode, "bagGlistNode");
        this.containerGlist = this.resolveGlistController(this.containerGlistNode, "containerGlistNode");
    }

    private bindBagList(items: InventorySlotItem[]): void {
        if (!this.bagGlist) {
            return;
        }

        this.bagGlist.listKey = "bag";
        this.bagGlist.onSlotClick = this.handleBagSlotClick;
        this.bagGlist.setSlotCount(DataManager.getInstance().getPlayerBagSlotCount());
        this.bagGlist.setItems(this.toListData(items));
        this.bagGlist.setSelectedSlotIndex(this.selectedBagSlot ? this.selectedBagSlot.slotIndex : -1);
    }

    private handleBagSlotClick = (item: ListTemplateData | null, listKey: string, slotIndex: number): void => {
        const normalizedSlotIndex = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        if (normalizedSlotIndex < 0) {
            this.clearBagSelection();
            return;
        }

        if (!this.selectedBagSlot) {
            if (item && item.itemId) {
                this.setBagSelection(item, normalizedSlotIndex);
            }
            return;
        }

        if (this.selectedBagSlot.slotIndex === normalizedSlotIndex) {
            this.clearBagSelection();
            return;
        }

        if (DataManager.getInstance().moveActiveInventorySlot(this.selectedBagSlot.slotIndex, normalizedSlotIndex)) {
            this.clearBagSelection();
            this.refresh();
            return;
        }

        this.clearBagSelection();
    };

    private setBagSelection(item: ListTemplateData, slotIndex: number): void {
        this.selectedBagSlot = { item, slotIndex };
        if (this.bagGlist) {
            this.bagGlist.setSelectedSlotIndex(slotIndex);
        }

        this.refreshEquipSlots();
    }

    private clearBagSelection(): void {
        this.selectedBagSlot = null;
        if (this.bagGlist) {
            this.bagGlist.setSelectedSlotIndex(-1);
        }

        this.refreshEquipSlots();
    }

    private bindEquipSlots(): void {
        this.resolveDefaultEquipSlotNodes();
        const slots = this.getEquipSlotBindings();
        for (let i = 0; i < slots.length; i++) {
            const binding = slots[i];
            const node = binding.node as any;
            if (!node || typeof node.on !== "function" || typeof node.off !== "function") {
                continue;
            }

            node.mouseEnabled = true;
            node.off(Laya.Event.CLICK, this, this.onEquipSlotClick);
            node.on(Laya.Event.CLICK, this, this.onEquipSlotClick, [binding.slot]);
        }
    }

    private onEquipSlotClick(slot: EquipmentSlotType): void {
        const dataManager = DataManager.getInstance();
        if (this.selectedBagSlot?.item.itemId) {
            if (dataManager.equipItemFromActive(slot, this.selectedBagSlot.item.itemId)) {
                this.clearBagSelection();
                this.refreshEquipSlots();
            }
            return;
        }

        if (dataManager.unequipItemToActive(slot)) {
            this.refreshEquipSlots();
        }
    }

    private refreshEquipSlots(): void {
        const dataManager = DataManager.getInstance();
        const slots = this.getEquipSlotBindings();
        for (let i = 0; i < slots.length; i++) {
            const binding = slots[i];
            const item = dataManager.getEquippedItem(binding.slot);
            const selectedItemId = this.selectedBagSlot?.item.itemId || "";
            const highlighted = !!selectedItemId && dataManager.canEquipItemToSlot(selectedItemId, binding.slot);
            this.renderEquipSlot(binding.node, item, binding.emptyLabel, highlighted);
        }

        this.refreshPreviewSpineWeapon();
    }

    private syncVisibleState(): void {
        const showDefault = this.currentState === 0;
        const showContainer = this.currentState === 1;

        this.setNodeVisible(this.personPageNode, showDefault);
        this.setNodeVisible(this.quickEquipNode, showDefault);
        this.setNodeVisible(this.containerNode, showContainer);
        this.setNodeVisible(this.containerGlistNode, showContainer);
        this.setNodeVisible(this.bagNode, true);
        this.setNodeVisible(this.bagGlistNode, true);
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = visible;
        }

        if ("active" in target) {
            target.active = visible;
        }
    }

    private toListData(items: InventorySlotItem[]): Array<ListTemplateData | null> {
        return (Array.isArray(items) ? items : []).map((item) =>
            item
                ? {
                      itemId: item.itemId,
                      name: item.name,
                      count: item.count,
                      icon: item.icon,
                  }
                : null,
        );
    }

    private getEquipSlotBindings(): EquipSlotBinding[] {
        return [
            { slot: "insertPlate", node: this.insertPlateSlotNode, emptyLabel: "插板" },
            { slot: "helmet", node: this.helmetSlotNode, emptyLabel: "头部" },
            { slot: "weapon", node: this.weaponSlotNode, emptyLabel: "武器" },
            { slot: "armor", node: this.armorSlotNode, emptyLabel: "身体" },
        ];
    }

    private renderEquipSlot(node: Laya.Node | null, item: EquippedItem | null, emptyLabel: string, highlighted: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        target.alpha = highlighted ? 0.78 : 1;

        const iconNode = this.findChildByName(node, "icon") as any;
        const nameNode = this.findChildByName(node, "name") as any;
        const amountNode = this.findChildByName(node, "amount") as any;

        if (iconNode) {
            const iconPath = item?.icon ? this.resolveIconPath(item.icon) : "";
            if ("visible" in iconNode) {
                iconNode.visible = !!iconPath;
            }
            if ("skin" in iconNode) {
                iconNode.skin = iconPath;
            }
            if ("src" in iconNode) {
                iconNode.src = iconPath;
            }
            if ("width" in iconNode) {
                iconNode.width = 65;
            }
            if ("height" in iconNode) {
                iconNode.height = 65;
            }
        }

        if (nameNode) {
            nameNode.text = item ? item.name : emptyLabel;
            if ("color" in nameNode) {
                nameNode.color = highlighted ? "#20c96b" : "#000000";
            }
        }

        if (amountNode) {
            amountNode.text = item && item.count > 1 ? String(item.count) : "";
            if ("color" in amountNode) {
                amountNode.color = highlighted ? "#20c96b" : "#000000";
            }
        }
    }

    private resolveDefaultEquipSlotNodes(): void {
        if (!this.weaponSlotNode) {
            this.weaponSlotNode = this.findChildByName(this.personPageNode, "boxmodule_5");
        }
        if (!this.insertPlateSlotNode) {
            this.insertPlateSlotNode = this.findChildByName(this.personPageNode, "boxmodule_1");
        }
        if (!this.helmetSlotNode) {
            this.helmetSlotNode = this.findChildByName(this.personPageNode, "head");
        }
        if (!this.armorSlotNode) {
            this.armorSlotNode = this.findChildByName(this.personPageNode, "boxmodule_2");
        }
        if (!this.previewSpineNode) {
            this.previewSpineNode = this.findChildByName(this.personPageNode, "Sprite");
        }
    }

    private refreshPreviewSpineWeapon(): void {
        const slotName = String(this.previewWeaponSpineSlotName || "").trim();
        if (!slotName) {
            return;
        }

        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        const attachmentName = weapon ? this.resolveWeaponAttachmentName(weapon.itemId) : "";
        if (attachmentName === this.lastPreviewWeaponAttachmentName) {
            return;
        }

        this.applyPreviewSpineAttachment(slotName, attachmentName || null);
        this.lastPreviewWeaponAttachmentName = attachmentName;
    }

    private resolveWeaponAttachmentName(itemId: string): string {
        const map: Record<string, string> = {
            wood_club: "weapon_slot7",
            baseket_bat: "basekat_bat",
            cleaver: "weapon_slot",
            knife: "weapon_slot2",
            long_knife: "weapon_slot5",
            machete: "weapon_slot6",
        };

        return map[itemId] || "";
    }

    private applyPreviewSpineAttachment(slotName: string, attachmentName: string | null): boolean {
        const spineNode = this.previewSpineNode || this.findChildByName(this.personPageNode, "Sprite");
        const spine = spineNode ? spineNode.getComponent(Laya.Spine2DRenderNode) : null;
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

    private resolveIconPath(iconPath: string): string {
        const raw = String(iconPath || "").trim();
        if (!raw) {
            return "";
        }

        const normalized = raw.replace(/^assets\//, "");
        const url = (Laya as any).URL;
        if (url && typeof url.formatURL === "function") {
            return String(url.formatURL(normalized) || normalized);
        }

        return normalized;
    }

    private normalizeState(stateIndex: number): number {
        const state = Number.isFinite(stateIndex) ? Math.floor(stateIndex) : 0;
        if (state === 1) {
            return 1;
        }
        return 0;
    }

    private resolveGlistController(node: Laya.Node | null, label: string): glist | null {
        const controller = this.findGlistController(node);
        return controller;
    }

    private findGlistController(node: Laya.Node | null): glist | null {
        if (!node) {
            return null;
        }

        const direct = node.getComponent(glist);
        if (direct) {
            return direct;
        }

        const children = (node as any).children as Laya.Node[] | undefined;
        if (!children || children.length === 0) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const nested = this.findGlistController(child);
            if (nested) {
                return nested;
            }
        }

        return null;
    }
}
