interface PlayerBuffView {
    id: string;
    shortName: string;
    color: string;
    remainingSeconds: number;
    durationSeconds: number;
}

export class BagBuffStateController {
    public constructor(
        private readonly getStateListNode: () => Laya.Node | null,
        private readonly setStateListNode: (node: Laya.Node | null) => void,
        private readonly getRootNode: () => Laya.Node | null
    ) {
    }

    public refresh(): void {
        this.resolveBuffStateNodes();
        this.renderStateList(this.getPreviewBuffStates());
    }

    private resolveBuffStateNodes(): void {
        if (!this.getStateListNode()) {
            this.setStateListNode(this.findChildByName(this.getRootNode(), "statelist"));
        }
    }

    private getPreviewBuffStates(): PlayerBuffView[] {
        return [];
    }

    private renderStateList(buffs: PlayerBuffView[]): void {
        const list = this.getStateListNode() as any;
        if (!list) {
            return;
        }

        if ("itemRenderer" in list) {
            list.itemRenderer = (index: number, item: Laya.Node) => {
                this.renderBuffStateItem(buffs[index] || null, item);
            };
        }

        if ("numItems" in list) {
            list.numItems = buffs.length;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        this.hideUnusedBuffStateItems(buffs.length);
        Laya.timer.callLater(this, () => {
            this.renderVisibleBuffStateItems(buffs);
            this.hideUnusedBuffStateItems(buffs.length);
        });
    }

    private renderVisibleBuffStateItems(buffs: PlayerBuffView[]): void {
        const list = this.getStateListNode() as any;
        const children = list && Array.isArray(list.children) ? (list.children as Laya.Node[]) : [];
        const templateNode = this.getTemplateNode(this.getStateListNode());
        let dataIndex = 0;

        for (let i = 0; i < children.length && dataIndex < buffs.length; i++) {
            const child = children[i];
            if (!child || child === templateNode) {
                continue;
            }

            this.renderBuffStateItem(buffs[dataIndex] || null, child);
            dataIndex++;
        }
    }

    private hideUnusedBuffStateItems(visibleCount: number): void {
        const list = this.getStateListNode() as any;
        const children = list && Array.isArray(list.children) ? (list.children as Laya.Node[]) : [];
        const templateNode = this.getTemplateNode(this.getStateListNode());
        let dataIndex = 0;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child || child === templateNode) {
                this.setNodeVisible(child, false);
                continue;
            }

            this.setNodeVisible(child, dataIndex < visibleCount);
            dataIndex++;
        }
    }

    private renderBuffStateItem(buff: PlayerBuffView | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!buff);
        if (!buff) {
            return;
        }

        const backgroundNode = this.findChildByName(node, "Sprite") as any;
        this.setSpriteFillColor(backgroundNode, buff.color);

        const textNode = this.findChildByName(node, "Text") as Laya.Text | null;
        if (textNode) {
            textNode.text = buff.shortName;
        }

        const maskNode = this.findChildByName(node, "mask") as any;
        if (maskNode) {
            const ratio = Math.max(0, Math.min(1, buff.remainingSeconds / Math.max(1, buff.durationSeconds)));
            const height = Math.round(50 * ratio);
            maskNode.visible = ratio > 0;
            this.setNodeDrawHeight(maskNode, height);
            maskNode.y = 50;
        }
    }

    private setSpriteFillColor(node: any, fillColor: string): void {
        if (!node || !Array.isArray(node._gcmds)) {
            return;
        }

        for (let i = 0; i < node._gcmds.length; i++) {
            const command = node._gcmds[i];
            if (command && "fillColor" in command) {
                command.fillColor = fillColor;
            }
        }
    }

    private setNodeDrawHeight(node: any, height: number): void {
        const nextHeight = Math.max(0, height);
        if ("height" in node) {
            node.height = nextHeight;
        }

        if (!Array.isArray(node._gcmds)) {
            return;
        }

        for (let i = 0; i < node._gcmds.length; i++) {
            const command = node._gcmds[i];
            if (command && "height" in command) {
                command.height = nextHeight;
            }
        }
    }

    private getTemplateNode(listNode: Laya.Node | null): Laya.Node | null {
        const list = listNode as any;
        return list && "templateNode" in list
            ? (list.templateNode as Laya.Node | null)
            : null;
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        const rootAny = root as any;
        if (rootAny.name === name) {
            return root;
        }

        const children = rootAny.children as Laya.Node[] | undefined;
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
