const { regClass, property } = Laya;

export interface ListTemplateData {
    itemId?: string;
    name: string;
    count: number;
    icon?: string;
}

@regClass()
export class listTemplate extends Laya.Script {
    @property(Laya.Node)
    public templateSlot: Laya.Node | null = null;

    @property(Laya.Node)
    public gimg: Laya.Node | null = null;

    @property(Laya.Node)
    public nameText: Laya.Node | null = null;

    @property(Laya.Node)
    public countText: Laya.Node | null = null;

    private boundData: ListTemplateData | null = null;
    private lastRenderSignature: string = "";
    private bindingsResolved: boolean = false;

    public bindData(data: ListTemplateData | null): void {
        this.boundData = data ? { ...data } : null;
        this.resolveRuntimeBindings();

        const icon = this.gimg as any;
        const nameNode = this.nameText as any;
        const countNode = this.countText as any;
        const hasData = !!data;

        if (!hasData) {
            if (icon && "visible" in icon) {
                icon.visible = false;
            }
            if (nameNode) {
                nameNode.text = "";
            }
            if (countNode) {
                countNode.text = "";
            }
            return;
        }

        const itemId = String(data?.itemId || "");
        const itemName = String(data?.name || "");
        const countTextValue = String(data?.count ?? 0);
        const iconInput = data?.icon ? String(data.icon) : "";
        const resolvedIconPath = this.resolveIconPath(iconInput, data);

        if (!data?.icon) {
            throw new Error(`[listTemplate] missing icon path for item: ${String(data?.itemId || data?.name || "unknown")}`);
        }

        if (!resolvedIconPath) {
            throw new Error(`[listTemplate] icon path resolve failed for item: ${String(data?.itemId || data?.name || "unknown")}`);
        }

        if (icon) {
            if ("visible" in icon) {
                icon.visible = true;
            }

            if ("width" in icon) {
                icon.width = 65;
            }

            if ("height" in icon) {
                icon.height = 65;
            }

            if ("skin" in icon) {
                icon.skin = resolvedIconPath;
            }

            if ("src" in icon) {
                icon.src = resolvedIconPath;
            }
        }

        if (nameNode) {
            nameNode.text = itemName;
        }

        if (countNode) {
            countNode.text = countTextValue;
        }

        const actualIconSrc = icon && "src" in icon ? String(icon.src || "") : "";
        const actualIconSkin = icon && "skin" in icon ? String(icon.skin || "") : "";
        const actualNameText = nameNode && "text" in nameNode ? String(nameNode.text || "") : "";
        const actualCountText = countNode && "text" in countNode ? String(countNode.text || "") : "";
        const signature = [
            itemId,
            itemName,
            countTextValue,
            resolvedIconPath,
            actualIconSrc,
            actualIconSkin,
            actualNameText,
            actualCountText,
        ].join("|");

        if (this.lastRenderSignature !== signature) {
            this.lastRenderSignature = signature;
            console.info(
                `[listTemplate] render owner=${this.ownerName()} itemId=${itemId} expectedIcon=${resolvedIconPath} actualSrc=${actualIconSrc} actualSkin=${actualIconSkin} nameText=${actualNameText} countText=${actualCountText}`,
            );
        }
    }

    public getBoundData(): ListTemplateData | null {
        return this.boundData ? { ...this.boundData } : null;
    }

    public setSelected(selected: boolean): void {
        const owner = this.owner as any;
        if (owner && "alpha" in owner) {
            owner.alpha = selected ? 0.75 : 1;
        }
    }

    private resolveRuntimeBindings(): void {
        if (this.bindingsResolved) {
            return;
        }

        const owner = this.owner as any;
        const children = owner && Array.isArray(owner.children) ? owner.children : null;
        if (!children || children.length < 4) {
            return;
        }

        if (!this.templateSlot) {
            this.templateSlot = children[0] || null;
        }
        if (!this.gimg) {
            this.gimg = children[1] || null;
        }
        if (!this.nameText) {
            this.nameText = children[2] || null;
        }
        if (!this.countText) {
            this.countText = children[3] || null;
        }

        this.bindingsResolved = !!(this.templateSlot && this.gimg && this.nameText && this.countText);
    }

    private resolveIconPath(iconPath: string, data?: ListTemplateData | null): string {
        const raw = (iconPath || "").trim();
        if (!raw) {
            return "";
        }

        const normalized = raw.replace(/^assets\//, "");
        const url = (Laya as any).URL;
        if (url && typeof url.formatURL === "function") {
            try {
                const formatted = String(url.formatURL(normalized) || "");
                if (formatted) {
                    return formatted;
                }
            } catch (error) {
                throw new Error(`[listTemplate] icon URL format failed for item: ${String(data?.itemId || data?.name || "unknown")}`);
            }
        }

        throw new Error(`[listTemplate] icon path unavailable for item: ${String(data?.itemId || data?.name || "unknown")}, path: ${normalized}`);
    }

    private ownerName(): string {
        const owner = this.owner as any;
        return owner && owner.name ? String(owner.name) : "";
    }
}