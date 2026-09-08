const { regClass, property } = Laya;

@regClass()
export class CloseNodeButton extends Laya.Script {
    @property(Laya.Node)
    targetNode: Laya.Node | null = null;

    @property(String)
    targetNodeName = "";

    private button!: Laya.Sprite;

    onAwake(): void {
        this.button = this.owner as Laya.Sprite;
        this.button.mouseEnabled = true;
        this.button.on(Laya.Event.CLICK, this, this.closeTarget);
    }

    onDestroy(): void {
        this.button?.off(Laya.Event.CLICK, this, this.closeTarget);
    }

    private closeTarget(): void {
        const target = this.targetNode ?? this.findTargetNode();
        if (target) {
            (target as Laya.Sprite).visible = false;
            this.closeDependentNodes(target);
        }
    }

    private closeDependentNodes(target: Laya.Node): void {
        const owner = this.owner as Laya.Node;
        const localRoot = this.getLocalRoot(target);

        this.hideNodeByName(target.parent, "node3");
        this.hideNodeByName(owner.parent, "node3");
        this.hideNodeByName(localRoot, "node3");
        this.hideNodeByName(target, "node2");
        this.hideNodeByName(target, "node3");
    }

    private findTargetNode(): Laya.Node | null {
        const owner = this.owner as Laya.Node;
        if (!this.targetNodeName) {
            return owner;
        }

        return this.findNode(owner.parent ?? Laya.stage, this.targetNodeName) ?? this.findNode(Laya.stage, this.targetNodeName);
    }

    private getLocalRoot(node: Laya.Node): Laya.Node {
        let current = node;
        while (current.parent && current.parent.name !== "UI" && current.parent.name !== "Scene2D") {
            current = current.parent;
        }

        return current;
    }

    private hideNodeByName(root: Laya.Node | null, name: string): void {
        const node = this.findNode(root, name);
        if (node) {
            (node as Laya.Sprite).visible = false;
        }
    }

    private findNode(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

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
}
