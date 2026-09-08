import { MapNode, TANYUN_WORLD_MAP } from "./MapData";
import { GlobalBroadcast } from "./GlobalBroadcast";

const { regClass } = Laya;

@regClass()
export class MapScene extends Laya.Script {
    private sceneRoot: Laya.Node | null = null;
    private currentMap: MapNode = TANYUN_WORLD_MAP;
    private list: Laya.GList | null = null;
    private title: Laya.Text | null = null;
    private backButton: Laya.Sprite | null = null;
    private uiRoot: Laya.Sprite | null = null;
    private drawerControls: Laya.Sprite | null = null;
    private drawerHead: Laya.Sprite | null = null;
    private rolePanel: Laya.Sprite | null = null;
    private bagPanel: Laya.Sprite | null = null;
    private formationPanel: Laya.Sprite | null = null;
    private mapPanels = new Map<string, Laya.Sprite>();
    private mapHistory: MapNode[] = [];
    private drawerButtons: Laya.Sprite[] = [];
    private drawerOpen = false;
    private drawerAnimating = false;
    private skipStageClick = false;
    private drawerHeadClosedX = 0;
    private drawerHeadOpenX = 0;
    private drawerHeadInitialScaleX = 1;
    private readonly drawerButtonLabels = ["角色", "背包", "阵型", "菜单"];
    private readonly drawerButtonNames = ["MapDrawerButtonRole", "MapDrawerButtonBag", "MapDrawerButtonFormation", "MapDrawerButtonMenu"];
    private readonly drawerButtonWidth = 86;
    private readonly drawerButtonHeight = 44;
    private readonly drawerButtonGap = 8;
    private readonly drawerHeadTravel = 420;
    private readonly placeItemWidth = 238;
    private readonly placeItemHeight = 220;
    private readonly placeListColumns = 4;
    private readonly placeListPadding = 28;
    private readonly placeListGap = 28;

    onAwake(): void {
        const root = this.owner as Laya.Node;
        this.sceneRoot = root;
        this.list = this.findNode(root, "placeList") as Laya.GList | null;
        this.title = this.findNode(root, "Title") as Laya.Text | null;
        this.backButton = this.findBackButton(root);
        this.uiRoot = this.findNode(root, "UI") as Laya.Sprite | null;
        this.drawerHead = this.findDrawerNode("mapDrawerHead") as Laya.Sprite | null;
        this.rolePanel = this.findNode(root, "role") as Laya.Sprite | null;
        this.bagPanel = this.findNode(root, "bag") as Laya.Sprite | null;
        this.formationPanel = this.findNode(root, "zhenxing") as Laya.Sprite | null;
        this.mapPanels = this.findMapPanels(root);
        if (this.uiRoot) {
            (this.uiRoot as any).mouseThrough = true;
        }
        if (this.rolePanel) {
            this.rolePanel.visible = false;
        }
        if (this.bagPanel) {
            this.bagPanel.visible = false;
        }
        if (this.formationPanel) {
            this.formationPanel.visible = false;
        }
        this.mapPanels.forEach((panel) => {
            panel.visible = false;
        });
        this.setupDrawer();
        this.setupBackButton();

        if (!this.list) {
            return;
        }

        this.list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.renderMapItem(index, item);
        };
        this.renderCurrentMap();
        Laya.stage?.on(Laya.Event.CLICK, this, this.onStageClick);
        Laya.stage?.on(Laya.Event.MOUSE_WHEEL, this, this.onStageWheel);
    }

    onDestroy(): void {
        Laya.stage?.off(Laya.Event.CLICK, this, this.onStageClick);
        Laya.stage?.off(Laya.Event.MOUSE_WHEEL, this, this.onStageWheel);
        this.backButton?.off(Laya.Event.CLICK, this, this.goBack);
        this.drawerHead?.off(Laya.Event.CLICK, this, this.toggleDrawer);
        for (const button of this.drawerButtons) {
            button.offAll(Laya.Event.CLICK);
            Laya.Tween.clearAll(button);
        }
    }

    private renderCurrentMap(): void {
        if (this.title) {
            this.title.text = this.currentMap.name;
        }

        if (this.list) {
            this.list.numItems = this.currentItems.length;
        }

        this.updateBackButtonVisible();
    }

    private renderMapItem(index: number, item: Laya.GWidget): void {
        const data = this.currentItems[index];
        const image = item.getChildByName("placeImage") as Laya.GImage | null;
        const textRoot = item.getChildByName("placeText") as Laya.GWidget | null;

        if (image) {
            image.src = data.image ?? "";
            image.grayed = !data.enabled;
        }

        item.off(Laya.Event.CLICK, this, this.onItemClick);
        item.on(Laya.Event.CLICK, this, this.onItemClick, [data]);
        item.grayed = !data.enabled;
        item.mouseEnabled = data.enabled;

        if (!textRoot) {
            return;
        }

        for (let i = 0; i < textRoot.numChildren; i++) {
            const charText = textRoot.getChildAt(i) as Laya.Text;
            if (!(charText instanceof Laya.Text)) {
                continue;
            }

            charText.text = data.name[i] ?? "";
            charText.visible = i < data.name.length;
        }
    }

    private onItemClick(data: MapNode): void {
        this.skipStageClick = true;
        if (!data.enabled) {
            return;
        }

        const panel = this.mapPanels.get(data.id);
        if (panel) {
            this.showPanel(panel);
            GlobalBroadcast.show(`进入${data.name}`);
            return;
        }

        if (!data.enabled || !data.children || data.children.length === 0) {
            return;
        }

        this.mapHistory.push(this.currentMap);
        this.currentMap = data;
        this.closeOpenPanels();
        this.renderCurrentMap();
        GlobalBroadcast.show(`进入${data.name}`);
    }

    private get currentItems(): MapNode[] {
        return this.currentMap.children ?? [];
    }

    private setupDrawer(): void {
        const head = this.drawerHead;
        const sourceParent = head?.parent as Laya.Sprite | null;
        if (!head || !sourceParent) {
            return;
        }

        this.drawerControls = sourceParent;
        head.mouseEnabled = true;
        this.drawerHeadClosedX = head.x;
        this.drawerHeadOpenX = head.x - this.drawerHeadTravel;
        this.drawerHeadInitialScaleX = head.scaleX || 1;
        head.on(Laya.Event.CLICK, this, this.toggleDrawer);
        this.drawerButtons = this.drawerButtonNames
            .map((name, index) => this.setupDrawerButton(sourceParent, name, this.drawerButtonLabels[index], index))
            .filter((button): button is Laya.Sprite => !!button);
        this.bringDrawerControlsToTop();
        this.setDrawer(false, true);
    }

    private setupBackButton(): void {
        if (!this.backButton) {
            return;
        }

        this.backButton.mouseEnabled = true;
        this.backButton.on(Laya.Event.CLICK, this, this.goBack);
        this.updateBackButtonVisible();
    }

    private goBack(): void {
        this.skipStageClick = true;
        const previousMap = this.mapHistory.pop();
        if (!previousMap) {
            return;
        }

        this.currentMap = previousMap;
        this.closeOpenPanels();
        this.renderCurrentMap();
        GlobalBroadcast.show(`返回${this.currentMap.name}`);
    }

    private toggleDrawer(): void {
        if (this.drawerAnimating) {
            return;
        }

        this.skipStageClick = true;
        this.bringDrawerControlsToTop();
        this.setDrawer(!this.drawerOpen, false);
    }

    private setDrawer(open: boolean, immediate: boolean): void {
        const head = this.drawerHead;
        if (!head) {
            return;
        }

        this.drawerOpen = open;
        this.drawerAnimating = !immediate;
        Laya.Tween.clearAll(head);
        this.drawerButtons.forEach((button) => Laya.Tween.clearAll(button));

        if (immediate) {
            head.x = open ? this.drawerHeadOpenX : this.drawerHeadClosedX;
            head.scaleX = this.getDrawerHeadScaleX(open);
            this.layoutDrawerButtons(open, true);
            this.drawerAnimating = false;
            return;
        }

        if (open) {
            Laya.Tween.to(
                head,
                { x: this.drawerHeadOpenX },
                220,
                null,
                Laya.Handler.create(this, () => {
                    head.scaleX = this.getDrawerHeadScaleX(true);
                    this.layoutDrawerButtons(true, false, () => {
                        this.drawerAnimating = false;
                    });
                })
            );
            return;
        }

        this.layoutDrawerButtons(false, false, () => {
            Laya.Tween.to(
                head,
                { x: this.drawerHeadClosedX },
                220,
                null,
                Laya.Handler.create(this, () => {
                    head.scaleX = this.getDrawerHeadScaleX(false);
                    this.drawerAnimating = false;
                })
            );
        });
    }

    private setupDrawerButton(sourceParent: Laya.Sprite, name: string, label: string, index: number): Laya.Sprite | null {
        const head = this.drawerHead as Laya.Sprite;
        const button = (
            sourceParent.getChildByName(name) ??
            this.findDrawerNode(name)
        ) as Laya.Sprite | null;
        if (!button) {
            console.warn(`Missing map drawer button in scene: ${name}`);
            return null;
        }

        button.width = this.drawerButtonWidth;
        button.height = this.drawerButtonHeight;
        button.x = head.x + 16;
        button.y = head.y + 3;
        button.alpha = 0;
        button.visible = false;
        button.mouseEnabled = true;
        this.drawDrawerButton(button, label, false);
        button.on(Laya.Event.MOUSE_OVER, this, () => this.drawDrawerButton(button, label, true));
        button.on(Laya.Event.MOUSE_OUT, this, () => this.drawDrawerButton(button, label, false));
        button.on(Laya.Event.CLICK, this, () => this.onDrawerButtonClick(index));
        return button;
    }

    private layoutDrawerButtons(open: boolean, immediate: boolean, onComplete?: () => void): void {
        const head = this.drawerHead;
        if (!head) {
            return;
        }

        if (this.drawerButtons.length === 0) {
            onComplete?.();
            return;
        }

        let completed = 0;
        const completeOne = () => {
            completed += 1;
            if (completed >= this.drawerButtons.length) {
                onComplete?.();
            }
        };

        this.drawerButtons.forEach((button, index) => {
            const targetX = open
                ? head.x + 48 + (this.drawerButtonWidth + this.drawerButtonGap) * index
                : head.x + 16;
            const targetAlpha = open ? 1 : 0;
            button.visible = true;
            Laya.Tween.clearAll(button);

            if (immediate) {
                button.x = targetX;
                button.alpha = targetAlpha;
                button.visible = open;
                completeOne();
                return;
            }

            Laya.Tween.to(
                button,
                { x: targetX, alpha: targetAlpha },
                160,
                null,
                Laya.Handler.create(this, () => {
                    if (!open) {
                        button.visible = false;
                    }

                    completeOne();
                }),
                open ? index * 45 : (this.drawerButtons.length - index - 1) * 35
            );
        });
    }

    private getDrawerHeadScaleX(open: boolean): number {
        return open ? -this.drawerHeadInitialScaleX : this.drawerHeadInitialScaleX;
    }

    private drawDrawerButton(button: Laya.Sprite, label: string, active: boolean): void {
        button.graphics.clear();
        button.graphics.drawRect(0, 0, this.drawerButtonWidth, this.drawerButtonHeight, active ? "#3f5a4d" : "#1f2f2a", "#d6c276", 2);

        const text = button.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.width = this.drawerButtonWidth;
            text.height = this.drawerButtonHeight;
            text.fontSize = 20;
            text.color = "#f6e7b2";
            text.bold = true;
            text.align = "center";
            text.valign = "middle";
            text.text = label;
        }
    }

    private onDrawerButtonClick(index: number): void {
        this.skipStageClick = true;
        this.bringDrawerControlsToTop();
        if (index === 0) {
            this.showPanel(this.rolePanel);
            return;
        }

        if (index === 1) {
            this.showPanel(this.bagPanel);
            return;
        }

        if (index === 2) {
            this.showPanel(this.formationPanel);
            return;
        }

        const label = this.drawerButtonLabels[index] ?? "";
        console.log(`Map drawer button clicked: ${label}`);
    }

    private onStageClick(): void {
        if (this.skipStageClick) {
            this.skipStageClick = false;
            return;
        }

        if (this.handleDrawerStageClick(Laya.stage.mouseX, Laya.stage.mouseY)) {
            return;
        }

        if (this.isBlockingPanelOpen()) {
            return;
        }

        const stageX = Laya.stage.mouseX;
        const stageY = Laya.stage.mouseY;
        const itemIndex = this.getPlaceItemIndexByStagePoint(stageX, stageY);
        if (itemIndex === -1) {
            return;
        }

        const data = this.currentItems[itemIndex];
        if (data) {
            this.onItemClick(data);
        }
    }

    private onStageWheel(event: Laya.Event): void {
        if (this.isBlockingPanelOpen()) {
            return;
        }

        const list = this.list;
        const scroller = list?.scroller;
        if (!list || !scroller || !this.isPointInNode(list, Laya.stage.mouseX, Laya.stage.mouseY)) {
            return;
        }

        const direction = event.delta > 0 ? -1 : 1;
        const step = this.placeItemHeight + this.placeListGap;
        const maxY = Math.max(0, scroller.contentHeight - list.height);
        const nextY = Math.max(0, Math.min(maxY, scroller.posY + direction * step));
        scroller.setPosY(nextY, false);
    }

    private handleDrawerStageClick(stageX: number, stageY: number): boolean {
        if (this.drawerOpen) {
            for (let i = this.drawerButtons.length - 1; i >= 0; i--) {
                const button = this.drawerButtons[i];
                if (button.visible && this.isPointInNode(button, stageX, stageY)) {
                    this.onDrawerButtonClick(i);
                    return true;
                }
            }
        }

        if (this.isPointInNode(this.drawerHead, stageX, stageY)) {
            this.toggleDrawer();
            return true;
        }

        return false;
    }

    private getPlaceItemIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.list;
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const x = local.x - this.placeListPadding;
        const y = local.y + scrollY - this.placeListPadding;
        if (x < 0 || y < 0) {
            return -1;
        }

        const columnStride = this.placeItemWidth + this.placeListGap;
        const rowStride = this.placeItemHeight + this.placeListGap;
        const column = Math.floor(x / columnStride);
        const row = Math.floor(y / rowStride);
        const columnOffset = x - column * columnStride;
        const rowOffset = y - row * rowStride;
        if (column < 0 || column >= this.placeListColumns || columnOffset > this.placeItemWidth || rowOffset > this.placeItemHeight) {
            return -1;
        }

        const itemIndex = row * this.placeListColumns + column;
        return itemIndex >= 0 && itemIndex < this.currentItems.length ? itemIndex : -1;
    }

    private showPanel(panel: Laya.Sprite | null): void {
        if (!panel) {
            return;
        }

        this.closeOpenPanels(panel);
        panel.visible = true;
        this.bringPanelGroupToTop(panel);
        const parent = panel.parent;
        if (parent) {
            parent.setChildIndex(panel, parent.numChildren - 1);
        }
        this.bringDrawerControlsToTop();
    }

    private closeOpenPanels(exceptPanel: Laya.Sprite | null = null): void {
        for (const panel of this.getManagedPanels()) {
            if (panel && panel !== exceptPanel) {
                panel.visible = false;
            }
        }
    }

    private getManagedPanels(): Array<Laya.Sprite | null> {
        return [
            this.rolePanel,
            this.bagPanel,
            this.formationPanel,
            ...this.mapPanels.values()
        ];
    }

    private bringPanelGroupToTop(panel: Laya.Sprite): void {
        const group = this.getDirectChildUnder(panel, this.uiRoot);
        const parent = group?.parent;
        if (!group || !parent) {
            return;
        }

        parent.setChildIndex(group, parent.numChildren - 1);
    }

    private isBlockingPanelOpen(): boolean {
        return !!(this.rolePanel?.visible || this.bagPanel?.visible || this.formationPanel?.visible || this.hasOpenMapPanel());
    }

    private findMapPanels(root: Laya.Node): Map<string, Laya.Sprite> {
        const panels = new Map<string, Laya.Sprite>();
        for (const id of this.getMapLocationIds(TANYUN_WORLD_MAP)) {
            const panel = this.findNode(root, id) as Laya.Sprite | null;
            if (panel) {
                panels.set(id, panel);
            }
        }

        return panels;
    }

    private findBackButton(root: Laya.Node): Laya.Sprite | null {
        const mapRoot = this.findNode(root, "MapRoot");
        const button = mapRoot ? this.findDirectChild(mapRoot, "Sprite") : null;
        return button as Laya.Sprite | null;
    }

    private findDrawerNode(name: string): Laya.Node | null {
        const root = this.uiRoot ?? this.sceneRoot;
        if (!root) {
            return null;
        }

        return this.findNodeSkipping(root, name, new Set(["MapPanels", "SystemPanels"]));
    }

    private getDirectChildUnder(node: Laya.Node, ancestor: Laya.Node | null): Laya.Node | null {
        if (!ancestor) {
            return null;
        }

        let current: Laya.Node | null = node;
        let previous: Laya.Node | null = null;
        while (current && current !== ancestor) {
            previous = current;
            current = current.parent;
        }

        return current === ancestor ? previous : null;
    }

    private bringDrawerControlsToTop(): void {
        const controls = this.drawerControls;
        const parent = controls?.parent;
        if (!controls || !parent) {
            return;
        }

        controls.visible = true;
        controls.mouseEnabled = true;
        (controls as any).mouseThrough = true;
        if (this.drawerHead) {
            this.drawerHead.visible = true;
            this.drawerHead.mouseEnabled = true;
        }

        controls.zOrder = 10000;
        parent.setChildIndex(controls, parent.numChildren - 1);
    }

    private updateBackButtonVisible(): void {
        if (this.backButton) {
            this.backButton.visible = this.mapHistory.length > 0;
        }
    }

    private getMapLocationIds(node: MapNode): string[] {
        const ids = node.type === "location" ? [node.id] : [];
        for (const child of node.children ?? []) {
            ids.push(...this.getMapLocationIds(child));
        }

        return ids;
    }

    private hasOpenMapPanel(): boolean {
        for (const panel of this.mapPanels.values()) {
            if (panel.visible) {
                return true;
            }
        }

        return false;
    }

    private isPointInNode(node: Laya.Sprite | null, stageX: number, stageY: number): boolean {
        if (!node?.visible) {
            return false;
        }

        const point = node.localToGlobal(new Laya.Point(0, 0), true);
        return stageX >= point.x
            && stageX <= point.x + node.width
            && stageY >= point.y
            && stageY <= point.y + node.height;
    }

    private findNodeSkipping(root: Laya.Node, name: string, skipNames: Set<string>): Laya.Node | null {
        if (skipNames.has(root.name)) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findNodeSkipping(root.getChildAt(i), name, skipNames);
            if (result) {
                return result;
            }
        }

        return null;
    }

    private findNode(root: Laya.Node, name: string): Laya.Node | null {
        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findNode(root.getChildAt(i), name);
            if (result) {
                return result;
            }
        }

        return null;
    }

    private findDirectChild(root: Laya.Node, name: string): Laya.Node | null {
        for (let i = 0; i < root.numChildren; i++) {
            const child = root.getChildAt(i);
            if (child.name === name) {
                return child;
            }
        }

        return null;
    }
}
