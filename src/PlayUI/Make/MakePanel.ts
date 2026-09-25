const { regClass, property } = Laya;

import { DataManager, type QuickMakeRecipeDefinition } from "../../systems/datamanager";
import { glist } from "../CommonUI/glist";
import type { ListTemplateData } from "../CommonUI/listTemplate";

@regClass()
export class MakePanel extends Laya.Script {
    @property(Laya.Node)
    public outputListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public outputTemplateNode: Laya.Node | null = null;

    @property(Laya.Node)
    public inputListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public inputTemplateNode: Laya.Node | null = null;

    @property(Laya.Node)
    public makeButtonNode: Laya.Node | null = null;

    @property(Laya.Node)
    public makeButtonMaskNode: Laya.Node | null = null;

    @property(Laya.Text)
    public messageTextNode: Laya.Text | null = null;

    private outputList: glist | null = null;
    private inputList: glist | null = null;
    private recipes: QuickMakeRecipeDefinition[] = [];
    private selectedRecipeId: string = "";
    private messageFadeToken: number = 0;

    onAwake(): void {
        this.resolveBindings();
        this.bindMakeButton();
        this.refreshRecipes();
    }

    onEnable(): void {
        this.resolveBindings();
        this.bindMakeButton();
        this.refreshRecipes();
    }

    onDisable(): void {
        this.clearMessageTimers();
        this.unbindMakeButton();
    }

    onDestroy(): void {
        this.clearMessageTimers();
        this.unbindMakeButton();
    }

    public refresh(): void {
        this.refreshRecipes();
    }

    private refreshRecipes(): void {
        this.resolveBindings();
        this.recipes = this.resolveRecipes();

        if (!this.selectedRecipeId || !this.recipes.some((recipe) => recipe.id === this.selectedRecipeId)) {
            this.selectedRecipeId = this.recipes.length > 0 ? this.recipes[0].id : "";
        }

        this.renderOutputList();
        this.refreshSelectedRecipe();
    }

    private renderOutputList(): void {
        if (!this.outputList) {
            return;
        }

        this.outputList.listKey = "make-output";
        this.outputList.onSlotClick = this.onOutputSlotClick;
        this.outputList.selectionEnabled = false;
        this.outputList.setSlotCount(this.recipes.length);
        this.outputList.setItems(this.recipes.map((recipe) => this.toListData(recipe.output)));
    }

    private refreshSelectedRecipe(): void {
        const recipe = this.getSelectedRecipe();
        if (!recipe) {
            this.renderInputList([]);
            this.setMakeMaskVisible(true);
            return;
        }

        this.renderInputList(recipe.inputs.map((item) => this.toInputListData(item)));
        this.refreshMakeButtonState();
    }

    private renderInputList(items: ListTemplateData[]): void {
        if (!this.inputList) {
            return;
        }

        this.inputList.listKey = "make-input";
        this.inputList.onSlotClick = null;
        this.inputList.selectionEnabled = false;
        this.inputList.setSlotCount(items.length);
        this.inputList.setItems(items);
    }

    private refreshMakeButtonState(): void {
        const canMake = this.selectedRecipeId ? DataManager.getInstance().canQuickMakeToWarehouse(this.selectedRecipeId) : false;
        this.setMakeMaskVisible(!canMake);
    }

    private onOutputSlotClick = (_item: ListTemplateData | null, _listKey: string, slotIndex: number): void => {
        const index = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        const recipe = index >= 0 ? this.recipes[index] : null;
        if (!recipe) {
            return;
        }

        this.selectedRecipeId = recipe.id;
        this.renderOutputList();
        this.refreshSelectedRecipe();
    };

    private onMakeButtonClick = (): void => {
        if (!this.selectedRecipeId) {
            this.showMessage("\u8bf7\u9009\u62e9\u914d\u65b9");
            return;
        }

        const result = DataManager.getInstance().quickMakeToWarehouse(this.selectedRecipeId);
        this.showMessage(result.message);
        this.refreshRecipes();
    };

    private bindMakeButton(): void {
        const target = this.makeButtonNode as any;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
            return;
        }

        target.mouseEnabled = true;
        target.off(Laya.Event.CLICK, this, this.onMakeButtonClick);
        target.on(Laya.Event.CLICK, this, this.onMakeButtonClick);
    }

    private unbindMakeButton(): void {
        const target = this.makeButtonNode as any;
        if (target && typeof target.off === "function") {
            target.off(Laya.Event.CLICK, this, this.onMakeButtonClick);
        }
    }

    private setMakeMaskVisible(visible: boolean): void {
        const mask = this.makeButtonMaskNode as any;
        if (!mask) {
            return;
        }

        if ("visible" in mask) {
            mask.visible = visible;
        }
        if ("active" in mask) {
            mask.active = visible;
        }
        if ("mouseEnabled" in mask) {
            mask.mouseEnabled = false;
        }
    }

    private showMessage(text: string): void {
        if (this.messageTextNode) {
            this.messageFadeToken += 1;
            const token = this.messageFadeToken;
            this.messageTextNode.text = text;
            (this.messageTextNode as any).alpha = 1;
            this.setNodeVisible(this.messageTextNode, !!text);

            Laya.timer.clear(this, this.fadeMessage);
            Laya.timer.clear(this, this.finishMessageFade);
            Laya.Tween.clearAll(this.messageTextNode);
            Laya.timer.once(1200, this, this.fadeMessage, [token]);
        }
    }

    private clearMessageTimers(): void {
        Laya.timer.clear(this, this.fadeMessage);
        Laya.timer.clear(this, this.finishMessageFade);
        if (this.messageTextNode) {
            Laya.Tween.clearAll(this.messageTextNode);
        }
    }

    private fadeMessage(token: number): void {
        if (token !== this.messageFadeToken || !this.messageTextNode) {
            return;
        }

        Laya.Tween.clearAll(this.messageTextNode);
        Laya.Tween.to(
            this.messageTextNode as any,
            { alpha: 0 },
            450,
            undefined,
            Laya.Handler.create(this, this.finishMessageFade, [token]),
        );
    }

    private finishMessageFade(token: number): void {
        if (token !== this.messageFadeToken || !this.messageTextNode) {
            return;
        }

        this.messageTextNode.text = "";
        (this.messageTextNode as any).alpha = 1;
        this.setNodeVisible(this.messageTextNode, false);
    }

    private resolveRecipes(): QuickMakeRecipeDefinition[] {
        return DataManager.getInstance().getQuickMakeRecipes();
    }

    private getSelectedRecipe(): QuickMakeRecipeDefinition | null {
        return this.recipes.find((recipe) => recipe.id === this.selectedRecipeId) || null;
    }

    private toListData(item: { itemId: string; name?: string; count: number; icon?: string }): ListTemplateData {
        return {
            itemId: item.itemId,
            name: item.name || item.itemId,
            count: Math.max(0, Math.floor(item.count || 0)),
            icon: item.icon,
        };
    }

    private toInputListData(item: { itemId: string; name?: string; count: number; icon?: string }): ListTemplateData {
        const required = Math.max(0, Math.floor(item.count || 0));
        const available = DataManager.getInstance().getAvailableItemCount(item.itemId);
        return {
            itemId: item.itemId,
            name: item.name || item.itemId,
            count: required,
            countText: `${available}/${required}`,
            icon: item.icon,
        };
    }

    private resolveBindings(): void {
        const root = this.owner as Laya.Node;
        this.outputListNode = this.outputListNode || this.findChildByName(root, "outputlist");
        this.inputListNode = this.inputListNode || this.findChildByName(root, "inputlist");
        this.makeButtonNode = this.makeButtonNode || this.findChildByName(root, "makebutton");
        this.makeButtonMaskNode = this.makeButtonMaskNode || this.findChildByName(this.makeButtonNode, "mask");
        this.messageTextNode = this.messageTextNode || (this.findChildByName(root, "messageText") as Laya.Text | null);

        this.outputList = this.resolveGlist(this.outputListNode, this.outputTemplateNode);
        this.inputList = this.resolveGlist(this.inputListNode, this.inputTemplateNode);
    }

    private resolveGlist(node: Laya.Node | null, templateNode: Laya.Node | null): glist | null {
        if (!node) {
            return null;
        }

        let list = node.getComponent(glist);
        if (!list) {
            list = node.addComponent(glist);
        }

        list.listNode = node;
        if (templateNode) {
            list.templateNode = templateNode;
        }
        return list;
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name) {
            return root;
        }

        const children = ((root as any).children || (root as any)._children || []) as Laya.Node[];
        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
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
}
