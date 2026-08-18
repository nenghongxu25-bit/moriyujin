const { regClass, property } = Laya;

@regClass()
export class HpBar extends Laya.Script {
    @property(Laya.Sprite)
    public fill: Laya.Sprite | null = null;

    @property(Number)
    public maxHp: number = 100;

    @property(Number)
    public hp: number = 100;

    private fullWidth: number = 0;

    onAwake(): void {
        if (this.fill) {
            this.fullWidth = this.fill.width;
        }

        this.refresh();
    }

    public setHp(hp: number, maxHp: number = this.maxHp): void {
        this.maxHp = Math.max(1, Math.floor(maxHp));
        this.hp = Math.max(0, Math.min(Math.floor(hp), this.maxHp));
        this.refresh();
    }

    private refresh(): void {
        if (!this.fill) {
            return;
        }

        if (this.fullWidth <= 0) {
            this.fullWidth = this.fill.width;
        }

        this.fill.width = this.fullWidth * (this.hp / Math.max(1, this.maxHp));
    }
}
