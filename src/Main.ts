import { GlobalBroadcast } from "./GlobalBroadcast";

const { regClass } = Laya;

@regClass()
export class Main extends Laya.Script {
    onStart(): void {
        console.log("Game start");
        GlobalBroadcast.init();
    }
}
