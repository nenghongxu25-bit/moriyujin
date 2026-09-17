const { regClass, property } = Laya;

import { DataManager, type CraftingIngredient, type CraftingRecipeDefinition, type CraftingStationId, type ItemMeta } from "../../systems/datamanager";
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

    private shuxingText: Laya.Node | null = null;

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
        this.configurePointerHandling();
        this.bindStationButtons();
        this.selectStation(this.normalizeStation(this.defaultStation));
        void this.refreshAfterDataLoad();
    }

    onEnable(): void {
        this.resolveBindings();
        this.configurePointerHandling();
        this.bindStationButtons();
        this.selectStation(this.normalizeStation(this.defaultStation));
        void this.refreshAfterDataLoad();
    }

    onDisable(): void {
        this.unbindStationButtons();
    }

    onDestroy(): void {
        this.unbindStationButtons();
    }

    private async refreshAfterDataLoad(): Promise<void> {
        await DataManager.getInstance().loadAll();
        this.currentRecipes = DataManager.getInstance().getCraftingRecipes(this.currentStation);
        if (!this.selectedRecipeId && this.currentRecipes.length > 0) {
            this.selectedRecipeId = this.currentRecipes[0].id;
        }
        this.refreshRecipeList();
        this.refreshSelectedRecipe();
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
            this.updateShuxingText(null);
            return;
        }

        if (this.recipeNameText) {
            this.recipeNameText.text = recipe.name;
        }

        this.renderInputList(recipe.inputs.map((item) => this.toInputListData(item)));
        this.renderOutputBox(this.toOutputListData(recipe));
        this.updateShuxingText(recipe);
    }

    private updateShuxingText(recipe: CraftingRecipeDefinition | null): void {
        if (!this.shuxingText) {
            return;
        }

        if (!recipe) {
            (this.shuxingText as any).text = "";
            return;
        }

        const output = recipe.output;
        const meta = DataManager.getInstance().resolveItemMeta(output.itemId);
        (this.shuxingText as any).text = this.formatItemInfo(output.name || output.itemId, output.icon || "", meta);
    }

    private formatItemInfo(fallbackName: string, fallbackIcon: string, meta: ItemMeta | null): string {
        const name = meta?.displayName || meta?.nameZh || fallbackName;
        const type = this.formatItemType(meta, fallbackIcon);

        if (this.isMeleeWeaponMeta(meta, fallbackIcon)) {
            return [
                name,
                type,
                `攻击力：${this.formatOptionalNumber(meta?.attackPower)}`,
                `攻速：${this.formatOptionalNumber(meta?.attackSpeed)}`,
                `耐久度：${this.formatOptionalNumber(meta?.durability)}`,
            ].join("\n");
        }

        if (this.isArmorMeta(meta, fallbackIcon)) {
            return [
                name,
                type,
                `防御：${this.formatOptionalNumber(meta?.defense)}`,
                `耐久度：${this.formatOptionalNumber(meta?.durability)}`,
            ].join("\n");
        }

        const effect = this.formatItemEffect(meta, fallbackIcon);
        return [name, type, effect].filter((line) => line !== "").join("\n");
    }

    private isMeleeWeaponMeta(meta: ItemMeta | null, icon: string = ""): boolean {
        const category = String(meta?.category || "").toLowerCase();
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        const iconPath = String(icon || meta?.icon || "").toLowerCase();
        return category === "weapons" && (subCategory.includes("melee") || iconPath.includes("/weapons/melees/"));
    }

    private isArmorMeta(meta: ItemMeta | null, icon: string = ""): boolean {
        const category = String(meta?.category || "").toLowerCase();
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        const iconPath = String(icon || meta?.icon || "").toLowerCase();
        return category.includes("armor")
            || category.includes("helmet")
            || category.includes("plate")
            || subCategory.includes("armor")
            || subCategory.includes("helmet")
            || subCategory.includes("head")
            || subCategory.includes("plate")
            || subCategory.includes("insert")
            || iconPath.includes("/armors/");
    }
    private formatOptionalNumber(value: unknown): string {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? String(numeric) : "";
    }
    private formatItemType(meta: ItemMeta | null, icon: string = ""): string {
        const category = String(meta?.category || "").toLowerCase();
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        const iconPath = String(icon || meta?.icon || "").toLowerCase();

        if (category === "weapons" || subCategory.includes("melee") || iconPath.includes("/weapons/") || Number.isFinite(meta?.attackPower) || Number.isFinite(meta?.attackSpeed)) {
            return "武器";
        }
        if (category.includes("helmet") || subCategory.includes("helmet") || subCategory.includes("head") || iconPath.includes("/armors/heads/")) {
            return "头盔";
        }
        if (category.includes("plate") || subCategory.includes("plate") || subCategory.includes("insert") || iconPath.includes("/armors/bodies/")) {
            return "插板";
        }
        if (category.includes("armor") || subCategory.includes("armor") || subCategory.includes("body")) {
            return "防具";
        }
        if (category === "foods" || subCategory.includes("food") || iconPath.includes("/foods/")) {
            return "食物";
        }
        if (category === "medicines" || subCategory.includes("medicine")) {
            return "药品";
        }
        if (subCategory === "basic_materials") {
            return "基础材料";
        }
        if (subCategory === "advanced_materials") {
            return "高级材料";
        }
        if (category === "materials" || subCategory.includes("material")) {
            return "材料";
        }
        if (category === "misc") {
            return "杂项";
        }

        return "未知";
    }

    private isFoodMeta(meta: ItemMeta): boolean {
        const category = String(meta.category || "").toLowerCase();
        const subCategory = String(meta.subCategory || "").toLowerCase();
        return category === "foods" || subCategory.includes("food");
    }

    private formatFoodEffect(meta: ItemMeta): string {
        const lines: string[] = [];
        if (Number.isFinite(meta.satiety)) {
            lines.push(`饱食度：${meta.satiety}`);
        }
        if (Number.isFinite(meta.hydration)) {
            lines.push(`水分值：${meta.hydration}`);
        }
        return lines.join("\n");
    }
    private formatItemEffect(meta: ItemMeta | null, icon: string = ""): string {
        if (!meta) {
            return "";
        }

        if (this.isFoodMeta(meta)) {
            return this.formatFoodEffect(meta);
        }

        if (meta.useEffect) {
            const amount = Number.isFinite(meta.useEffect.amount) ? ` ${meta.useEffect.amount}` : "";
            if (meta.useEffect.type === "healHp") {
                return `恢复生命${amount}`;
            }
            return `${meta.useEffect.type}${amount}`;
        }
        const effects: string[] = [];
        if (Number.isFinite(meta.attackPower)) {
            effects.push(`攻击 ${meta.attackPower}`);
        }
        if (Number.isFinite(meta.attackSpeed)) {
            effects.push(`攻速 ${meta.attackSpeed}`);
        }
        if (Number.isFinite(meta.defense)) {
            effects.push(`防御 ${meta.defense}`);
        }
        if (Number.isFinite(meta.durability)) {
            effects.push(`耐久 ${meta.durability}`);
        }
        if (effects.length > 0) {
            return effects.join(" / ");
        }

        return meta.description || "无";
    }
    private toInputListData(item: CraftingIngredient): ListTemplateData {
        const required = this.normalizeCount(item.count);
        const available = DataManager.getInstance().getAvailableItemCount(item.itemId);
        return {
            ...item,
            name: item.name || item.itemId,
            count: required,
            countText: `${available}/${required}`,
        };
    }

    private toOutputListData(recipe: CraftingRecipeDefinition): ListTemplateData {
        const output = recipe.output;
        const outputCount = this.normalizeCount(output.count);
        const craftableOutputCount = this.getCraftableRecipeCount(recipe.inputs) * outputCount;
        return {
            ...output,
            name: output.name || output.itemId,
            count: outputCount,
            countText: `${craftableOutputCount}/${outputCount}`,
        };
    }

    private getCraftableRecipeCount(inputs: CraftingIngredient[]): number {
        if (!inputs.length) {
            return 0;
        }

        let craftable = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < inputs.length; i++) {
            const item = inputs[i];
            const required = this.normalizeCount(item.count);
            if (!item.itemId || required <= 0) {
                return 0;
            }

            const available = DataManager.getInstance().getAvailableItemCount(item.itemId);
            craftable = Math.min(craftable, Math.floor(available / required));
        }

        return craftable === Number.MAX_SAFE_INTEGER ? 0 : Math.max(0, craftable);
    }

    private normalizeCount(count: number): number {
        return Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
    }

    private renderInputList(items: ListTemplateData[]): void {
        this.inputList?.setItems(items);
    }

    private renderOutputBox(item: ListTemplateData | null): void {
        this.outputBox?.bind(item);
    }

    private configurePointerHandling(): void {
        this.setNodeThrough(this.stationPanelNode, true);
        this.setNodeInteractive(this.recipeListNode, true);
        this.setNodeInteractive(this.inputListNode, true);
        this.setNodeInteractive(this.outputBoxNode, true);

        const buttons = this.getStationButtons();
        for (let i = 0; i < buttons.length; i++) {
            this.setNodeThrough(buttons[i].node, false);
            this.setNodeInteractive(buttons[i].node, true);
            this.setNodeInteractive(this.findDirectChildByName(buttons[i].node, "mask"), false);
        }
    }

    private setNodeThrough(node: Laya.Node | null, through: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("mouseThrough" in target) {
            target.mouseThrough = through;
        }
        if ("touchThrough" in target) {
            target.touchThrough = through;
        }
    }

    private setNodeInteractive(node: Laya.Node | null, enabled: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("mouseEnabled" in target) {
            target.mouseEnabled = enabled;
        }
        if ("touchable" in target) {
            target.touchable = enabled;
        }
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
        this.shuxingText = this.shuxingText || this.findChildByName(root, "shuxing");
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
