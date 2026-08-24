const { regClass, property } = Laya;

import { DataManager, type EquippedItem, type EquipmentSlotType, type InventorySlotItem } from "../../systems/datamanager";
import { glist } from "../CommonUI/glist";
import type { ListTemplateData } from "../CommonUI/listTemplate";
import { PlayerController } from "../../Player/PlayerController";

interface EquipSlotBinding {
    slot: EquipmentSlotType;
    node: Laya.Node | null;
    emptyLabel: string;
}

interface SelectedBagSlotState {
    item: ListTemplateData;
    slotIndex: number;
}

interface PlayerBuffView {
    id: string;
    shortName: string;
    color: string;
    remainingSeconds: number;
    durationSeconds: number;
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

    @property(Laya.Text)
    public gradeNode: Laya.Text | null = null;

    @property(Laya.Text)
    public gradeTextNode: Laya.Text | null = null;

    @property(Laya.Text)
    public experienceTextNode: Laya.Text | null = null;

    @property(Laya.Node)
    public stateListNode: Laya.Node | null = null;

    @property(String)
    public previewWeaponSpineSlotName: string = "";

    @property(String)
    public previewWeaponMeleeSpineSlotName: string = "weapon_melee_slot";

    @property(String)
    public previewWeaponRangedSpineSlotName: string = "weapon_ranged_slot";

    @property(String)
    public previewMeleeAnimation: string = "default/default_melee_swing";

    @property(String)
    public previewRangedAnimation: string = "default/default_ranged_firearm";

    @property(Number)
    public defaultState: number = 0;

    private currentState: number = -1;
    private bagGlist: glist | null = null;
    private containerGlist: glist | null = null;
    private selectedBagSlot: SelectedBagSlotState | null = null;
    private lastPreviewWeaponAttachmentName: string = "__init";
    private lastPreviewAnimationName: string = "__init";
    private previewSpineNode: Laya.Node | null = null;
    private quickEquipInitialVisible: boolean | null = null;

    onAwake(): void {
        this.captureInitialVisibility();
        this.bindControllers();
        this.bindEquipSlots();
        DataManager.getInstance().registerBagView(this);
        this.openDefault();
        this.refreshEquipSlots();
        this.refreshPlayerStats();
        this.refreshBuffStates();
        Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
    }

    onEnable(): void {
        this.captureInitialVisibility();
        this.bindControllers();
        this.bindEquipSlots();
        DataManager.getInstance().registerBagView(this);
        this.syncVisibleState();
        this.refreshEquipSlots();
        this.refreshPlayerStats();
        this.refreshBuffStates();
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
        this.refreshPlayerStats();
        this.refreshBuffStates();
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
        this.refreshPlayerStats();
        this.refreshBuffStates();
    }

    public refreshBuffStates(): void {
        this.resolveBuffStateNodes();
        const buffs = this.getPreviewBuffStates();
        this.renderStateList(buffs);
    }

    public refreshPlayerStats(): void {
        this.resolvePlayerStatsNodes();
        const stats = DataManager.getInstance().getPlayerStats();

        if (this.gradeNode) {
            this.gradeNode.text = String(stats.level);
        }

        if (this.gradeTextNode) {
            this.gradeTextNode.text = `${stats.currentHp}/${stats.maxHp}`;
        }

        if (this.experienceTextNode) {
            this.experienceTextNode.text = `${stats.experience}/${stats.nextLevelExperience}`;
        }
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
                this.notifyPlayerEquipmentChanged();
            }
            return;
        }

        if (dataManager.unequipItemToActive(slot)) {
            this.refreshEquipSlots();
            this.notifyPlayerEquipmentChanged();
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
        this.setNodeVisible(this.quickEquipNode, showDefault && this.shouldShowQuickEquipNode());
        this.setNodeVisible(this.containerNode, showContainer);
        this.setNodeVisible(this.containerGlistNode, showContainer);
        this.setNodeVisible(this.bagNode, true);
        this.setNodeVisible(this.bagGlistNode, true);
    }

    private captureInitialVisibility(): void {
        if (this.quickEquipInitialVisible !== null || !this.quickEquipNode) {
            return;
        }

        const target = this.quickEquipNode as any;
        const visible = "visible" in target ? target.visible !== false : true;
        const active = "active" in target ? target.active !== false : true;
        this.quickEquipInitialVisible = visible && active;
    }

    private shouldShowQuickEquipNode(): boolean {
        return this.quickEquipInitialVisible !== false;
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

    private resolvePlayerStatsNodes(): void {
        const root = this.owner as Laya.Node;
        if (!this.gradeNode) {
            this.gradeNode = this.findChildByName(root, "grade") as Laya.Text | null;
        }
        if (!this.gradeTextNode) {
            this.gradeTextNode = (this.findChildByName(root, "hptext") || this.findChildByName(root, "gradetext")) as Laya.Text | null;
        }
        if (!this.experienceTextNode) {
            this.experienceTextNode = this.findChildByName(root, "experiencetext") as Laya.Text | null;
        }
    }

    private resolveBuffStateNodes(): void {
        if (!this.stateListNode) {
            this.stateListNode = this.findChildByName(this.owner as Laya.Node, "statelist");
        }
    }

    private getPreviewBuffStates(): PlayerBuffView[] {
        return [
            { id: "fullness", shortName: "饱", color: "#2f80ed", remainingSeconds: 60, durationSeconds: 60 },
            { id: "bleeding", shortName: "流", color: "#d83333", remainingSeconds: 18, durationSeconds: 20 },
            { id: "slow", shortName: "减", color: "#808080", remainingSeconds: 10, durationSeconds: 12 },
            { id: "regen", shortName: "回", color: "#2eb872", remainingSeconds: 8, durationSeconds: 10 },
            { id: "adrenaline", shortName: "肾", color: "#8e44ad", remainingSeconds: 14, durationSeconds: 15 },
            { id: "poison", shortName: "毒", color: "#6b8e23", remainingSeconds: 22, durationSeconds: 25 },
        ];
    }

    private renderStateList(buffs: PlayerBuffView[]): void {
        const list = this.stateListNode as any;
        if (!list) {
            return;
        }

        if ("itemRenderer" in list) {
            list.itemRenderer = (index: number, item: Laya.Node) => {
                this.renderBuffStateItem(buffs[index] || null, item);
            };
        }

        if ("numItems" in list) {
            list.numItems = buffs.length;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        Laya.timer.callLater(this, () => {
            this.renderVisibleBuffStateItems(buffs);
        });
    }

    private renderVisibleBuffStateItems(buffs: PlayerBuffView[]): void {
        const list = this.stateListNode as any;
        const children = list && Array.isArray(list.children) ? (list.children as Laya.Node[]) : [];
        const templateNode = this.getTemplateNode(this.stateListNode);
        let dataIndex = 0;

        for (let i = 0; i < children.length && dataIndex < buffs.length; i++) {
            const child = children[i];
            if (!child || child === templateNode) {
                continue;
            }

            this.renderBuffStateItem(buffs[dataIndex] || null, child);
            dataIndex++;
        }
    }

    private renderBuffStateItem(buff: PlayerBuffView | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!buff);
        if (!buff) {
            return;
        }

        const backgroundNode = this.findChildByName(node, "Sprite") as any;
        this.setSpriteFillColor(backgroundNode, buff.color);

        const textNode = this.findChildByName(node, "Text") as Laya.Text | null;
        if (textNode) {
            textNode.text = buff.shortName;
        }

        const maskNode = this.findChildByName(node, "mask") as any;
        if (maskNode) {
            const ratio = Math.max(0, Math.min(1, buff.remainingSeconds / Math.max(1, buff.durationSeconds)));
            const height = Math.round(50 * ratio);
            maskNode.visible = ratio > 0;
            this.setNodeDrawHeight(maskNode, height);
            maskNode.y = 50;
        }
    }

    private setSpriteFillColor(node: any, fillColor: string): void {
        if (!node || !Array.isArray(node._gcmds)) {
            return;
        }

        for (let i = 0; i < node._gcmds.length; i++) {
            const command = node._gcmds[i];
            if (command && "fillColor" in command) {
                command.fillColor = fillColor;
            }
        }
    }

    private setNodeDrawHeight(node: any, height: number): void {
        const nextHeight = Math.max(0, height);
        if ("height" in node) {
            node.height = nextHeight;
        }

        if (!Array.isArray(node._gcmds)) {
            return;
        }

        for (let i = 0; i < node._gcmds.length; i++) {
            const command = node._gcmds[i];
            if (command && "height" in command) {
                command.height = nextHeight;
            }
        }
    }

    private getTemplateNode(listNode: Laya.Node | null): Laya.Node | null {
        const list = listNode as any;
        return (list?._templateNode as Laya.Node | null)
            || (list?.templateNode as Laya.Node | null)
            || null;
    }

    private refreshPreviewSpineWeapon(): void {
        const slotName = this.resolvePreviewWeaponSpineSlotName();
        if (!slotName) {
            return;
        }

        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        const attachmentName = weapon ? this.resolveWeaponAttachmentName(weapon.itemId) : "";
        this.refreshPreviewSpineAnimation();
        this.clearInactivePreviewWeaponSlot(slotName);
        if (!attachmentName) {
            if (this.lastPreviewWeaponAttachmentName) {
                if (this.applyPreviewSpineAttachment(slotName, null)) {
                    this.lastPreviewWeaponAttachmentName = "";
                } else {
                    Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
                }
            }
            return;
        }

        if (attachmentName === this.lastPreviewWeaponAttachmentName) {
            return;
        }

        if (this.applyPreviewSpineAttachment(slotName, attachmentName)) {
            this.lastPreviewWeaponAttachmentName = attachmentName;
        } else {
            Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
        }
    }

    private notifyPlayerEquipmentChanged(): void {
        PlayerController.activeInstance?.refreshEquipmentFromData();
        Laya.timer.callLater(this, () => {
            PlayerController.activeInstance?.refreshEquipmentFromData();
        });
    }

    private resolveWeaponAttachmentName(itemId: string): string {
        const map: Record<string, string> = {
            wood_club: "weapon_slot7",
            baseket_bat: "basekat_bat",
            cleaver: "weapon_slot",
            knife: "weapon_slot2",
            long_knife: "weapon_slot5",
            machete: "weapon_slot6",
            m16: "weapon_ranged_M16",
        };

        return map[itemId] || "";
    }

    private resolvePreviewWeaponSpineSlotName(): string {
        if (this.isPreviewRangedWeapon()) {
            return String(this.previewWeaponRangedSpineSlotName || this.previewWeaponSpineSlotName || "").trim();
        }

        return String(this.previewWeaponMeleeSpineSlotName || this.previewWeaponSpineSlotName || "").trim();
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

    private refreshPreviewSpineAnimation(): void {
        const animationName = this.resolvePreviewSpineAnimationName();
        if (!animationName || animationName === this.lastPreviewAnimationName) {
            return;
        }

        const spine = this.getPreviewSpine();
        if (!spine) {
            Laya.timer.callLater(this, this.refreshPreviewSpineAnimation);
            return;
        }

        if (!this.isPreviewSpineReady(spine)) {
            Laya.timer.callLater(this, this.refreshPreviewSpineAnimation);
            return;
        }

        if (!this.hasPreviewAnimation(spine, animationName)) {
            return;
        }

        try {
            spine.play(animationName, true, true);
            this.lastPreviewAnimationName = animationName;
        } catch (error) {
            Laya.timer.callLater(this, this.refreshPreviewSpineAnimation);
        }
    }

    private resolvePreviewSpineAnimationName(): string {
        return this.isPreviewRangedWeapon()
            ? String(this.previewRangedAnimation || this.previewMeleeAnimation || "").trim()
            : String(this.previewMeleeAnimation || "").trim();
    }

    private hasPreviewAnimation(spine: Laya.Spine2DRenderNode, animationName: string): boolean {
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

    private isPreviewSpineReady(spine: Laya.Spine2DRenderNode): boolean {
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

    private clearInactivePreviewWeaponSlot(activeSlotName: string): void {
        const meleeSlotName = String(this.previewWeaponMeleeSpineSlotName || "").trim();
        const rangedSlotName = String(this.previewWeaponRangedSpineSlotName || "").trim();

        if (meleeSlotName && meleeSlotName !== activeSlotName) {
            this.applyPreviewSpineAttachment(meleeSlotName, null);
        }

        if (rangedSlotName && rangedSlotName !== activeSlotName) {
            this.applyPreviewSpineAttachment(rangedSlotName, null);
        }
    }

    private applyPreviewSpineAttachment(slotName: string, attachmentName: string | null): boolean {
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
        const spineNode = this.previewSpineNode || this.findChildByName(this.personPageNode, "Sprite");
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
