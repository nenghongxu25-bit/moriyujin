import { DebugGlobalUI } from "./DebugGlobalUI";

const { regClass } = Laya;

@regClass()
export class DebugBootstrap extends Laya.Script {
    onAwake(): void {
        console.info("[DebugBootstrap] onAwake");
        DebugGlobalUI.install();
    }

    onEnable(): void {
        console.info("[DebugBootstrap] onEnable");
        DebugGlobalUI.ensure();
    }
}
