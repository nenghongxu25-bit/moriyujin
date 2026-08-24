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

        const width = Math.max(0, this.fullWidth * (this.hp / Math.max(1, this.maxHp)));
        this.fill.width = width;

        const fill = this.fill as any;
        if (fill.graphics && typeof fill.graphics.clear === "function" && typeof fill.graphics.drawRect === "function") {
            fill.graphics.clear();
            if (width > 0) {
                fill.graphics.drawRect(0, 0, width, this.resolveFillHeight(), this.resolveFillColor());
            }
        }
    }

    private resolveFillHeight(): number {
        const fill = this.fill as any;
        if (Number.isFinite(fill?.height) && fill.height > 0) {
            return fill.height;
        }

        const commands = fill?._gcmds;
        if (Array.isArray(commands)) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command && Number.isFinite(command.height) && command.height > 0) {
                    return command.height;
                }
            }
        }

        return 10;
    }

    private resolveFillColor(): string {
        const fill = this.fill as any;
        const commands = fill?._gcmds;
        if (Array.isArray(commands)) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command && typeof command.fillColor === "string" && command.fillColor) {
                    return command.fillColor;
                }
            }
        }

        return "#c93826";
    }
}
