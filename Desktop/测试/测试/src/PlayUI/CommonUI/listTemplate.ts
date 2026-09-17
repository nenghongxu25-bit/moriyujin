const { regClass, property } = Laya;
import { DataManager, type ItemMeta } from "../../systems/datamanager";

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

    @property(Laya.Node)
    public detailNode: Laya.Node | null = null;

    @property(Laya.Node)
    public detailTextNode: Laya.Node | null = null;

    private boundData: ListTemplateData | null = null;
    private bindingsResolved: boolean = false;
    private longPressToken: number = 0;
    private longPressBound: boolean = false;
    private suppressNextClick: boolean = false;
    private detailOriginalParent: Laya.Node | null = null;
    private detailOriginalChildIndex: number = -1;
    private detailOriginalX: number = 0;
    private detailOriginalY: number = 0;

    onAwake(): void {
        this.initializeIconSize();
        this.bindLongPressEvents();
        this.hideDetail();
    }

    onEnable(): void {
        this.initializeIconSize();
        this.bindLongPressEvents();
        this.hideDetail();
    }

    onDisable(): void {
        this.cancelLongPress();
        this.hideDetail();
    }

    onDestroy(): void {
        this.cancelLongPress();
        this.unbindLongPressEvents();
    }

    public bindData(data: ListTemplateData | null): void {
        this.boundData = data ? { ...data } : null;
        this.resolveRuntimeBindings();
        this.hideDetail();

        const icon = this.gimg as any;
        const nameNode = this.nameText as any;
        const countNode = this.countText as any;
        const hasData = !!data;

        this.applyIconSize(icon);

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

            this.applyIconSize(icon);

            if ("skin" in icon) {
                icon.skin = resolvedIconPath;
            }

            if ("src" in icon) {
                icon.src = resolvedIconPath;
            }

            this.applyIconSize(icon);
            Laya.timer.callLater(this, () => this.applyIconSize(icon));
        }

        if (nameNode) {
            nameNode.text = itemName;
        }

        if (countNode) {
            countNode.text = countTextValue;
        }

    }

    private initializeIconSize(): void {
        this.resolveRuntimeBindings();
        this.applyIconSize(this.gimg as any);
        Laya.timer.callLater(this, () => {
            this.resolveRuntimeBindings();
            this.applyIconSize(this.gimg as any);
        });
    }

    private applyIconSize(icon: any): void {
        if (!icon) {
            return;
        }

        if ("width" in icon) {
            icon.width = 55;
        }

        if ("height" in icon) {
            icon.height = 55;
        }

        if ("autoSize" in icon) {
            icon.autoSize = false;
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
        if (!children) {
            return;
        }

        if (!this.templateSlot) {
            this.templateSlot = this.findChildByName(this.owner as Laya.Node, "item") || children[0] || null;
        }
        if (!this.gimg) {
            this.gimg = this.findChildByName(this.owner as Laya.Node, "icon") || children[1] || null;
        }
        if (!this.nameText) {
            this.nameText = this.findChildByName(this.owner as Laya.Node, "name") || children[2] || null;
        }
        if (!this.countText) {
            this.countText = this.findChildByName(this.owner as Laya.Node, "amount") || this.findChildByName(this.owner as Laya.Node, "count") || children[3] || null;
        }
        if (!this.detailNode) {
            this.detailNode = this.findChildByName(this.owner as Laya.Node, "detail");
        }
        if (!this.detailTextNode && this.detailNode) {
            this.detailTextNode = this.findFirstTextChild(this.detailNode);
        }

        this.bindingsResolved = !!(this.templateSlot && this.gimg && this.nameText && this.countText);
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (String((root as any).name || "") === name) {
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

    private findFirstTextChild(root: Laya.Node | null): Laya.Node | null {
        if (!root) {
            return null;
        }

        const node = root as any;
        if ("text" in node) {
            return root;
        }

        const children = node.children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findFirstTextChild(children[i]);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private bindLongPressEvents(): void {
        if (this.longPressBound || !this.owner) {
            return;
        }

        const owner = this.owner as any;
        owner.mouseEnabled = true;
        owner.on("mousedown", this, this.startLongPress);
        owner.on("touchstart", this, this.startLongPress);
        owner.on("mouseup", this, this.cancelLongPress);
        owner.on("mouseout", this, this.cancelLongPress);
        owner.on("touchend", this, this.cancelLongPress);
        this.longPressBound = true;
    }

    private unbindLongPressEvents(): void {
        if (!this.longPressBound || !this.owner) {
            return;
        }

        const owner = this.owner as any;
        owner.off("mousedown", this, this.startLongPress);
        owner.off("touchstart", this, this.startLongPress);
        owner.off("mouseup", this, this.cancelLongPress);
        owner.off("mouseout", this, this.cancelLongPress);
        owner.off("touchend", this, this.cancelLongPress);
        this.longPressBound = false;
    }

    private startLongPress(): void {
        if (!this.boundData?.itemId) {
            this.hideDetail();
            return;
        }

        this.suppressNextClick = false;
        this.longPressToken++;
        const token = this.longPressToken;
        Laya.timer.clear(this, this.showDetailAfterLongPress);
        Laya.timer.once(1000, this, this.showDetailAfterLongPress, [token]);
    }

    private cancelLongPress(): void {
        this.longPressToken++;
        Laya.timer.clear(this, this.showDetailAfterLongPress);
        this.hideDetail();
    }

    private showDetailAfterLongPress(token: number): void {
        if (token !== this.longPressToken || !this.boundData?.itemId) {
            return;
        }

        this.suppressNextClick = true;
        this.showDetail();
    }

    public consumeSuppressNextClick(): boolean {
        const shouldSuppress = this.suppressNextClick;
        this.suppressNextClick = false;
        return shouldSuppress;
    }

    private showDetail(): void {
        this.resolveRuntimeBindings();
        if (!this.detailNode || !this.detailTextNode || !this.boundData?.itemId) {
            return;
        }

        const textNode = this.detailTextNode as any;
        const detailText = listTemplate.formatItemDetailText(this.boundData);
        textNode.text = detailText;
        textNode.visible = true;
        this.resizeDetailToText(detailText);

        this.moveDetailToOverlay();

        const detail = this.detailNode as any;
        detail.visible = true;
    }

    private hideDetail(): void {
        this.resolveRuntimeBindings();
        if (this.detailNode && "visible" in (this.detailNode as any)) {
            (this.detailNode as any).visible = false;
        }
        if (this.detailTextNode && "visible" in (this.detailTextNode as any)) {
            (this.detailTextNode as any).visible = false;
        }
        this.restoreDetailParent();
    }

    private resizeDetailToText(text: string): void {
        const detail = this.detailNode as any;
        const textNode = this.detailTextNode as any;
        if (!detail || !textNode) {
            return;
        }

        const paddingX = 12;
        const paddingY = 10;
        const minWidth = 80;
        const minHeight = 40;
        const maxWidth = 240;
        const fontSize = Math.max(1, Number(textNode.fontSize) || 15);
        const leading = Math.max(0, Number(textNode.leading) || 0);
        const lines = String(text || "").split(/\r?\n/);
        const longestLineLength = lines.reduce((max, line) => Math.max(max, this.getDisplayTextLength(line)), 0);
        const textWidth = Math.min(maxWidth - paddingX * 2, Math.max(1, longestLineLength * fontSize));
        const textHeight = Math.max(1, lines.length * fontSize + Math.max(0, lines.length - 1) * leading);
        const detailWidth = Math.max(minWidth, Math.ceil(textWidth + paddingX * 2));
        const detailHeight = Math.max(minHeight, Math.ceil(textHeight + paddingY * 2));

        detail.width = detailWidth;
        detail.height = detailHeight;
        if (typeof detail.size === "function") {
            detail.size(detailWidth, detailHeight);
        }

        textNode.x = paddingX;
        textNode.y = paddingY;
        textNode.width = detailWidth - paddingX * 2;
        textNode.height = detailHeight - paddingY * 2;
        if ("wordWrap" in textNode) {
            textNode.wordWrap = false;
        }
        if ("overflow" in textNode) {
            textNode.overflow = "visible";
        }

        this.redrawDetailBackground(detail, detailWidth, detailHeight);
    }

    private getDisplayTextLength(text: string): number {
        let length = 0;
        for (let i = 0; i < text.length; i++) {
            length += text.charCodeAt(i) > 255 ? 1 : 0.55;
        }

        return length;
    }

    private redrawDetailBackground(detail: any, width: number, height: number): void {
        const graphics = detail.graphics as any;
        if (graphics && typeof graphics.clear === "function" && typeof graphics.drawRect === "function") {
            graphics.clear();
            graphics.drawRect(0, 0, width, height, "#939322", "#000000");
        }

        const commands = detail._gcmds;
        if (Array.isArray(commands) && commands[0]) {
            commands[0].width = width;
            commands[0].height = height;
        }
    }

    private moveDetailToOverlay(): void {
        const owner = this.owner as any;
        const detail = this.detailNode as any;
        const overlayParent = owner?.parent?.parent as any;
        if (!owner || !detail || !overlayParent || detail.parent === overlayParent || typeof overlayParent.addChild !== "function") {
            return;
        }

        const currentParent = detail.parent as any;
        if (!currentParent) {
            return;
        }

        this.detailOriginalParent = currentParent as Laya.Node;
        this.detailOriginalChildIndex = typeof currentParent.getChildIndex === "function" ? currentParent.getChildIndex(detail) : -1;
        this.detailOriginalX = Number.isFinite(detail.x) ? detail.x : 0;
        this.detailOriginalY = Number.isFinite(detail.y) ? detail.y : 0;

        const globalPoint = typeof owner.localToGlobal === "function"
            ? owner.localToGlobal(new Laya.Point(this.detailOriginalX, this.detailOriginalY), true)
            : new Laya.Point((owner.x || 0) + this.detailOriginalX, (owner.y || 0) + this.detailOriginalY);
        const overlayPoint = typeof overlayParent.globalToLocal === "function"
            ? overlayParent.globalToLocal(globalPoint, true)
            : globalPoint;

        overlayParent.addChild(detail);
        if (typeof detail.pos === "function") {
            detail.pos(overlayPoint.x, overlayPoint.y);
        } else {
            detail.x = overlayPoint.x;
            detail.y = overlayPoint.y;
        }
    }

    private restoreDetailParent(): void {
        const detail = this.detailNode as any;
        const parent = this.detailOriginalParent as any;
        const originalIndex = this.detailOriginalChildIndex;
        const originalX = this.detailOriginalX;
        const originalY = this.detailOriginalY;
        this.detailOriginalParent = null;
        this.detailOriginalChildIndex = -1;

        if (!detail || !parent || detail.parent === parent || typeof parent.addChild !== "function") {
            return;
        }

        if (originalIndex >= 0 && typeof parent.addChildAt === "function") {
            const maxIndex = Math.max(0, parent.numChildren as number || 0);
            parent.addChildAt(detail, Math.min(originalIndex, maxIndex));
        } else {
            parent.addChild(detail);
        }

        if (typeof detail.pos === "function") {
            detail.pos(originalX, originalY);
        } else {
            detail.x = originalX;
            detail.y = originalY;
        }
    }

    public static formatItemDetailText(data: ListTemplateData | null): string {
        const itemId = String(data?.itemId || "").trim();
        const meta = itemId ? DataManager.getInstance().resolveItemMeta(itemId) : null;
        const rawName = String(data?.name || "").trim();
        const name = meta?.displayName || meta?.nameZh || (rawName && rawName !== itemId ? rawName : itemId);
        const lines: string[] = [name || "未知物品"];

        if (!meta) {
            lines.push("暂无详情");
            return lines.join("\n");
        }

        lines.push(`类型：${listTemplate.resolveStaticTypeName(meta)}`);

        if (listTemplate.isStaticWeapon(meta)) {
            lines.push(`攻击力：${listTemplate.formatStaticOptionalNumber(meta.attackPower)}`);
            lines.push(`攻速：${listTemplate.formatStaticOptionalNumber(meta.attackSpeed)}`);
            lines.push(`弹速：${listTemplate.formatStaticOptionalNumber(meta.bulletSpeed)}`);
            lines.push(`耐久：${listTemplate.formatStaticOptionalNumber(meta.durability)}`);
            return listTemplate.appendStaticDescription(lines, meta);
        }

        if (listTemplate.isStaticEquipment(meta)) {
            lines.push(`防御：${listTemplate.formatStaticOptionalNumber(meta.defense)}`);
            lines.push(`耐久：${listTemplate.formatStaticOptionalNumber(meta.durability)}`);
            return listTemplate.appendStaticDescription(lines, meta);
        }

        if (listTemplate.isStaticFood(meta) || listTemplate.isStaticMedicine(meta)) {
            if (Number.isFinite(meta.satiety)) {
                lines.push(`饱食度：${meta.satiety}`);
            }
            if (Number.isFinite(meta.hydration)) {
                lines.push(`水分值：${meta.hydration}`);
            }
            const useEffect = listTemplate.formatStaticUseEffect(meta);
            if (useEffect) {
                lines.push(useEffect);
            }
        }

        return listTemplate.appendStaticDescription(lines, meta);
    }

    private static appendStaticDescription(lines: string[], meta: ItemMeta): string {
        const description = String(meta.description || "").trim();
        if (description) {
            lines.push(description);
        }
        return lines.join("\n");
    }

    private static formatStaticUseEffect(meta: ItemMeta): string {
        const effect = meta.useEffect;
        if (!effect) {
            return "";
        }

        const amount = Number.isFinite(effect.amount) ? effect.amount : "-";
        if (effect.type === "healHp") {
            return `恢复生命：${amount}`;
        }

        return `效果：${effect.type} ${amount}`;
    }

    private static resolveStaticTypeName(meta: ItemMeta): string {
        if (listTemplate.isStaticWeapon(meta)) {
            return "武器";
        }
        if (listTemplate.isStaticEquipment(meta)) {
            return "装备";
        }
        if (listTemplate.isStaticFood(meta)) {
            return "食物";
        }
        if (listTemplate.isStaticMedicine(meta)) {
            return "药品";
        }

        const category = String(meta.category || "").toLowerCase();
        if (category === "materials") {
            return "材料";
        }
        if (category === "misc") {
            return "杂物";
        }
        return "物品";
    }

    private static isStaticWeapon(meta: ItemMeta): boolean {
        const category = String(meta.category || "").toLowerCase();
        const subCategory = String(meta.subCategory || "").toLowerCase();
        return category === "weapons"
            || subCategory.includes("weapon")
            || subCategory.includes("melee")
            || subCategory.includes("ranged")
            || Number.isFinite(meta.attackPower)
            || Number.isFinite(meta.attackSpeed);
    }

    private static isStaticEquipment(meta: ItemMeta): boolean {
        const category = String(meta.category || "").toLowerCase();
        const subCategory = String(meta.subCategory || "").toLowerCase();
        return category.includes("armor")
            || category.includes("helmet")
            || category.includes("plate")
            || subCategory.includes("armor")
            || subCategory.includes("helmet")
            || subCategory.includes("head")
            || subCategory.includes("plate")
            || subCategory.includes("insert")
            || subCategory.includes("body")
            || Number.isFinite(meta.defense);
    }

    private static isStaticFood(meta: ItemMeta): boolean {
        const category = String(meta.category || "").toLowerCase();
        const subCategory = String(meta.subCategory || "").toLowerCase();
        return category === "foods" || subCategory.includes("food");
    }

    private static isStaticMedicine(meta: ItemMeta): boolean {
        const category = String(meta.category || "").toLowerCase();
        const subCategory = String(meta.subCategory || "").toLowerCase();
        return category === "medicines" || subCategory.includes("medicine");
    }

    private static formatStaticOptionalNumber(value: number | undefined): string {
        return Number.isFinite(value) ? String(value) : "-";
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
