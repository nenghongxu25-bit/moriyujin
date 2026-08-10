const { regClass, property } = Laya;

import { PlayerMovementController } from "./PlayerMovementController";
import { PlayerUIHints } from "./PlayerUIHints";
import { PlayerCombatController } from "./PlayerCombatController";
import { PlayerAnimationController } from "./PlayerAnimationController";

@regClass()
export class PlayerController extends Laya.Script {
    public static activeInstance: PlayerController | null = null;

    @property(Number)
    public walkSpeed: number = 200;

    @property(Number)
    public runSpeed: number = 320;

    @property(Number)
    public moveSpeed: number = 0;

    @property(Boolean)
    public isRunning: boolean = false;

    @property(Laya.Node)
    public joystickNode: Laya.Node | null = null;

    @property(Laya.Node)
    public spineNode: Laya.Node | null = null;

    @property(Laya.Node)
    public attackNode: Laya.Node | null = null;

    @property(Laya.Node)
    public detectNode: Laya.Node | null = null;

    @property(Laya.Node)
    public stateText: Laya.Node | null = null;

    @property(Laya.Node)
    public itemText: Laya.Node | null = null;

    @property(Number)
    public initialFacingSign: number = 1;

    @property(Number)
    public attackAreaRightX: number = -100;

    @property(Number)
    public attackAreaLeftX: number = 0;

    @property(Number)
    public attackCooldown: number = 300;

    @property(String)
    public idleAnimation: string = "idle";

    @property(String)
    public walkAnimation: string = "walk";

    @property(String)
    public runAnimation: string = "run";

    @property(String)
    public attackAnimation: string = "attack_stab";

    @property(Number)
    public attackAnimationDuration: number = 550;

    public movement!: PlayerMovementController;
    public ui!: PlayerUIHints;
    public combat!: PlayerCombatController;
    public animation!: PlayerAnimationController;

    onAwake(): void {
        PlayerController.activeInstance = this;
        this.movement = new PlayerMovementController(this);
        this.ui = new PlayerUIHints(this);
        this.combat = new PlayerCombatController(this);
        this.animation = new PlayerAnimationController(this);
        this.movement.onAwake();
        this.ui.onAwake();
        this.animation.onAwake();
    }

    onStart(): void {
        PlayerController.activeInstance = this;
        this.movement.onStart();
        this.ui.onStart();
        this.animation.onStart();
    }

    onUpdate(): void {
        this.movement.onUpdate();
        this.animation.onUpdate();
    }

    onDestroy(): void {
        if (PlayerController.activeInstance === this) {
            PlayerController.activeInstance = null;
        }

        this.animation?.onDestroy();
        this.combat?.onDestroy();
        this.ui?.onDestroy();
    }

    public playAttack(): void {
        this.combat.playAttack();
    }

    public setRunning(value: boolean): void {
        if (this.isRunning === value) {
            return;
        }

        this.isRunning = value;
    }

    public toggleRunning(): void {
        this.setRunning(!this.isRunning);
    }

    public showState(text: string, duration: number = 1200): void {
        this.ui.showState(text, duration);
    }

    public showItem(text: string, duration: number = 1500): void {
        this.ui.showItem(text, duration);
    }

    public hideStateText(): void {
        this.ui.hideStateText();
    }

    public hideItemText(): void {
        this.ui.hideItemText();
    }

    public snapshot(): Record<string, any> {
        return {
            walkSpeed: this.walkSpeed,
            runSpeed: this.runSpeed,
            moveSpeed: this.moveSpeed,
            isRunning: this.isRunning,
            idleAnimation: this.idleAnimation,
            walkAnimation: this.walkAnimation,
            runAnimation: this.runAnimation,
            attackAnimation: this.attackAnimation,
            attackAnimationDuration: this.attackAnimationDuration,
            joystickNode: this.joystickNode ? this.joystickNode.name : null,
            spineNode: this.spineNode ? this.spineNode.name : null,
            attackNode: this.attackNode ? this.attackNode.name : null,
            detectNode: this.detectNode ? this.detectNode.name : null,
            stateText: this.stateText ? this.stateText.name : null,
            itemText: this.itemText ? this.itemText.name : null,
            owner: this.owner ? this.owner.name : null,
            scaleX: this.owner ? (this.owner as Laya.Sprite).scaleX : null,
            initialFacingSign: this.initialFacingSign,
            attackAreaRightX: this.attackAreaRightX,
            attackAreaLeftX: this.attackAreaLeftX,
            attackCooldown: this.attackCooldown,
            movement: this.movement ? this.movement.snapshot() : null,
            ui: this.ui ? this.ui.snapshot() : null,
            combat: this.combat ? this.combat.snapshot() : null,
            animation: this.animation ? this.animation.snapshot() : null,
        };
    }
}