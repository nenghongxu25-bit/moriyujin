const { regClass, property } = Laya;

@regClass()
export class QuickEquipContainer extends Laya.Script {
    @property(Laya.Node)
    public quickSlot1: Laya.Node | null = null;

    @property(Laya.Node)
    public quickSlot2: Laya.Node | null = null;

    @property(Laya.Node)
    public quickSlot3: Laya.Node | null = null;

    @property(Laya.Node)
    public quickSlot4: Laya.Node | null = null;

    @property(Laya.Node)
    public weaponSlot: Laya.Node | null = null;

    @property(Laya.Node)
    public plateSlot: Laya.Node | null = null;

    @property(Laya.Node)
    public armorSlot: Laya.Node | null = null;

    public setVisible(visible: boolean): void {
        this.setNodeVisible(this.quickSlot1, visible);
        this.setNodeVisible(this.quickSlot2, visible);
        this.setNodeVisible(this.quickSlot3, visible);
        this.setNodeVisible(this.quickSlot4, visible);
        this.setNodeVisible(this.weaponSlot, visible);
        this.setNodeVisible(this.plateSlot, visible);
        this.setNodeVisible(this.armorSlot, visible);
    }

    public getQuickSlots(): Array<Laya.Node | null> {
        return [this.quickSlot1, this.quickSlot2, this.quickSlot3, this.quickSlot4];
    }

    public getEquipSlots(): Array<Laya.Node | null> {
        return [this.weaponSlot, this.plateSlot, this.armorSlot];
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            (target as any).visible = visible;
        }

        if ("active" in target) {
            target.active = visible;
        }
    }
}
