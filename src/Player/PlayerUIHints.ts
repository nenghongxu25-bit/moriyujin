import type { PlayerController } from "./PlayerController";

export class PlayerUIHints {
    private stateText: Laya.Text | null = null;
    private itemText: Laya.Text | null = null;

    constructor(private controller: PlayerController) {
    }

    public onAwake(): void {
        this.resolveFromController();
    }

    public onStart(): void {
        this.resolveFromController();
    }

    public onDestroy(): void {
        Laya.timer.clear(this, this.hideStateText);
        Laya.timer.clear(this, this.hideItemText);
    }

    public showState(text: string, duration: number = 1200): void {
        if (!this.stateText) {
            this.resolveFromController();
        }

        if (!this.stateText) {
            return;
        }

        (this.stateText as any).visible = true;
        this.stateText.text = text;
        Laya.timer.clear(this, this.hideStateText);
        Laya.timer.once(duration, this, this.hideStateText);
    }

    public showItem(text: string, duration: number = 1500): void {
        if (!this.itemText) {
            this.resolveFromController();
        }

        if (!this.itemText) {
            return;
        }

        (this.itemText as any).visible = true;
        this.itemText.text = text;
        Laya.timer.clear(this, this.hideItemText);
        Laya.timer.once(duration, this, this.hideItemText);
    }

    public hideStateText(): void {
        if (!this.stateText) {
            return;
        }

        this.stateText.text = "";
        (this.stateText as any).visible = false;
    }

    public hideItemText(): void {
        if (!this.itemText) {
            return;
        }

        this.itemText.text = "";
        (this.itemText as any).visible = false;
    }

    public snapshot(): Record<string, any> {
        return {
            stateText: this.stateText ? this.stateText.name : null,
            itemText: this.itemText ? this.itemText.name : null,
        };
    }

    private resolveFromController(): void {
        this.stateText = this.controller.stateText ? this.controller.stateText as Laya.Text : this.stateText;
        this.itemText = this.controller.itemText ? this.controller.itemText as Laya.Text : this.itemText;
    }
}