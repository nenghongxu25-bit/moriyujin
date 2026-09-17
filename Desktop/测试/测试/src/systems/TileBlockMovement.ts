export interface TileBlockMoveOptions {
    halfWidth?: number;
    footOffsetY?: number;
}

export interface TileBlockMoveResult {
    moved: boolean;
    blockLayerName: string | null;
}

export class TileBlockMovement {
    private blockLayer: any = null;
    private blockLayerOwner: Laya.Sprite | null = null;
    private warnedMissingBlockLayer: boolean = false;

    public move(sprite: Laya.Sprite, dx: number, dy: number, options: TileBlockMoveOptions = {}): TileBlockMoveResult {
        if (!this.blockLayer) {
            this.resolveBlockLayer(sprite);
        }

        const startX = sprite.x;
        const startY = sprite.y;

        const nextX = startX + dx;
        if (!this.isBlockedAt(sprite, nextX, startY, options)) {
            sprite.x = nextX;
        }

        const nextY = startY + dy;
        if (!this.isBlockedAt(sprite, sprite.x, nextY, options)) {
            sprite.y = nextY;
        }

        return {
            moved: Math.abs(sprite.x - startX) > 0.001 || Math.abs(sprite.y - startY) > 0.001,
            blockLayerName: this.blockLayerOwner ? this.blockLayerOwner.name : null,
        };
    }

    public getBlockLayerName(sprite?: Laya.Sprite): string | null {
        if (!this.blockLayer && sprite) {
            this.resolveBlockLayer(sprite);
        }

        return this.blockLayerOwner ? this.blockLayerOwner.name : null;
    }

    private isBlockedAt(sprite: Laya.Sprite, parentX: number, parentY: number, options: TileBlockMoveOptions): boolean {
        if (!this.blockLayer || !this.blockLayerOwner) {
            return false;
        }

        const parent = sprite.parent as Laya.Sprite | null;
        if (!parent) {
            return false;
        }

        const footOffsetY = Number(options.footOffsetY) || 0;
        const stagePoint = parent.localToGlobal(new Laya.Point(parentX, parentY + footOffsetY), true);
        const center = this.blockLayerOwner.globalToLocal(stagePoint, true);
        const sampleHalfWidth = Math.max(0, Number(options.halfWidth) || 0);

        return this.hasBlockTile(center.x, center.y)
            || this.hasBlockTile(center.x - sampleHalfWidth, center.y)
            || this.hasBlockTile(center.x + sampleHalfWidth, center.y);
    }

    private hasBlockTile(localX: number, localY: number): boolean {
        try {
            return !!this.blockLayer?.getCellData(localX, localY, true);
        } catch (error) {
            return false;
        }
    }

    private resolveBlockLayer(sprite: Laya.Sprite): void {
        const scene = this.resolveSceneRoot(sprite);
        const layerOwner = scene ? (this.findNodeByName(scene, "BlockLayer") || this.findNodeByName(scene, "2")) as Laya.Sprite | null : null;
        const tileMapLayerType = (Laya as any).TileMapLayer;
        const layer = layerOwner && typeof tileMapLayerType === "function"
            ? layerOwner.getComponent(tileMapLayerType)
            : null;

        if (layer) {
            this.blockLayerOwner = layerOwner;
            this.blockLayer = layer;
            return;
        }

        if (!this.warnedMissingBlockLayer) {
            this.warnedMissingBlockLayer = true;
        }
    }

    private resolveSceneRoot(sprite: Laya.Sprite): Laya.Node | null {
        let node: Laya.Node | null = sprite;
        while (node && node.parent) {
            node = node.parent;
        }

        return node;
    }

    private findNodeByName(root: Laya.Node, name: string): Laya.Node | null {
        if (root.name === name) {
            return root;
        }

        const children = root.children;
        for (let i = 0; i < children.length; i++) {
            const found = this.findNodeByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }
}
