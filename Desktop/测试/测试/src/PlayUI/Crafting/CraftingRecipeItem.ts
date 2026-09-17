const { regClass, property } = Laya;

import type { CraftingRecipeDefinition } from "../../systems/datamanager";

export type CraftingRecipeClickHandler = (recipeId: string) => void;

@regClass()
export class CraftingRecipeItem extends Laya.Script {
    @property(Laya.Text)
    public nameText: Laya.Text | null = null;

    @property(Laya.Node)
    public maskNode: Laya.Node | null = null;

    private recipeId: string = "";
    private onClickHandler: CraftingRecipeClickHandler | null = null;
    private bindingsResolved: boolean = false;

    onDisable(): void {
        this.unbindClick();
    }

    onDestroy(): void {
        this.unbindClick();
        this.onClickHandler = null;
    }

    public bind(recipe: CraftingRecipeDefinition, onClick: CraftingRecipeClickHandler, selected: boolean = false): void {
        this.resolveBindings();
        this.recipeId = recipe.id;
        this.onClickHandler = onClick;

        if (this.nameText) {
            this.nameText.text = recipe.name;
        }

        this.setSelected(selected);
        this.bindClick();
    }

    public clear(): void {
        this.recipeId = "";
        if (this.nameText) {
            this.nameText.text = "";
        }
        this.setSelected(false);
        this.unbindClick();
    }

    public setSelected(selected: boolean): void {
        this.resolveBindings();
        const mask = this.maskNode as any;
        if (!mask) {
            return;
        }

        mask.visible = !selected;
        if ("active" in mask) {
            mask.active = !selected;
        }
        if ("mouseEnabled" in mask) {
            mask.mouseEnabled = false;
        }
        if ("touchable" in mask) {
            mask.touchable = false;
        }
    }

    private bindClick(): void {
        const target = this.owner as any;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
            return;
        }

        target.mouseEnabled = true;
        target.off(Laya.Event.CLICK, this, this.handleClick);
        target.on(Laya.Event.CLICK, this, this.handleClick);
    }

    private unbindClick(): void {
        const target = this.owner as any;
        if (target && typeof target.off === "function") {
            target.off(Laya.Event.CLICK, this, this.handleClick);
        }
    }

    private handleClick(): void {
        if (this.recipeId && this.onClickHandler) {
            this.onClickHandler(this.recipeId);
        }
    }

    private resolveBindings(): void {
        if (this.bindingsResolved) {
            return;
        }

        this.nameText = this.nameText || (this.findFirstTextNode(this.owner as Laya.Node) as Laya.Text | null);
        this.maskNode = this.maskNode || this.findDirectChildByName(this.owner as Laya.Node, "mask");
        this.bindingsResolved = true;
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

    private findFirstTextNode(root: Laya.Node | null): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).text !== undefined) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findFirstTextNode(children[i]);
            if (found) {
                return found;
            }
        }

        return null;
    }
}