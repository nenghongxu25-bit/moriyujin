type ByteDanceMiniGameApi = {
    requestSubscribeMessage?: (options: any) => void;
    createInterstitialAd?: (options: { adUnitId: string }) => ByteDanceInterstitialAd | null;
    createRewardedVideoAd?: (options: { adUnitId: string }) => ByteDanceRewardedVideoAd | null;
    canIUse?: (key: string) => boolean;
};

type ByteDanceInterstitialAd = {
    load: () => Promise<void> | void;
    show: () => Promise<void> | void;
    destroy?: () => void;
    onLoad?: (callback: () => void) => void;
    onError?: (callback: (error: any) => void) => void;
    onClose?: (callback: () => void) => void;
};

type ByteDanceRewardedVideoAd = {
    load: () => Promise<void> | void;
    show: () => Promise<void> | void;
    destroy?: () => void;
    onLoad?: (callback: () => void) => void;
    onError?: (callback: (error: any) => void) => void;
    onClose?: (callback: (result: { isEnded?: boolean }) => void) => void;
};

export interface ByteDanceMonetizationConfig {
    subscribeTemplateIds?: string[];
    interstitialAdUnitId?: string;
    rewardedAdUnitId?: string;
}

const DEFAULT_CONFIG: Required<ByteDanceMonetizationConfig> = {
    subscribeTemplateIds: [],
    interstitialAdUnitId: "",
    rewardedAdUnitId: "",
};

export class ByteDanceMonetization {
    private static bootstrapTime: number = Date.now();
    private static interstitialAd: ByteDanceInterstitialAd | null = null;
    private static rewardedVideoAd: ByteDanceRewardedVideoAd | null = null;
    private static lastInterstitialShownAt: number = 0;
    private static config: Required<ByteDanceMonetizationConfig> = { ...DEFAULT_CONFIG };

    public static bootstrap(config?: ByteDanceMonetizationConfig): void {
        this.bootstrapTime = Date.now();
        this.config = {
            subscribeTemplateIds: this.normalizeTemplateIds(config?.subscribeTemplateIds),
            interstitialAdUnitId: config?.interstitialAdUnitId?.trim() || "",
            rewardedAdUnitId: config?.rewardedAdUnitId?.trim() || "",
        };

        this.preloadInterstitialAd();
        this.preloadRewardedVideoAd();
    }

    public static requestSubscribeMessage(templateIds?: string | string[]): Promise<boolean> {
        const api = this.getApi();
        const ids = this.normalizeTemplateIds(templateIds ?? this.config.subscribeTemplateIds);
        if (!api || typeof api.requestSubscribeMessage !== "function" || ids.length === 0) {
            return Promise.resolve(false);
        }

        return new Promise<boolean>((resolve) => {
            api.requestSubscribeMessage({
                tmplIds: ids.slice(0, 3),
                success: () => resolve(true),
                fail: () => resolve(false),
            });
        });
    }

    public static async tryShowInterstitial(): Promise<boolean> {
        const api = this.getApi();
        const ad = this.interstitialAd;
        if (!api || !ad) {
            return false;
        }

        if (Date.now() - this.bootstrapTime < 31000) {
            return false;
        }

        if (Date.now() - this.lastInterstitialShownAt < 61000) {
            return false;
        }

        try {
            await Promise.resolve(ad.show());
            this.lastInterstitialShownAt = Date.now();
            return true;
        } catch {
            this.preloadInterstitialAd();
            return false;
        }
    }

    public static async tryShowRewardedVideo(): Promise<boolean> {
        const api = this.getApi();
        const ad = this.rewardedVideoAd;
        if (!api || !ad) {
            return false;
        }

        try {
            await Promise.resolve(ad.show());
            return true;
        } catch {
            this.preloadRewardedVideoAd();
            return false;
        }
    }

    public static preloadInterstitialAd(): void {
        const api = this.getApi();
        const adUnitId = this.config.interstitialAdUnitId;
        if (!api || typeof api.createInterstitialAd !== "function" || !adUnitId) {
            return;
        }

        const ad = api.createInterstitialAd({ adUnitId });
        if (!ad) {
            return;
        }

        this.interstitialAd = ad;
        ad.onError?.((error: any) => {
            console.warn("[ByteDanceMonetization] interstitial error", error);
        });
        ad.onClose?.(() => {
            this.preloadInterstitialAd();
        });
        try {
            ad.load?.();
        } catch (error) {
            console.warn("[ByteDanceMonetization] interstitial load failed", error);
        }
    }

    public static preloadRewardedVideoAd(): void {
        const api = this.getApi();
        const adUnitId = this.config.rewardedAdUnitId;
        if (!api || typeof api.createRewardedVideoAd !== "function" || !adUnitId) {
            return;
        }

        const ad = api.createRewardedVideoAd({ adUnitId });
        if (!ad) {
            return;
        }

        this.rewardedVideoAd = ad;
        ad.onError?.((error: any) => {
            console.warn("[ByteDanceMonetization] rewarded ad error", error);
        });
        ad.onClose?.((result: { isEnded?: boolean }) => {
            if (!result?.isEnded) {
                return;
            }
            this.preloadRewardedVideoAd();
        });
        try {
            ad.load?.();
        } catch (error) {
            console.warn("[ByteDanceMonetization] rewarded ad load failed", error);
        }
    }

    private static getApi(): ByteDanceMiniGameApi | null {
        const api = (globalThis as any).tt as ByteDanceMiniGameApi | undefined;
        return api || null;
    }

    private static normalizeTemplateIds(templateIds?: string | string[]): string[] {
        if (!templateIds) {
            return [];
        }

        if (Array.isArray(templateIds)) {
            return templateIds.map((item) => String(item).trim()).filter(Boolean);
        }

        return templateIds
            .split(/[\s,;|]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    }
}
