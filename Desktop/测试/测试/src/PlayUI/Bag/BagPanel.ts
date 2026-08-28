const { regClass, property } = Laya;

import { DataManager, type EquippedItem, type EquipmentSlotType, type InventorySlotItem } from "../../systems/datamanager";
import { glist } from "../CommonUI/glist";
import { listTemplate, type ListTemplateData } from "../CommonUI/listTemplate";
import { PlayerController } from "../../Player/PlayerController";
import { BagPreviewSpineController } from "./BagPreviewSpineController";
import { BagBuffStateController } from "./BagBuffStateController";
import { BagPopupController, type BagPopupAction } from "./BagPopupController";

interface EquipSlotBinding {
    slot: EquipmentSlotType;
    node: Laya.Node | null;
    emptyLabel: string;
}

interface SelectedBagSlotState {
    item: ListTemplateData;
    slotIndex: number;
}

interface SelectedQuickSlotState {
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

    @property(Laya.Text)
    public gradeNode: Laya.Text | null = null;

    @property(Laya.Text)
    public gradeTextNode: Laya.Text | null = null;

    @property(Laya.Text)
    public experienceTextNode: Laya.Text | null = null;

    @property(Laya.Node)
    public stateListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public popupListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public organizeButtonNode: Laya.Node | null = null;

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
    private selectedQuickSlot: SelectedQuickSlotState | null = null;
    private previewSpineNode: Laya.Node | null = null;
    private previewSpine: BagPreviewSpineController = new BagPreviewSpineController(this);
    private readonly buffStates: BagBuffStateController = new BagBuffStateController(
        () => this.stateListNode,
        (node: Laya.Node | null) => { this.stateListNode = node; },
        () => this.owner as Laya.Node | null
    );
    private quickEquipInitialVisible: boolean | null = null;
    private quickSlotItems: InventorySlotItem[] = [];
    private readonly popup: BagPopupController = new BagPopupController(this);

    onAwake(): void {
        this.captureInitialVisibility();
        this.bindControllers();
        this.bindOrganizeButton();
        this.bindEquipSlots();
        this.bindQuickSlots();
        DataManager.getInstance().registerBagView(this);
        DataManager.getInstance().registerQuickSlotView(this);
        this.openDefault();
        this.refreshEquipSlots();
        this.refreshPlayerStats();
        this.refreshBuffStates();
        this.hidePopupList();
        Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
    }

    onEnable(): void {
        this.captureInitialVisibility();
        this.bindControllers();
        this.bindOrganizeButton();
        this.bindEquipSlots();
        this.bindQuickSlots();
        DataManager.getInstance().registerBagView(this);
        DataManager.getInstance().registerQuickSlotView(this);
        this.syncVisibleState();
        this.refreshEquipSlots();
        this.refreshPlayerStats();
        this.refreshBuffStates();
        this.hidePopupList();
        Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
    }

    onDisable(): void {
        this.hidePopupList();
        this.unbindOrganizeButton();
        Laya.timer.clear(this, this.refreshPreviewSpineWeapon);
        DataManager.getInstance().unregisterBagView(this);
        DataManager.getInstance().unregisterQuickSlotView(this);
    }

    onDestroy(): void {
        this.hidePopupList();
        this.unbindOrganizeButton();
        Laya.timer.clear(this, this.refreshPreviewSpineWeapon);
        DataManager.getInstance().unregisterBagView(this);
        DataManager.getInstance().unregisterQuickSlotView(this);
    }

    public setItems(items: InventorySlotItem[]): void {
        this.bindControllers();
        this.bindBagList(items);
        this.refreshEquipSlots();
        this.refreshPlayerStats();
        this.refreshBuffStates();
    }

    public refreshQuickSlots(items: InventorySlotItem[]): void {
        this.quickSlotItems = Array.isArray(items) ? items.map((item) => (item ? { ...item } : null)) : [];
        this.bindQuickSlots();
        this.renderQuickSlots();
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
        this.hidePopupList();
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
        this.bindQuickSlots();
        this.syncVisibleState();
        const snapshot = DataManager.getInstance().getInventorySnapshot();
        this.bindBagList(snapshot);
        this.refreshEquipSlots();
        this.refreshPlayerStats();
        this.refreshBuffStates();
        this.renderQuickSlots();
    }

    public refreshBuffStates(): void {
        this.buffStates.refresh();
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

    private bindOrganizeButton(): void {
        this.resolveOrganizeButtonNode();
        const button = this.organizeButtonNode as any;
        if (!button || typeof button.on !== "function" || typeof button.off !== "function") {
            return;
        }

        button.mouseEnabled = true;
        button.off(Laya.Event.CLICK, this, this.onOrganizeButtonClick);
        button.on(Laya.Event.CLICK, this, this.onOrganizeButtonClick);
    }

    private unbindOrganizeButton(): void {
        const button = this.organizeButtonNode as any;
        if (button && typeof button.off === "function") {
            button.off(Laya.Event.CLICK, this, this.onOrganizeButtonClick);
        }
    }

    private onOrganizeButtonClick = (event?: Laya.Event): void => {
        if (event && typeof event.stopPropagation === "function") {
            event.stopPropagation();
        }

        this.hidePopupList();
        this.clearBagSelection();
        this.clearQuickSelection();
        DataManager.getInstance().organizeActiveInventory();
        this.refresh();
    };

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
            this.hidePopupList();
            this.clearQuickSelection();
            this.clearBagSelection();
            return;
        }

        if (this.selectedQuickSlot) {
            if (DataManager.getInstance().moveQuickSlotToActiveSlot(this.selectedQuickSlot.slotIndex, normalizedSlotIndex)) {
                this.hidePopupList();
                this.clearQuickSelection();
                this.refresh();
                return;
            }

            this.hidePopupList();
            this.clearQuickSelection();
            return;
        }

        if (this.selectedBagSlot && this.selectedBagSlot.slotIndex !== normalizedSlotIndex) {
            if (DataManager.getInstance().moveActiveInventorySlot(this.selectedBagSlot.slotIndex, normalizedSlotIndex)) {
                this.hidePopupList();
                this.clearBagSelection();
                this.refresh();
                return;
            }

            this.hidePopupList();
            this.clearBagSelection();
            return;
        }

        if (!item || !item.itemId) {
            this.hidePopupList();
            this.clearBagSelection();
            return;
        }

        if (this.selectedBagSlot && this.selectedBagSlot.slotIndex === normalizedSlotIndex) {
            this.hidePopupList();
            this.clearBagSelection();
            return;
        }

        this.setBagSelection(item, normalizedSlotIndex);
        this.showPopupList(this.getBagItemActions(item, normalizedSlotIndex));
    };

    private setBagSelection(item: ListTemplateData, slotIndex: number): void {
        this.clearQuickSelection();
        this.selectedBagSlot = { item, slotIndex };
        if (this.bagGlist) {
            this.bagGlist.setSelectedSlotIndex(slotIndex);
        }

        this.refreshEquipSlots();
    }

    public clearBagSelection(): void {
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

    private bindQuickSlots(): void {
        this.resolveQuickEquipNode();
        const slots = this.getQuickSlotNodes();
        for (let i = 0; i < slots.length; i++) {
            const node = slots[i] as any;
            if (!node || typeof node.on !== "function" || typeof node.off !== "function") {
                continue;
            }

            node.mouseEnabled = true;
            node.off(Laya.Event.CLICK, this, this.onQuickSlotClick);
            node.on(Laya.Event.CLICK, this, this.onQuickSlotClick, [i]);
        }
    }

    private onQuickSlotClick(quickSlotIndex: number): void {
        const sourceBagSlotIndex = this.selectedBagSlot?.slotIndex;
        if (!Number.isFinite(sourceBagSlotIndex)) {
            this.handleQuickSlotSelection(quickSlotIndex);
            return;
        }

        const dataManager = DataManager.getInstance();
        if (dataManager.assignActiveSlotToQuickSlot(quickSlotIndex, sourceBagSlotIndex as number)) {
            this.hidePopupList();
            this.clearQuickSelection();
            this.clearBagSelection();
            this.refresh();
            this.renderQuickSlots();
            return;
        }
    }

    private handleQuickSlotSelection(quickSlotIndex: number): void {
        const dataManager = DataManager.getInstance();
        const index = Number.isFinite(quickSlotIndex) ? Math.floor(quickSlotIndex) : -1;
        if (index < 0) {
            this.hidePopupList();
            this.clearQuickSelection();
            return;
        }

        if (this.selectedQuickSlot) {
            if (this.selectedQuickSlot.slotIndex === index) {
                this.hidePopupList();
                this.clearQuickSelection();
                return;
            }

            if (dataManager.moveQuickSlot(this.selectedQuickSlot.slotIndex, index)) {
                this.hidePopupList();
                this.clearQuickSelection();
                return;
            }
        }

        const item = this.quickSlotItems[index] || null;
        if (!item || !item.itemId) {
            this.hidePopupList();
            this.clearQuickSelection();
            return;
        }

        this.hidePopupList();
        this.setQuickSelection(index);
    }

    private setQuickSelection(slotIndex: number): void {
        this.clearBagSelection();
        this.selectedQuickSlot = { slotIndex };
        this.renderQuickSlots();
    }

    private clearQuickSelection(): void {
        if (this.selectedQuickSlot) {
            this.selectedQuickSlot = null;
            this.renderQuickSlots();
        }
    }

    private renderQuickSlots(): void {
        const slots = this.getQuickSlotNodes();
        for (let i = 0; i < slots.length; i++) {
            const node = slots[i];
            if (!node) {
                continue;
            }

            let template = node.getComponent(listTemplate);
            if (!template) {
                template = node.addComponent(listTemplate);
            }

            const item = this.quickSlotItems[i] || null;
            template.bindData(item ? this.toListData([item])[0] : null);
            template.setSelected(!!item && this.selectedQuickSlot?.slotIndex === i);
        }
    }

    private getQuickSlotNodes(): Array<Laya.Node | null> {
        this.resolveQuickEquipNode();
        const nodes: Array<Laya.Node | null> = [];
        for (let i = 1; i <= 4; i++) {
            nodes.push(this.findDirectChildByName(this.quickEquipNode, String(i)));
        }

        return nodes;
    }

    private onEquipSlotClick(slot: EquipmentSlotType): void {
        const dataManager = DataManager.getInstance();
        if (this.selectedQuickSlot) {
            if (dataManager.moveQuickSlotToEquipment(this.selectedQuickSlot.slotIndex, slot)) {
                this.hidePopupList();
                this.clearQuickSelection();
                this.refreshEquipSlots();
                this.renderQuickSlots();
                this.notifyPlayerEquipmentChanged();
            }
            return;
        }

        if (this.selectedBagSlot?.item.itemId) {
            if (dataManager.equipItemFromActive(slot, this.selectedBagSlot.item.itemId)) {
                this.hidePopupList();
                this.clearBagSelection();
                this.refreshEquipSlots();
                this.renderQuickSlots();
                this.notifyPlayerEquipmentChanged();
            }
            return;
        }

        if (dataManager.unequipItemToActive(slot)) {
            this.hidePopupList();
            this.clearBagSelection();
            this.refreshEquipSlots();
            this.renderQuickSlots();
            this.notifyPlayerEquipmentChanged();
            return;
        }

        this.hidePopupList();
    }

    private getBagItemActions(item: ListTemplateData, slotIndex: number): BagPopupAction[] {
        return this.popup.getBagItemActions(item, slotIndex);
    }

    private showPopupList(actions: BagPopupAction[]): void {
        this.popup.show(actions);
    }

    private hidePopupList(): void {
        this.popup.hide();
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

    private resolveQuickEquipNode(): void {
        if (!this.quickEquipNode) {
            this.quickEquipNode = this.findChildByNameInsensitive(this.owner as Laya.Node, "quickbox");
        }
    }

    private resolveOrganizeButtonNode(): void {
        if (this.organizeButtonNode) {
            return;
        }

        const root = this.owner as Laya.Node;
        this.organizeButtonNode = this.findChildByNameInsensitive(root, "organizebutton")
            || this.findChildByNameInsensitive(root, "sortbutton")
            || this.findChildByName(root, "\u6574\u7406\u6309\u94ae");
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

    private getTemplateNode(listNode: Laya.Node | null): Laya.Node | null {
        const list = listNode as any;
        return (list?._templateNode as Laya.Node | null)
            || (list?.templateNode as Laya.Node | null)
            || null;
    }

    public refreshPreviewSpineWeapon(): void {
        this.previewSpine.refreshWeapon();
    }

    private notifyPlayerEquipmentChanged(): void {
        PlayerController.activeInstance?.refreshEquipmentFromData();
        Laya.timer.callLater(this, () => {
            PlayerController.activeInstance?.refreshEquipmentFromData();
        });
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

    private findChildByNameInsensitive(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        const expected = String(name || "").toLowerCase();
        const nodeName = String((root as any).name || "").toLowerCase();
        if (nodeName === expected) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (const child of children) {
            const match = this.findChildByNameInsensitive(child, name);
            if (match) {
                return match;
            }
        }

        return null;
    }

    private findDirectChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        const children = (root as any)?.children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (const child of children) {
            if (String((child as any)?.name || "") === name) {
                return child;
            }
        }

        return null;
    }

    private findFirstTextNode(root: Laya.Node | null): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ("text" in (root as any)) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (const child of children) {
            const match = this.findFirstTextNode(child);
            if (match) {
                return match;
            }
        }

        return null;
    }
}
