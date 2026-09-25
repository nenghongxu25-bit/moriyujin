const { regClass, property } = Laya;

/** Editor folders are flattened at runtime so existing sibling depth sorting works. */
@regClass("b12949e1-407e-4c07-8171-35559e231554")
export class ActorLayerGroups extends Laya.Script {
    @property({ type: String, caption: "分类节点（逗号分隔）" })
    public groupNames = "Characters,Enemies,Pines,Oaks,Rocks,Branches,Bushes,Mounds,Devices,Walls,Containers,Props";

    onAwake(): void {
        const layer = this.owner as Laya.Sprite;
        let moved = 0;
        for (const name of this.groupNames.split(",").map(s => s.trim()).filter(Boolean)) {
            const group = layer.getChildByName(name) as Laya.Sprite;
            if (!group) continue;
            // These are organizational folders, not transformed gameplay objects.
            if (group.rotation || group.skewX || group.skewY || group.pivotX || group.pivotY ||
                group.scaleX !== 1 || group.scaleY !== 1) {
                console.error(`[ActorLayerGroups] ${name}: keep folder scale=1, rotation/pivot/skew=0.`);
                continue;
            }
            while (group.numChildren > 0) {
                const child = group.getChildAt(0) as Laya.Sprite;
                const x = child.x + group.x, y = child.y + group.y;
                const visible = child.visible && group.visible;
                const active = child.active && group.active;
                child.pos(x, y);
                child.visible = visible;
                child.active = active;
                child.alpha *= group.alpha;
                layer.addChild(child);
                moved++;
            }
        }
        console.info(`[ActorLayerGroups] ${this.owner.scene?.url || "scene"}: expanded ${moved} entities for depth sorting.`);
    }
}
