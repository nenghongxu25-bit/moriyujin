const { regClass, property } = Laya;

type RewardedVideoAd = {
    load: () => Promise<void> | void;
    show: () => Promise<void> | void;
    destroy?: () => void;
    onClose?: (callback: (result: { isEnded?: boolean }) => void) => void;
    onError?: (callback: (error: any) => void) => void;
};

@regClass()
export class RewardedAdButton extends Laya.Script {
    @property(Laya.Node)
    public buttonNode: Laya.Node | null = null;

    @property(String)
    public adUnitId: string = "";

    @property(String)
    public rewardEventName: string = "rewarded-ad-completed";

    @property(Boolean)
    public preloadOnEnable: boolean = true;

    private ad: RewardedVideoAd | null = null;
    private boundButton: Laya.Node | null = null;
    private showing: boolean = false;
    private pendingResolve: ((completed: boolean) => void) | null = null;

    onAwake(): void {
        this.bindClick();
    }

    onEnable(): void {
        this.bindClick();
        if (this.preloadOnEnable) {
            this.createAd();
        }
    }

    onDisable(): void {
        this.unbindClick();
    }

    onDestroy(): void {
        this.unbindClick();
        this.finish(false);
        this.ad?.destroy?.();
        this.ad = null;
    }

    private bindClick(): void {
        this.unbindClick();

        const button = this.buttonNode || (this.owner as Laya.Node | null);
        if (!button) {
            return;
        }

        this.boundButton = button;
        (button as any).mouseEnabled = true;
        if ("mouseThrough" in (button as any)) {
            (button as any).mouseThrough = false;
        }

        if (typeof (button as any).onClick === "function") {
            (button as any).onClick(this, this.onClick);
        } else {
            button.on(Laya.Event.CLICK, this, this.onClick);
        }
    }

    private unbindClick(): void {
        if (!this.boundButton) {
            return;
        }

        if (typeof (this.boundButton as any).offClick === "function") {
            (this.boundButton as any).offClick(this, this.onClick);
        } else {
            this.boundButton.off(Laya.Event.CLICK, this, this.onClick);
        }

        this.boundButton = null;
    }

    private onClick(): void {
        void this.showRewardedAd();
    }

    public async showRewardedAd(): Promise<boolean> {
        if (this.showing) {
            return false;
        }

        const ad = this.createAd();
        if (!ad) {
            return false;
        }

        this.showing = true;
        try {
            await this.showAd(ad);
            return await new Promise<boolean>((resolve) => {
                this.pendingResolve = resolve;
            });
        } catch (error) {
            console.error("[RewardedAdButton] show rewarded ad failed", error);
            this.finish(false);
            this.ad = null;
            return false;
        }
    }

    private async showAd(ad: RewardedVideoAd): Promise<void> {
        try {
            await Promise.resolve(ad.show());
        } catch {
            await Promise.resolve(ad.load());
            await Promise.resolve(ad.show());
        }
    }

    private createAd(): RewardedVideoAd | null {
        if (this.ad) {
            return this.ad;
        }

        const tt = (globalThis as any).tt;
        if (!tt || typeof tt.createRewardedVideoAd !== "function") {
            console.error("[RewardedAdButton] tt.createRewardedVideoAd is unavailable");
            return null;
        }

        const adUnitId = String(this.adUnitId || "").trim();
        if (!adUnitId) {
            console.error("[RewardedAdButton] adUnitId is empty");
            return null;
        }

        const ad = tt.createRewardedVideoAd({ adUnitId }) as RewardedVideoAd | null;
        if (!ad) {
            console.error("[RewardedAdButton] createRewardedVideoAd returned empty ad");
            return null;
        }

        this.ad = ad;
        ad.onClose?.((result: { isEnded?: boolean }) => {
            const completed = !!result && result.isEnded === true;
            this.finish(completed);
            if (completed) {
                this.createAd()?.load();
            }
        });
        ad.onError?.((error: any) => {
            console.error("[RewardedAdButton] rewarded ad error", error);
            this.finish(false);
            this.ad = null;
        });

        try {
            ad.load();
        } catch (error) {
            console.error("[RewardedAdButton] preload rewarded ad failed", error);
        }

        return ad;
    }

    private finish(completed: boolean): void {
        this.showing = false;
        const resolve = this.pendingResolve;
        this.pendingResolve = null;

        if (resolve) {
            resolve(completed);
        }

        if (completed && this.rewardEventName) {
            (this.owner as any)?.event?.(this.rewardEventName, completed);
        }
    }
}
