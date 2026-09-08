const { regClass, property } = Laya;

@regClass()
export class XuliezhenFrameAnimation extends Laya.Script {
    @property(Number)
    fps = 18;

    @property(Boolean)
    loop = true;

    @property(Boolean)
    autoPlay = true;

    private animation: Laya.FrameAnimation | null = null;

    private readonly framePaths = [
        "res://e41113fb-f7d7-4121-aa22-b2b578088f21",
        "res://9da5af1a-2b93-4447-a789-13ec23f39073",
        "res://827ecb23-f7c5-4f94-9cf3-cd370efec80d",
        "res://94603030-dfd6-4657-97b9-fcedb2ab343a",
        "res://153a8e50-2af1-4c2a-8305-e27b49b960c8",
        "res://909f8a69-fea6-4b1b-94b9-8bc0e9cec14f",
        "res://e3f7da37-2ddc-43e7-bf80-40cbdabb6469",
        "res://61f19981-c4f7-4cdc-8e84-1e861cf636ed",
        "res://dfa8a84c-d3a6-4efc-b939-d13903a9d499",
        "res://1d84493c-8c68-451e-b9f6-56519dd932a4",
        "res://cc41f909-e2e8-4cab-a5eb-034f874a9edd",
        "res://fd65b027-804a-43da-a889-d27177148b73",
        "res://1f995e26-3a71-47f2-aaec-1b21c552afd9",
        "res://e36d6716-d5ca-482c-9226-ce1b7286b03e",
        "res://fdb6836f-60ce-4751-9182-9749502fc8cd",
        "res://d2dec212-dee2-4992-8195-2736f2f10a5c",
    ];

    onAwake(): void {
        const owner = this.owner as Laya.Sprite;
        this.animation = owner.getComponent(Laya.FrameAnimation) ?? owner.addComponent(Laya.FrameAnimation);
        this.animation.images = this.framePaths;
        this.animation.interval = Math.max(1, Math.round(1000 / Math.max(1, this.fps)));
        this.animation.loop = this.loop;
        this.animation.autoPlay = this.autoPlay;

        if (this.autoPlay) {
            this.animation.play();
        }
    }

    onDestroy(): void {
        this.animation?.stop();
        this.animation = null;
    }
}
