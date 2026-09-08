import { DailySignInManager } from "./systems/DailySignInManager";

const { regClass } = Laya;

@regClass()
export class DailySignInButton extends Laya.Script {
    private button!: Laya.Sprite;

    onAwake(): void {
        this.button = this.owner as Laya.Sprite;
        this.button.on(Laya.Event.CLICK, this, this.claimDailyReward);
    }

    onDestroy(): void {
        this.button.off(Laya.Event.CLICK, this, this.claimDailyReward);
    }

    private claimDailyReward(): void {
        const result = DailySignInManager.claimToday();
        if (result.ok) {
            console.log("Daily sign-in reward sent by mail", result.mailId);
        } else if (result.reason === "today_claimed") {
            console.log("Daily sign-in already claimed today");
        }
    }
}
