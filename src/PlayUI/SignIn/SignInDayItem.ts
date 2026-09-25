const { regClass, property } = Laya;

import type { SignInRewardView } from "../../systems/datamanager";

@regClass()
export class SignInDayItem extends Laya.Script {
    @property(Laya.Node)
    public iconNode: Laya.Node | null = null;

    @property(Laya.Node)
    public nameTextNode: Laya.Node | null = null;

    @property(Laya.Node)
    public amountTextNode: Laya.Node | null = null;

    @property(Laya.Node)
    public claimedMaskNode: Laya.Node | null = null;

    @property(Laya.Node)
    public lockedMaskNode: Laya.Node | null = null;

    @property(Laya.Node)
    public dayButtonNode: Laya.Node | null = null;

    private data: SignInRewardView | null = null;
    private bindingsResolved: boolean = false;

    public bind(data: SignInRewardView): void {
        this.data = { ...data };
        this.resolveBindings();

        this.setImageSource(this.iconNode, data.icon || "");
        this.setText(this.nameTextNode, data.name);
        this.setText(this.amountTextNode, String(data.count));
        this.setButtonText(this.dayButtonNode, `\u7b2c${data.day}\u5929`);

        this.setNodeVisible(this.claimedMaskNode, data.state === "claimed");
        this.setNodeVisible(this.lockedMaskNode, data.state === "locked");

        const owner = this.owner as any;
        if (owner) {
            owner.mouseEnabled = data.state === "claimable";
            owner.alpha = data.state === "claimable" ? 1 : 0.92;
        }
    }

    public getDay(): number {
        return this.data?.day || 0;
    }

    public getState(): string {
        return this.data?.state || "locked";
    }

    private resolveBindings(): void {
        if (this.bindingsResolved) {
            return;
        }

        const root = this.owner as Laya.Node;
        this.iconNode = this.iconNode || this.findChildByName(root, "icon");
        this.nameTextNode = this.nameTextNode || this.findChildByName(root, "name");
        this.amountTextNode = this.amountTextNode || this.findChildByName(root, "amount");
        this.claimedMaskNode = this.claimedMaskNode || this.findChildByName(root, "mask_1");
        this.lockedMaskNode = this.lockedMaskNode || this.findChildByName(root, "mask_0");
        this.dayButtonNode = this.dayButtonNode || this.findChildByName(root, "bt");

        this.bindingsResolved = true;
    }

    private setImageSource(node: Laya.Node | null, path: string): void {
        const target = node as any;
        if (!target) {
            return;
        }

        const resolved = this.resolveIconPath(path);
        if ("visible" in target) {
            target.visible = !!resolved;
        }
        if ("skin" in target) {
            target.skin = resolved;
        }
        if ("src" in target) {
            target.src = resolved;
        }
        if ("width" in target) {
            target.width = 72;
        }
        if ("height" in target) {
            target.height = 72;
        }
    }

    private setText(node: Laya.Node | null, text: string): void {
        const target = node as any;
        if (target && "text" in target) {
            target.text = text;
        }
    }

    private setButtonText(node: Laya.Node | null, text: string): void {
        const textNode = this.findFirstTextNode(node);
        this.setText(textNode, text);
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
