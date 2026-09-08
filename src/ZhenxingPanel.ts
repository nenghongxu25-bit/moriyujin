const { regClass } = Laya;

interface RoleListItem {
    name: string;
}

@regClass()
export class ZhenxingPanel extends Laya.Script {
    private static readonly FORMATION_SLOT_COUNT = 9;
    private static readonly MAX_FORMATION_ROLE_COUNT = 5;
    private static readonly FORMATION_ITEM_WIDTH = 150;
    private static readonly FORMATION_ITEM_HEIGHT = 150;
    private static readonly FORMATION_COLUMNS = 3;
    private static readonly FORMATION_ROW_GAP = 20;
    private static readonly FORMATION_COLUMN_GAP = 20;
    private static readonly FORMATION_PADDING_TOP = 20;
    private static readonly FORMATION_PADDING_LEFT = 20;
    private static readonly ROLE_ITEM_HEIGHT = 70;

    private playerList: Laya.GList | null = null;
    private roleList: Laya.GList | null = null;
    private formationCountText: Laya.Text | null = null;
    private removeButton: Laya.Sprite | null = null;
    private selectedRole: RoleListItem | null = null;
    private selectedSlotIndex = -1;

    private readonly formationRoles: Array<RoleListItem | null> = [
        { name: "青槐" },
        { name: "苏云澈" },
        { name: "殷青崖" },
        { name: "柳听雁" },
        { name: "燕十方" },
    ];

    private readonly allRoles: RoleListItem[] = [
        { name: "青槐" },
        { name: "苏云澈" },
        { name: "殷青崖" },
        { name: "柳听雁" },
        { name: "燕十方" },
        { name: "檀溪" },
        { name: "江晚吟" },
        { name: "铁山" },
        { name: "叶寒舟" },
        { name: "段狂生" },
        { name: "徐凌霄" },
        { name: "陆长歌" },
    ];

    onAwake(): void {
        const root = this.owner as Laya.Node;
        this.playerList = this.findNode(root, "playerlist") as Laya.GList | null;
        this.roleList = this.findNode(root, "list") as Laya.GList | null;
        this.formationCountText = this.findTextByContent(root, "可上阵人数");
        this.removeButton = this.findNode(root, "xiazhen") as Laya.Sprite | null;
        if (this.removeButton) {
            this.removeButton.visible = false;
        }

        if (this.playerList) {
            this.playerList.itemRenderer = (index: number, item: Laya.GWidget) => {
                this.renderFormationSlot(index, item);
            };
            this.playerList.numItems = ZhenxingPanel.FORMATION_SLOT_COUNT;
        }

        if (this.roleList) {
            this.roleList.itemRenderer = (index: number, item: Laya.GWidget) => {
                this.renderRoleItem(index, item);
            };
            this.roleList.numItems = this.getAvailableRoles().length;
        }

        this.updateFormationCountText();
        Laya.stage?.on(Laya.Event.CLICK, this, this.onStageClick);
    }

    onDestroy(): void {
        Laya.stage?.off(Laya.Event.CLICK, this, this.onStageClick);
    }

    private renderNameItem(item: Laya.GWidget, roleName: string): void {
        const text = item.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.text = roleName;
        }
    }

    private renderFormationSlot(index: number, item: Laya.GWidget): void {
        const roleName = this.formationRoles[index]?.name ?? "";
        const roleInfo = item.getChildByName("Sprite") as Laya.Sprite | null;

        this.renderNameItem(item, roleName);
        this.renderHighlight(item, index === this.selectedSlotIndex || !!this.selectedRole);

        if (roleInfo) {
            roleInfo.visible = roleName !== "";
        }
    }

    private renderRoleItem(index: number, item: Laya.GWidget): void {
        const role = this.getAvailableRoles()[index] ?? null;
        this.renderNameItem(item, role?.name ?? "");
        this.renderHighlight(item, !!role && role === this.selectedRole);
    }

    private onStageClick(): void {
        const stageX = Laya.stage.mouseX;
        const stageY = Laya.stage.mouseY;

        if (this.removeButton?.visible && this.isPointInNode(this.removeButton, stageX, stageY)) {
            this.removeSelectedFormationRole();
            return;
        }

        const availableRoles = this.getAvailableRoles();
        const roleIndex = this.getVerticalListIndexByStagePoint(this.roleList, stageX, stageY, availableRoles.length, ZhenxingPanel.ROLE_ITEM_HEIGHT);
        if (roleIndex !== -1) {
            const role = availableRoles[roleIndex] ?? null;
            if (role && this.selectedSlotIndex !== -1) {
                this.formationRoles[this.selectedSlotIndex] = role;
                this.selectedRole = null;
                this.selectedSlotIndex = -1;
                this.refreshLists();
                return;
            }

            this.selectedRole = role;
            this.selectedSlotIndex = -1;
            this.refreshLists();
            return;
        }

        const slotIndex = this.getFormationSlotIndexByStagePoint(stageX, stageY);
        if (slotIndex === -1) {
            this.clearSelection();
            return;
        }

        if (this.selectedRole) {
            this.formationRoles[slotIndex] = this.selectedRole;
            this.selectedRole = null;
            this.selectedSlotIndex = -1;
            this.setRemoveButtonVisible(false);
            this.refreshLists();
            return;
        }

        if (this.formationRoles[slotIndex]) {
            this.selectedSlotIndex = slotIndex;
            this.selectedRole = null;
            this.setRemoveButtonVisible(true);
            this.refreshLists();
            return;
        }

        this.clearSelection();
    }

    private refreshLists(): void {
        if (this.playerList) {
            this.playerList.numItems = ZhenxingPanel.FORMATION_SLOT_COUNT;
        }

        if (this.roleList) {
            this.roleList.numItems = this.getAvailableRoles().length;
        }

        this.updateFormationCountText();
    }

    private clearSelection(): void {
        this.selectedRole = null;
        this.selectedSlotIndex = -1;
        this.setRemoveButtonVisible(false);
        this.refreshLists();
    }

    private removeSelectedFormationRole(): void {
        if (this.selectedSlotIndex === -1 || !this.formationRoles[this.selectedSlotIndex]) {
            this.clearSelection();
            return;
        }

        this.formationRoles[this.selectedSlotIndex] = null;
        this.selectedRole = null;
        this.selectedSlotIndex = -1;
        this.setRemoveButtonVisible(false);
        this.refreshLists();
    }

    private setRemoveButtonVisible(visible: boolean): void {
        if (this.removeButton) {
            this.removeButton.visible = visible;
        }
    }

    private getAvailableRoles(): RoleListItem[] {
        return this.allRoles.filter((role) => !this.formationRoles.some((formationRole) => formationRole?.name === role.name));
    }

    private updateFormationCountText(): void {
        if (this.formationCountText) {
            this.formationCountText.text = `可上阵人数 ${this.getFormationRoleCount()}/${ZhenxingPanel.MAX_FORMATION_ROLE_COUNT}`;
        }
    }

    private getFormationRoleCount(): number {
        return this.formationRoles.filter((role) => role !== null).length;
    }

    private getFormationSlotIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.playerList;
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const x = local.x - ZhenxingPanel.FORMATION_PADDING_LEFT;
        const y = local.y - ZhenxingPanel.FORMATION_PADDING_TOP;
        if (x < 0 || y < 0) {
            return -1;
        }

        const columnStride = ZhenxingPanel.FORMATION_ITEM_WIDTH + ZhenxingPanel.FORMATION_COLUMN_GAP;
        const rowStride = ZhenxingPanel.FORMATION_ITEM_HEIGHT + ZhenxingPanel.FORMATION_ROW_GAP;
        const column = Math.floor(x / columnStride);
        const row = Math.floor(y / rowStride);
        const columnOffset = x - column * columnStride;
        const rowOffset = y - row * rowStride;
        if (column < 0 || column >= ZhenxingPanel.FORMATION_COLUMNS || columnOffset > ZhenxingPanel.FORMATION_ITEM_WIDTH || rowOffset > ZhenxingPanel.FORMATION_ITEM_HEIGHT) {
            return -1;
        }

        const index = row * ZhenxingPanel.FORMATION_COLUMNS + column;
        return index >= 0 && index < ZhenxingPanel.FORMATION_SLOT_COUNT ? index : -1;
    }

    private getVerticalListIndexByStagePoint(list: Laya.GList | null, stageX: number, stageY: number, itemCount: number, itemHeight: number): number {
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const index = Math.floor((local.y + scrollY) / itemHeight);
        return index >= 0 && index < itemCount ? index : -1;
    }

    private renderHighlight(item: Laya.GWidget, selected: boolean): void {
        let highlight = item.getChildByName("Highlight") as Laya.Sprite | null;
        if (!highlight) {
            highlight = new Laya.Sprite();
            highlight.name = "Highlight";
            item.addChild(highlight);
        } else {
            item.setChildIndex(highlight, item.numChildren - 1);
        }

        highlight.visible = selected;
        highlight.graphics.clear();
        highlight.graphics.drawRect(0, 0, item.width, item.height, "rgba(0,0,0,0)", "#f1df8a", 4);
    }

    private isPointInNode(node: Laya.Sprite | null, stageX: number, stageY: number): boolean {
        if (!node || !node.visible) {
            return false;
        }

        const point = node.localToGlobal(new Laya.Point(0, 0), true);
        return stageX >= point.x
            && stageX <= point.x + node.width
            && stageY >= point.y
            && stageY <= point.y + node.height;
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

    private findTextByContent(root: Laya.Node, content: string): Laya.Text | null {
        if (root instanceof Laya.Text && root.text.indexOf(content) !== -1) {
            return root;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findTextByContent(root.getChildAt(i), content);
            if (result) {
                return result;
            }
        }

        return null;
    }
}
