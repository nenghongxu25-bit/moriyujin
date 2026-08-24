import { DebugGlobalUI } from "./DebugGlobalUI";
import { DebugConfig } from "./DebugConfig";

const { regClass } = Laya;

@regClass()
export class DebugBootstrap extends Laya.Script {
    onAwake(): void {
        if (!DebugConfig.ENABLE_DEBUG_UI) {
            return;
        }

        DebugGlobalUI.install();
    }

    onEnable(): void {
        if (!DebugConfig.ENABLE_DEBUG_UI) {
            return;
        }

        DebugGlobalUI.ensure();
    }
}
