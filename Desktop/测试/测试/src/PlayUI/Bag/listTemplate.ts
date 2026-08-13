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

    public bindData(data: ListTemplateData | null): void {
        this.boundData = data ? { ...data } : null;

        const icon = this.gimg as any;
        const nameNode = this.nameText as any;
        const countNode = this.countText as any;
        const hasData = !!data;
        if (hasData && !data?.icon) {
            throw new Error(`[listTemplate] missing icon path for item: ${String(data?.itemId || data?.name || "unknown")}`);
        }

        const iconPath = hasData && data?.icon ? String(data.icon) : "";
        const resolvedIconPath = this.resolveIconPath(iconPath, data);
        if (hasData && !resolvedIconPath) {
            throw new Error(`[listTemplate] icon path resolve failed for item: ${String(data?.itemId || data?.name || "unknown")}`);
        }

        if (icon) {
            if ("visible" in icon) {
                (icon as any).visible = hasData;
            }

            if ("width" in icon) {
                icon.width = 65;
            }

            if ("height" in icon) {
                icon.height = 65;
            }

            if ("src" in icon) {
                icon.src = resolvedIconPath;
            }

            if ("skin" in icon && !("src" in icon)) {
                icon.skin = resolvedIconPath;
            }
        }

        if (nameNode) {
            nameNode.text = hasData ? String(data.name || "") : "";
        }

        if (countNode) {
            countNode.text = hasData ? String(data.count ?? 0) : "";
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
}
