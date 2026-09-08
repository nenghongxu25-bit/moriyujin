const { regClass } = Laya;

type BroadcastItem = {
    message: string;
    duration: number;
};

@regClass()
export class GlobalBroadcast extends Laya.Script {
    private static instance: GlobalBroadcast | null = null;

    private root: Laya.Sprite | null = null;
    private background: Laya.Sprite | null = null;
    private text: Laya.Text | null = null;
    private queue: BroadcastItem[] = [];
    private showing = false;

    static init(): GlobalBroadcast | null {
        if (GlobalBroadcast.instance) {
            return GlobalBroadcast.instance;
        }

        if (!Laya.stage) {
            return null;
        }

        const host = new Laya.Sprite();
        host.name = "GlobalBroadcastHost";
        host.mouseEnabled = false;
        (host as any).mouseThrough = true;
        Laya.stage.addChild(host);

        const script = host.addComponent(GlobalBroadcast) as GlobalBroadcast;
        GlobalBroadcast.instance = script;
        script.createView(host);
        return script;
    }

    static show(message: string, duration = 1800): void {
        const instance = GlobalBroadcast.init();
        if (!instance || !message) {
            return;
        }

        instance.enqueue(message, duration);
    }

    onDestroy(): void {
        Laya.stage?.off(Laya.Event.RESIZE, this, this.layout);
        if (GlobalBroadcast.instance === this) {
            GlobalBroadcast.instance = null;
        }
    }

    private createView(root: Laya.Sprite): void {
        this.root = root;
        this.root.zOrder = 100000;

        this.background = new Laya.Sprite();
        this.background.name = "GlobalBroadcastBackground";
        this.background.alpha = 0;
        this.root.addChild(this.background);

        this.text = new Laya.Text();
        this.text.name = "GlobalBroadcastText";
        this.text.alpha = 0;
        this.text.fontSize = 30;
        this.text.bold = true;
        this.text.color = "#f4e7b4";
        this.text.align = "center";
        this.text.valign = "middle";
        this.text.wordWrap = true;
        this.root.addChild(this.text);

        this.layout();
        Laya.stage?.on(Laya.Event.RESIZE, this, this.layout);
    }

    private enqueue(message: string, duration: number): void {
        this.queue.push({
            message,
            duration: Math.max(600, duration)
        });

        if (!this.showing) {
            this.showNext();
        }
    }

    private showNext(): void {
        const item = this.queue.shift();
        if (!item || !this.root || !this.background || !this.text) {
            this.showing = false;
            return;
        }

        this.showing = true;
        this.text.text = item.message;
        this.layout();

        Laya.Tween.clearAll(this.background);
        Laya.Tween.clearAll(this.text);
        this.background.alpha = 0;
        this.text.alpha = 0;
        this.root.visible = true;

        Laya.Tween.to(this.background, { alpha: 0.82 }, 160);
        Laya.Tween.to(
            this.text,
            { alpha: 1 },
            160,
            null,
            Laya.Handler.create(this, () => {
                Laya.timer.once(item.duration, this, this.hideCurrent);
            })
        );
    }

    private hideCurrent(): void {
        if (!this.background || !this.text) {
            this.showing = false;
            return;
        }

        Laya.Tween.to(this.background, { alpha: 0 }, 180);
        Laya.Tween.to(
            this.text,
            { alpha: 0 },
            180,
            null,
            Laya.Handler.create(this, this.showNext)
        );
    }

    private layout(): void {
        if (!Laya.stage || !this.root || !this.background || !this.text) {
            return;
        }

        const stageWidth = Laya.stage.width || 1334;
        const top = Math.max(24, Math.floor((Laya.stage.height || 750) * 0.08));
        const width = Math.min(860, Math.floor(stageWidth * 0.72));
        const height = 56;
        const x = Math.floor((stageWidth - width) / 2);

        this.root.width = stageWidth;
        this.root.height = Laya.stage.height || 750;

        this.background.graphics.clear();
        this.background.graphics.drawRect(x, top, width, height, "#111917", "#d6c276", 2);
        this.background.width = width;
        this.background.height = height;

        this.text.x = x + 22;
        this.text.y = top;
        this.text.width = width - 44;
        this.text.height = height;
    }
}
