import "./PlayUI/Joystick";
import "./PlayUI/chop";
import "./Player/PlayerCamera2D";
import "./harvestable/oak";
import "./harvestable/pine";
import { DataManager } from "./systems/datamanager";

export class Main {
    constructor() {
        this.init();
    }

    private async init() {
        try {
            await DataManager.getInstance().loadAll();
        } catch (error) {
            return;
        }

        Laya.Scene.open("scenes/main.ls");
    }
}

new Main();
