const { regClass, property } = Laya;

import { DataManager, type CraftingRecipeDefinition, type CraftingStationId } from "../../systems/datamanager";
import type { ListTemplateData } from "../CommonUI/listTemplate";
import { CraftingItemBox } from "./CraftingItemBox";
import { CraftingItemList } from "./CraftingItemList";
import { CraftingRecipeList } from "./CraftingRecipeList";

@regClass()
export class CraftingPanel extends Laya.Script {
    @property(Laya.Node)
    public stationPanelNode: Laya.Node | null = null;

    @property(Laya.Node)
    public recipeListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public inputListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public outputBoxNode: Laya.Node | null = null;

    @property(Laya.Text)
    public recipeNameText: Laya.Text | null = null;

    @property(Laya.Node)
    public campfireButton: Laya.Node | null = null;

    @property(Laya.Node)
    public pengrenjiButton: Laya.Node | null = null;

    @property(Laya.Node)
    public processingButton: Laya.Node | null = null;

    @property(Laya.Node)
    public equipmentButton: Laya.Node | null = null;

    @property(Laya.Node)
    public manufactureButton: Laya.Node | null = null;

    @property(Laya.Node)
    public medicineButton: Laya.Node | null = null;

    @property(Laya.Node)
    public advanceButton: Laya.Node | null = null;

    @property(String)
    public defaultStation: string = "campfire";

    private currentStation: CraftingStationId = "campfire";
    private currentRecipes: CraftingRecipeDefinition[] = [];
    private selectedRecipeId: string = "";
    private recipeList: CraftingRecipeList | null = null;
    private inputList: CraftingItemList | null = null;
    private outputBox: CraftingItemBox | null = null;
    private stationOpenStates: Record<CraftingStationId, boolean> = {
        campfire: true,
        pengrenji: false,
        processing: false,
        equipment: false,
        manufacture: false,
        medicine: false,
        advance: false,
    };

    onAwake(): void {
        this.resolveBindings();
        this.bindStationButtons();
        this.selectStation(this.normalizeStation(this.defaultStation));
    }

    onEnable(): void {
        this.resolveBindings();
        this.bindStationButtons();
        this.applyStationMaskVisibility();
        this.refreshRecipeList();
        this.refreshSelectedRecipe();
    }

    onDisable(): void {
        this.unbindStationButtons();
    }

    onDestroy(): void {
        this.unbindStationButtons();
    }

    public selectStation(station: CraftingStationId): void {
        this.closeStation(this.currentStation);
        this.openStation(station);
        this.applyStationMaskVisibility();

        this.currentStation = station;
        this.currentRecipes = DataManager.getInstance().getCraftingRecipes(station);
        this.selectedRecipeId = this.currentRecipes.length > 0 ? this.currentRecipes[0].id : "";
        this.refreshRecipeList();
        this.refreshSelectedRecipe();
    }

    public onPanelOpened(): void {
        this.selectStation(this.normalizeStation(this.defaultStation));
    }

    private refreshRecipeList(): void {
        if (!this.recipeList) {
            return;
        }

        this.recipeList.onRecipeClick = this.onRecipeClick;
        this.recipeList.setRecipes(this.currentRecipes);
    }

    private onRecipeClick = (recipeId: string): void => {
        this.selectedRecipeId = recipeId;
        this.refreshSelectedRecipe();
    };

    private refreshSelectedRecipe(): void {
        const recipe = this.currentRecipes.find((item) => item.id === this.selectedRecipeId) || null;
        if (!recipe) {
            if (this.recipeNameText) {
                this.recipeNameText.text = "\u8bf7\u9009\u62e9\u914d\u65b9";
            }
            this.renderInputList([]);
            this.renderOutputBox(null);
            return;
        }

        if (this.recipeNameText) {
            this.recipeNameText.text = recipe.name;
        }

        this.renderInputList(recipe.inputs.map((item) => ({ ...item, name: item.name || item.itemId })));
        this.renderOutputBox({ ...recipe.output, name: recipe.output.name || recipe.output.itemId });
    }

    private renderInputList(items: ListTemplateData[]): void {
        this.inputList?.setItems(items);
    }

    private renderOutputBox(item: ListTemplateData | null): void {
        this.outputBox?.bind(item);
    }

    private bindStationButtons(): void {
        const buttons = this.getStationButtons();
        for (let i = 0; i < buttons.length; i++) {
            const entry = buttons[i];
            const target = entry.node as any;
            if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
                continue;
            }

            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onStationClick);
            target.on(Laya.Event.CLICK, this, this.onStationClick, [entry.station]);
        }
    }

    private unbindStationButtons(): void {
        const buttons = this.getStationButtons();
        for (let i = 0; i < buttons.length; i++) {
            const target = buttons[i].node as any;
            if (target && typeof target.off === "function") {
                target.off(Laya.Event.CLICK, this, this.onStationClick);
            }
        }
    }

    private onStationClick(station: CraftingStationId): void {
        this.selectStation(station);
    }

    private closeStation(station: CraftingStationId): void {
        this.stationOpenStates[station] = false;
    }

    private openStation(station: CraftingStationId): void {
        this.stationOpenStates[station] = true;
    }

    private applyStationMaskVisibility(): void {
        const buttons = this.getStationButtons();
        for (let i = 0; i < buttons.length; i++) {
            const entry = buttons[i];
            const mask = this.findDirectChildByName(entry.node, "mask") as any;
            if (!mask || !("visible" in mask)) {
                continue;
            }

            mask.visible = !this.stationOpenStates[entry.station];
        }
    }

    private getStationButtons(): Array<{ station: CraftingStationId; node: Laya.Node | null }> {
        return [
            { station: "campfire", node: this.campfireButton },
            { station: "pengrenji", node: this.pengrenjiButton },
            { station: "processing", node: this.processingButton },
            { station: "equipment", node: this.equipmentButton },
            { station: "manufacture", node: this.manufactureButton },
            { station: "medicine", node: this.medicineButton },
            { station: "advance", node: this.advanceButton },
        ];
    }

    private resolveBindings(): void {
        const root = this.owner as Laya.Node;
        this.stationPanelNode = this.stationPanelNode || this.findChildByName(root, "panel");
        this.recipeNameText = this.recipeNameText || (this.findChildByName(root, "recipeName") as Laya.Text | null);
        this.outputBoxNode = this.outputBoxNode || this.findChildByName(root, "outputbox");

        const detailPanel = this.findChildByName(root, "detailPanel");
        const lists = this.findChildrenByType(detailPanel, "GList");
        this.inputListNode = this.inputListNode || lists[0] || null;
        this.recipeListNode = this.recipeListNode || lists[1] || null;
        this.recipeList = this.resolveRecipeList(this.recipeListNode);
        this.inputList = this.resolveItemList(this.inputListNode);
        this.outputBox = this.resolveItemBox(this.outputBoxNode);

        this.campfireButton = this.campfireButton || this.findChildByName(this.stationPanelNode, "campfire");
        this.pengrenjiButton = this.pengrenjiButton || this.findChildByName(this.stationPanelNode, "pengrenji");
        this.processingButton = this.processingButton || this.findChildByName(this.stationPanelNode, "processing");
        this.equipmentButton = this.equipmentButton || this.findChildByName(this.stationPanelNode, "equipment");
        this.manufactureButton = this.manufactureButton || this.findChildByName(this.stationPanelNode, "manufacture");
        this.medicineButton = this.medicineButton || this.findChildByName(this.stationPanelNode, "medicine");
        this.advanceButton = this.advanceButton || this.findChildByName(this.stationPanelNode, "advance");
    }

    private resolveRecipeList(node: Laya.Node | null): CraftingRecipeList | null {
        if (!node) {
            return null;
        }

        let list = node.getComponent(CraftingRecipeList);
        if (!list) {
            list = node.addComponent(CraftingRecipeList);
        }
        return list;
    }

    private resolveItemList(node: Laya.Node | null): CraftingItemList | null {
        if (!node) {
            return null;
        }

        let list = node.getComponent(CraftingItemList);
        if (!list) {
            list = node.addComponent(CraftingItemList);
        }
        return list;
    }

    private resolveItemBox(node: Laya.Node | null): CraftingItemBox | null {
        if (!node) {
            return null;
        }

        let box = node.getComponent(CraftingItemBox);
        if (!box) {
            box = node.addComponent(CraftingItemBox);
        }
        return box;
    }

    private normalizeStation(value: string): CraftingStationId {
        const station = String(value || "").trim() as CraftingStationId;
        const valid: CraftingStationId[] = ["campfire", "pengrenji", "processing", "equipment", "manufacture", "medicine", "advance"];
        return valid.indexOf(station) >= 0 ? station : "campfire";
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

    private findDirectChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        const children = root && Array.isArray((root as any).children)
            ? ((root as any).children as Laya.Node[])
            : [];

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child && (child as any).name === name) {
                return child;
            }
        }

        return null;
    }

    private findChildrenByType(root: Laya.Node | null, type: string): Laya.Node[] {
        const found: Laya.Node[] = [];
        this.collectChildrenByType(root, type, found);
        return found;
    }

    private collectChildrenByType(root: Laya.Node | null, type: string, found: Laya.Node[]): void {
        if (!root) {
            return;
        }

        if ((root as any).constructor?.name === type || (root as any)._$type === type) {
            found.push(root);
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return;
        }

        for (let i = 0; i < children.length; i++) {
            this.collectChildrenByType(children[i], type, found);
        }
    }

}
