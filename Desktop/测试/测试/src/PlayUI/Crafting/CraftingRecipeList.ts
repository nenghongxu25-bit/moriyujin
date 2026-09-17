const { regClass, property } = Laya;

import type { CraftingRecipeDefinition } from "../../systems/datamanager";
import { CraftingRecipeItem, type CraftingRecipeClickHandler } from "./CraftingRecipeItem";

@regClass()
export class CraftingRecipeList extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    public onRecipeClick: CraftingRecipeClickHandler | null = null;

    private recipes: CraftingRecipeDefinition[] = [];
    private selectedRecipeId: string = "";
    private shouldScrollTop: boolean = false;
    private virtualListEnabled: boolean = false;

    onAwake(): void {
        this.resolveBindings();
    }

    public setRecipes(recipes: CraftingRecipeDefinition[]): void {
        this.resolveBindings();
        this.recipes = Array.isArray(recipes) ? recipes.map((recipe) => ({ ...recipe })) : [];
        this.selectedRecipeId = this.recipes.length > 0 ? this.recipes[0].id : "";
        this.shouldScrollTop = true;
        this.refresh();
    }

    private refresh(): void {
        const list = this.getListRoot() as any;
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.Node) => {
            this.renderItem(index, item);
        };

        this.ensureVirtualList(list);

        if ("numItems" in list) {
            list.numItems = this.recipes.length;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        if (this.shouldScrollTop && typeof list.scrollTop === "function") {
            list.scrollTop(false);
        }
        this.shouldScrollTop = false;
    }

    private ensureVirtualList(list: any): void {
        if (this.virtualListEnabled) {
            return;
        }

        if (list && typeof list.setVirtual === "function") {
            list.setVirtual();
            this.virtualListEnabled = true;
        }
    }

    private renderItem(index: number, node: Laya.Node): void {
        const recipe = this.recipes[index] || null;
        if (!node || !recipe) {
            this.setNodeVisible(node, false);
            return;
        }

        this.setNodeVisible(node, true);
        let item = node.getComponent(CraftingRecipeItem);
        if (!item) {
            item = node.addComponent(CraftingRecipeItem);
        }

        item.bind(recipe, (recipeId: string) => {
            this.selectRecipe(recipeId);
        }, recipe.id === this.selectedRecipeId);
    }

    private selectRecipe(recipeId: string): void {
        if (!recipeId || recipeId === this.selectedRecipeId) {
            return;
        }

        this.selectedRecipeId = recipeId;
        this.refresh();

        if (this.onRecipeClick) {
            this.onRecipeClick(recipeId);
        }
    }

    private resolveBindings(): void {
        const list = this.getListRoot() as any;
        if (!this.templateNode && list) {
            this.templateNode = (list._templateNode as Laya.Node | null) || (list.templateNode as Laya.Node | null) || null;
        }
    }

    private getListRoot(): Laya.Node | null {
        return this.listNode || (this.owner as Laya.Node) || null;
    }

    private getTemplateNode(): Laya.Node | null {
        const list = this.getListRoot() as any;
        return this.templateNode || (list?._templateNode as Laya.Node | null) || (list?.templateNode as Laya.Node | null) || null;
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
