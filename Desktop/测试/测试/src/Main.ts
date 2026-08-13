import "./PlayUI/playerui/Joystick";
import "./PlayUI/button/chop";
import "./PlayUI/button/dig";
import "./PlayUI/button/search";
import "./PlayUI/button/attack";
import "./PlayUI/button/run";
import "./PlayUI/SidebarNavigateButton";
import "./PlayUI/playerui/bag";
import "./PlayUI/module/BagPanel";
import "./PlayUI/module/QuickEquipContainer";
import "./PlayUI/CommonUI/listTemplate";
import "./PlayUI/module/WarehousePanel";
import "./PlayUI/module/MailPanel";
import "./SceneJumpTrigger";
import "./Player/PlayerCamera2D";
import "./harvestable/oak";
import "./harvestable/pine";
import "./harvestable/bush";
import "./harvestable/stones";
import "./harvestable/branches";
import "./harvestable/mound";
import "./harvestable/dig";
import "./harvestable/l1_kuang";
import "./harvestable/l2_kuang";
import { DataManager } from "./systems/datamanager";
import { ByteDanceMonetization } from "./platform/ByteDanceMonetization";
import { DouyinLogin } from "./auth/DouyinLogin";

declare const Laya: any;


export class Main {
    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        ByteDanceMonetization.bootstrap();
        DouyinLogin.configure({
            loginEndpoint: "",
            privacyText: "鐢ㄦ埛闅愮鏀跨瓥",
        });

        await DouyinLogin.ensureLogin();

        try {
            await DataManager.getInstance().loadAll();
        } catch (error) {
            console.error("[Main] loadAll failed", error);
            return;
        }

        DataManager.getInstance().enterScene("scenes/menu.ls");
        Laya.Scene.open("scenes/menu.ls");
    }
}

new Main();
