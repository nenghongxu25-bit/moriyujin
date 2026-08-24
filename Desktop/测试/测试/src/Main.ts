import "./PlayUI/playerui/Joystick";
import "./PlayUI/playerui/chop";
import "./PlayUI/playerui/dig";
import "./PlayUI/playerui/search";
import "./PlayUI/playerui/attack";
import "./PlayUI/playerui/run";
import "./PlayUI/SideBar/SidebarNavigateButton";
import "./PlayUI/playerui/bag";
import "./PlayUI/Bag/BagPanel";
import "./PlayUI/playerui/QuickEquipContainer";
import "./PlayUI/CommonUI/listTemplate";
import "./PlayUI/Warehouse/WarehousePanel";
import "./PlayUI/Mail/MailPanel";
import "./PlayUI/Crafting/CraftingItemBox";
import "./PlayUI/Crafting/CraftingItemList";
import "./PlayUI/Crafting/CraftingRecipeItem";
import "./PlayUI/Crafting/CraftingRecipeList";
import "./PlayUI/Crafting/CraftingPanel";
import "./SceneJumpTrigger";
import './OpenSprite';
import "./Player/PlayerCamera2D";
import "./Enemy/HpBar";
import "./combat/AttackHitbox";
import "./harvestable/oak";
import "./harvestable/pine";
import "./harvestable/bush";
import "./harvestable/stones";
import "./harvestable/branches";
import "./harvestable/mound";
import "./harvestable/dig";
import "./harvestable/l1_kuang";
import "./harvestable/l2_kuang";
import { DebugGlobalUI } from "./debug/DebugGlobalUI";
import "./systems/RuntimeDiagnostics";
import { DataManager } from "./systems/datamanager";
import { ByteDanceMonetization } from "./platform/ByteDanceMonetization";
import { DouyinLogin } from "./platform/douyin/DouyinLogin";

declare const Laya: any;

export class Main {
    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        ByteDanceMonetization.bootstrap();
        DouyinLogin.configure({
            loginEndpoint: "",
            privacyText: "鎶栭煶闅愮鏀跨瓥",
            postLoginSceneUrl: "scenes/cunzhuang.ls",
        });

        try {
            await DataManager.getInstance().loadAll();
        } catch (error) {
            throw error;
        }

        DataManager.getInstance().enterScene("scenes/menu.ls");
        Laya.Scene.open("scenes/menu.ls");
        DebugGlobalUI.install();
        Laya.timer.once(500, null, () => DebugGlobalUI.ensure());
        Laya.timer.once(1500, null, () => DebugGlobalUI.ensure());
    }
}

new Main();
