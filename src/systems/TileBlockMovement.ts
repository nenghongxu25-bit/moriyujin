import { DepthObstacle } from "./DepthObstacle";
import { ForestRiver } from "./ForestRiver";

export interface TileBlockMoveOptions {
    halfWidth?: number;
    halfDepth?: number;
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

    /** Read-only line test for sensing/melee; does not move the actor or change existing movement behavior. */
    public canTraverse(sprite: Laya.Sprite, toX: number, toY: number, options: TileBlockMoveOptions = {}): boolean {
        if (!this.blockLayer) this.resolveBlockLayer(sprite);
        const steps = Math.max(1, Math.ceil(Math.hypot(toX - sprite.x, toY - sprite.y) / 8));
        let x = sprite.x, y = sprite.y;
        for (let i = 1; i <= steps; i++) {
            const nextX = sprite.x + (toX - sprite.x) * i / steps;
            const nextY = sprite.y + (toY - sprite.y) * i / steps;
            if (this.isBlockedAt(sprite, nextX, nextY, options) || DepthObstacle.blocksMove(sprite,
                x, y, nextX, nextY, Number(options.footOffsetY) || 0, Math.max(0, Number(options.halfWidth) || 0), Math.max(0, Number(options.halfDepth) || 0)) ||
                ForestRiver.blocksMove(sprite, x, y, nextX, nextY, Number(options.footOffsetY) || 0,
                    Math.max(0, Number(options.halfWidth) || 0), Math.max(0, Number(options.halfDepth) || 0))) return false;
            x = nextX; y = nextY;
        }
        return true;
    }

    public move(sprite: Laya.Sprite, dx: number, dy: number, options: TileBlockMoveOptions = {}): TileBlockMoveResult {
        if (!this.blockLayer) {
            this.resolveBlockLayer(sprite);
        }

        const startX = sprite.x;
        const startY = sprite.y;

        const nextX = startX + dx;
        if (!this.isBlockedAt(sprite, nextX, startY, options) && !DepthObstacle.blocksMove(sprite,
            startX, startY, nextX, startY, Number(options.footOffsetY) || 0, Math.max(0, Number(options.halfWidth) || 0), Math.max(0, Number(options.halfDepth) || 0)) &&
            !ForestRiver.blocksMove(sprite, startX, startY, nextX, startY, Number(options.footOffsetY) || 0,
                Math.max(0, Number(options.halfWidth) || 0), Math.max(0, Number(options.halfDepth) || 0))) {
            sprite.x = nextX;
        }

        const nextY = startY + dy;
        if (!this.isBlockedAt(sprite, sprite.x, nextY, options) && !DepthObstacle.blocksMove(sprite,
            sprite.x, startY, sprite.x, nextY, Number(options.footOffsetY) || 0, Math.max(0, Number(options.halfWidth) || 0), Math.max(0, Number(options.halfDepth) || 0)) &&
            !ForestRiver.blocksMove(sprite, sprite.x, startY, sprite.x, nextY, Number(options.footOffsetY) || 0,
                Math.max(0, Number(options.halfWidth) || 0), Math.max(0, Number(options.halfDepth) || 0))) {
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
        const sampleHalfWidth = Math.max(0, Number(options.halfWidth) || 0);
        const sampleHalfDepth = Math.max(0, Number(options.halfDepth) || 0);
        const hit=(dx:number,dy:number)=>{
            const p=parent.localToGlobal(new Laya.Point(parentX+dx,parentY+footOffsetY+dy),false);
            this.blockLayerOwner.globalToLocal(p,false);
            return this.hasBlockTile(p.x,p.y);
        };
        if(hit(0,0))return true;
        for(let i=0;i<8;i++)if(hit(Math.cos(i*Math.PI/4)*sampleHalfWidth,Math.sin(i*Math.PI/4)*sampleHalfDepth))return true;
        return false;
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
