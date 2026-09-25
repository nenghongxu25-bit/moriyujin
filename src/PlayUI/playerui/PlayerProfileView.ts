const { regClass } = Laya;

import { DouyinCloudSaveManager } from "../../platform/douyin/DouyinCloudSaveManager";
import { DouyinUserProfileManager } from "../../platform/douyin/DouyinUserProfileManager";
import type { DouyinUserProfile } from "../../platform/douyin/DouyinCloudManager";

@regClass()
export class PlayerProfileView extends Laya.Script {
    private avatarNode: any = null;
    private nameText: Laya.Text | null = null;
    private idText: Laya.Text | null = null;
    private requestingProfile: boolean = false;

    onAwake(): void {
        this.bindNodes();
        this.bindClick();
        this.render(DouyinUserProfileManager.getLocalProfile());
    }

    onEnable(): void {
        this.bindNodes();
        this.bindClick();

        if (Laya.stage) {
            Laya.stage.on(
                DouyinUserProfileManager.PROFILE_CHANGED_EVENT,
                this,
                this.onProfileChanged
            );
        }

        void this.refreshFromCloud();
    }

    onDisable(): void {
        const owner = this.owner as any;
        if (owner) {
            owner.off(Laya.Event.CLICK, this, this.requestProfile);
        }

        if (Laya.stage) {
            Laya.stage.off(
                DouyinUserProfileManager.PROFILE_CHANGED_EVENT,
                this,
                this.onProfileChanged
            );
        }
    }

    public refresh(): void {
        this.bindNodes();
        this.bindClick();
        this.render(DouyinUserProfileManager.getLocalProfile());
        void this.refreshFromCloud();
    }

    private async refreshFromCloud(): Promise<void> {
        try {
            await DouyinCloudSaveManager.bootstrap();
            const profile = await DouyinUserProfileManager.loadCloudProfile();
            this.render(profile);
        } catch (error) {
            console.warn("[PlayerProfileView] refresh failed:", error);
            this.render(DouyinUserProfileManager.getLocalProfile());
        }
    }

    private async requestProfile(): Promise<void> {
        if (this.requestingProfile) {
            return;
        }

        this.requestingProfile = true;
        if (this.nameText) {
            this.nameText.text = "Authorizing";
        }

        try {
            const profile = await DouyinUserProfileManager.requestAndSaveProfile();
            this.render(profile);
        } catch (error) {
            console.warn("[PlayerProfileView] request profile failed:", error);
            this.render(DouyinUserProfileManager.getLocalProfile());
        } finally {
            this.requestingProfile = false;
        }
    }

    private onProfileChanged(profile: DouyinUserProfile): void {
        this.render(profile);
    }

    private bindNodes(): void {
        const owner = this.owner as Laya.Node;
        if (!owner) {
            return;
        }

        this.avatarNode = owner.getChildByName("img") as any;
        this.nameText = owner.getChildByName("name") as Laya.Text | null;
        this.idText = owner.getChildByName("id") as Laya.Text | null;
    }

    private bindClick(): void {
        const owner = this.owner as any;
        if (!owner) {
            return;
        }

        owner.mouseEnabled = true;
        if ("mouseThrough" in owner) {
            owner.mouseThrough = false;
        }

        owner.off(Laya.Event.CLICK, this, this.requestProfile);
        owner.on(Laya.Event.CLICK, this, this.requestProfile);
    }

    private render(profile: DouyinUserProfile | null): void {
        const playerId = DouyinCloudSaveManager.getPlayerId();
        const displayId = DouyinCloudSaveManager.getDisplayId();

        if (this.nameText) {
            this.nameText.text = profile && profile.nickName
                ? profile.nickName
                : "Tap to authorize";
        }

        if (this.idText) {
            this.idText.text = displayId > 0
                ? "ID: " + displayId
                : playerId
                    ? "ID: " + playerId
                    : "ID: not logged in";
        }

        if (profile && profile.avatarUrl) {
            this.setAvatar(profile.avatarUrl);
        }
    }

    private setAvatar(url: string): void {
        const avatar = this.avatarNode;
        if (!avatar) {
            return;
        }

        if ("src" in avatar) {
            avatar.src = url;
        }

        if ("skin" in avatar) {
            avatar.skin = url;
        }

        if (typeof avatar.loadImage === "function") {
            avatar.loadImage(url);
        }
    }
}
