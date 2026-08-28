export class MailMessageController {
    private fadeToken: number = 0;

    public constructor(
        private readonly getMessageText: () => Laya.Text | null,
        private readonly setNodeShown: (node: Laya.Node | null, shown: boolean) => void
    ) {
    }

    public show(message: string): void {
        const targetText = this.getMessageText();
        if (!targetText) {
            return;
        }

        this.fadeToken += 1;
        const token = this.fadeToken;

        targetText.text = String(message || "");
        (targetText as any).alpha = 1;
        this.setNodeShown(targetText, true);

        Laya.timer.clear(this, this.fade);
        Laya.timer.once(1000, this, this.fade, [token]);
    }

    public hide(): void {
        this.fadeToken += 1;
        this.clearTimers();

        const targetText = this.getMessageText();
        if (!targetText) {
            return;
        }

        targetText.text = "";
        this.setNodeShown(targetText, false);
        (targetText as any).alpha = 1;
    }

    public clearTimers(): void {
        Laya.timer.clear(this, this.fade);
        Laya.timer.clear(this, this.finishFade);

        const targetText = this.getMessageText();
        if (targetText) {
            Laya.Tween.clearAll(targetText);
        }
    }

    private fade(token: number): void {
        const targetText = this.getMessageText();
        if (token !== this.fadeToken || !targetText) {
            return;
        }

        Laya.Tween.clearAll(targetText);
        Laya.Tween.to(
            targetText as any,
            { alpha: 0 },
            450,
            null,
            Laya.Handler.create(this, this.finishFade, [token])
        );
    }

    private finishFade(token: number): void {
        const targetText = this.getMessageText();
        if (token !== this.fadeToken || !targetText) {
            return;
        }

        targetText.text = "";
        this.setNodeShown(targetText, false);
        (targetText as any).alpha = 1;
    }
}