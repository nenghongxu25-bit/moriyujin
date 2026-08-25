const { regClass, property } = Laya;

export interface ListTemplateData {
    itemId?: string;
    name: string;
    count: number;
    countText?: string;
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
        const itemName = this.resolveDisplayName(itemId, data?.name);
        const countTextValue = data?.countText !== undefined ? String(data.countText) : String(data?.count ?? 0);
        const iconInput = data?.icon ? String(data.icon) : this.resolveFallbackIcon(itemId);
        const resolvedIconPath = this.resolveIconPath(iconInput, data);

        if (!iconInput) {
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

    private resolveFallbackIcon(itemId: string): string {
        const fallbackIconMap: Record<string, string> = {
            mutant_blood_1: "atlas/picture/items/misc/flood_1.png",
            mutant_blood_2: "atlas/picture/items/misc/flood_2.png",
            mutant_blood_3: "atlas/picture/items/misc/flood_3.png",
        };

        return fallbackIconMap[itemId] || "";
    }

    private resolveDisplayName(itemId: string, name?: string): string {
        const rawName = String(name || "").trim();
        const fallbackNameMap: Record<string, string> = {
            mutant_blood_1: "一阶变异血",
            mutant_blood_2: "二阶变异血",
            mutant_blood_3: "三阶变异血",
        };

        return rawName && rawName !== itemId ? rawName : (fallbackNameMap[itemId] || rawName);
    }
}
