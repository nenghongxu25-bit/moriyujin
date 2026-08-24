const { regClass, property } = Laya;

import { PlayerMovementController } from "./PlayerMovementController";
import { PlayerUIHints } from "./PlayerUIHints";
import { PlayerCombatController } from "./PlayerCombatController";
import { PlayerAnimationController } from "./PlayerAnimationController";
import { DataManager, type EquipmentSlotType } from "../systems/datamanager";

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
    public footstepSoundEnabled: boolean = true;

    @property(String)
    public cunzhuangWalkSoundUrl: string = "sound/sfx/walk/walk_wood.mp3";

    @property(String)
    public cunzhuangRunSoundUrl: string = "sound/sfx/run/run_wood.mp3";

    @property(String)
    public forestWalkSoundUrl: string = "sound/sfx/walk/walk_grass.mp3";

    @property(String)
    public forestRunSoundUrl: string = "sound/sfx/run/run_grass.mp3";

    @property(String)
    public mineWalkSoundUrl: string = "sound/sfx/walk/walk_floor.wav";

    @property(String)
    public mineRunSoundUrl: string = "sound/sfx/run/run_inside_floor.mp3";

    @property(Number)
    public walkFootstepInterval: number = 420;

    @property(Number)
    public runFootstepInterval: number = 300;

    @property(Number)
    public walkFootstepPlaybackRate: number = 1;

    @property(Number)
    public runFootstepPlaybackRate: number = 1;

    @property(Number)
    public footstepPlaybackRateVariance: number = 0;

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

    @property(Laya.Node)
    public hpFillNode: Laya.Node | null = null;

    @property(Laya.Node)
    public hpBarNode: Laya.Node | null = null;

    @property(Laya.Node)
    public staminaFillNode: Laya.Node | null = null;

    @property(Laya.Node)
    public staminaBarNode: Laya.Node | null = null;

    @property(Laya.Node)
    public weaponSlotNode: Laya.Node | null = null;

    @property(Laya.Node)
    public weaponIconNode: Laya.Node | null = null;

    @property(String)
    public weaponSpineSlotName: string = "";

    @property(String)
    public weaponMeleeSpineSlotName: string = "weapon_melee_slot";

    @property(String)
    public weaponRangedSpineSlotName: string = "weapon_ranged_slot";

    @property(String)
    public insertPlateSpineSlotName: string = "";

    @property(String)
    public helmetSpineSlotName: string = "";

    @property(String)
    public armorSpineSlotName: string = "";

    @property(Number)
    public currentHp: number = 100;

    @property(Number)
    public maxHp: number = 100;

    @property(Number)
    public hpFillFullWidth: number = 70;

    @property(Number)
    public currentStamina: number = 100;

    @property(Number)
    public maxStamina: number = 100;

    @property(Number)
    public staminaFillFullWidth: number = 70;

    @property(Number)
    public hpBarRightX: number = -35;

    @property(Number)
    public hpBarLeftX: number = 35;

    @property(Number)
    public staminaBarRightX: number = -35;

    @property(Number)
    public staminaBarLeftX: number = 35;

    @property(String)
    public deathReturnSceneUrl: string = "scenes/cunzhuang.ls";

    @property(Number)
    public initialFacingSign: number = 1;

    @property(Number)
    public attackAreaRightX: number = -100;

    @property(Number)
    public attackAreaLeftX: number = 0;

    @property(Number)
    public attackCooldown: number = 300;

    @property(Number)
    public attackPower: number = 10;

    @property(Number)
    public baseAttackPower: number = 10;

    @property(Number)
    public attackSpeed: number = 1;

    @property(Number)
    public attackDamageRange: number = 120;

    @property(String)
    public idleAnimation: string = "idle/idle_melee_swing";

    @property(String)
    public walkAnimation: string = "walk/walk_body_lower";

    @property(String)
    public runAnimation: string = "run/run_body_lower";

    @property(String)
    public attackAnimation: string = "attack/attack_melee_swing";

    @property(String)
    public rangedAttackAnimation: string = "attack/attack_ranged_firearm";

    @property(Boolean)
    public layeredSpineAnimationEnabled: boolean = true;

    @property(String)
    public upperIdleAnimation: string = "idle/idle_melee_swing";

    @property(String)
    public upperWalkAnimation: string = "walk/walk_body_upper_melee_swing";

    @property(String)
    public upperRunAnimation: string = "run/run_body_upper_melee_swing";

    @property(String)
    public rangedUpperIdleAnimation: string = "idle/idle_ranged_firearm";

    @property(String)
    public rangedUpperWalkAnimation: string = "walk/walk_body_upper_ranged_firearm";

    @property(String)
    public rangedUpperRunAnimation: string = "run/run_body_upper_ranged_firearm";

    @property(Number)
    public attackAnimationDuration: number = 1067;

    public movement!: PlayerMovementController;
    public ui!: PlayerUIHints;
    public combat!: PlayerCombatController;
    public animation!: PlayerAnimationController;
    private attackToken: number = 0;
    private staminaTickElapsed: number = 0;
    private deathReturnTriggered: boolean = false;
    private lastEquipmentSignature: string = "__init";
    private readonly lastEquipmentIconUrls: Record<EquipmentSlotType, string> = {
        insertPlate: "",
        helmet: "",
        weapon: "",
        armor: "",
    };
    private readonly lastEquipmentAttachmentNames: Record<EquipmentSlotType, string> = {
        insertPlate: "",
        helmet: "",
        weapon: "__init",
        armor: "",
    };

    onAwake(): void {
        PlayerController.activeInstance = this;
        this.movement = new PlayerMovementController(this);
        this.ui = new PlayerUIHints(this);
        this.combat = new PlayerCombatController(this);
        this.animation = new PlayerAnimationController(this);
        this.movement.onAwake();
        this.ui.onAwake();
        this.setRunningState(this.isRunning);
        this.combat.setAttackNodeVisible(false);
        this.syncHpFromData();
        this.syncStaminaFromData();
        this.refreshHpBar();
        this.refreshStaminaBar();
        this.syncEquipmentStats();
        Laya.timer.callLater(this, this.syncEquipmentSpineSlots);
        this.animation.onAwake();
    }

    onStart(): void {
        PlayerController.activeInstance = this;
        this.movement.onStart();
        this.ui.onStart();
        this.setRunningState(this.isRunning);
        this.combat.setAttackNodeVisible(false);
        this.syncHpFromData();
        this.syncStaminaFromData();
        this.refreshHpBar();
        this.refreshStaminaBar();
        this.syncEquipmentStats();
        Laya.timer.callLater(this, this.syncEquipmentSpineSlots);
        this.animation.onStart();
    }

    onUpdate(): void {
        this.movement.onUpdate();
        this.updateStamina();
        this.syncEquipmentStats();
        this.animation.onUpdate();
        this.syncEquipmentSpineSlots();
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

    public beginAttackHit(): number {
        this.attackToken += 1;
        return this.attackToken;
    }

    public endAttackHit(): void {
        this.attackToken = 0;
    }

    public getAttackToken(): number {
        return this.attackToken;
    }

    public syncEquipmentStats(): void {
        const dataManager = DataManager.getInstance();
        const weapon = dataManager.getEquippedItem("weapon");
        const signature = `${this.baseAttackPower}:${weapon ? `${weapon.itemId}:${weapon.count}` : ""}`;
        if (this.lastEquipmentSignature === signature) {
            return;
        }

        this.lastEquipmentSignature = signature;
        this.attackPower = Math.max(0, Math.floor((this.baseAttackPower || 0) + dataManager.getEquipmentAttackBonus()));
        this.attackSpeed = Math.max(0.1, dataManager.getEquipmentAttackSpeed());
        this.animation?.invalidateLocomotion();
        this.syncEquipmentSpineSlots(true);
    }

    public setRunningState(value: boolean): void {
        this.isRunning = value && this.currentStamina > 0;
        this.moveSpeed = this.isRunning ? this.runSpeed : 0;
    }

    public setRunning(value: boolean): void {
        this.setRunningState(value);
    }

    public toggleRunning(): void {
        this.setRunningState(!this.isRunning);
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

    public setHp(currentHp: number, maxHp: number = this.maxHp): void {
        this.maxHp = Math.max(1, Math.floor(maxHp));
        this.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.maxHp));
        DataManager.getInstance().setPlayerHp(this.currentHp, this.maxHp);
        this.refreshHpBar();

        if (this.currentHp <= 0) {
            this.returnToDeathScene();
        }
    }

    public takeDamage(amount: number): void {
        const damage = Math.max(0, Math.floor(amount));
        if (damage <= 0 || this.currentHp <= 0) {
            return;
        }

        this.setHp(this.currentHp - damage, this.maxHp);
    }

    public refreshHpBar(): void {
        const fill = this.hpFillNode as any;
        if (!fill) {
            return;
        }

        const ratio = this.currentHp / Math.max(1, this.maxHp);
        this.applyHpFillWidth(fill, Math.max(0, this.hpFillFullWidth * ratio));
        this.syncStatusBarTransform();
    }

    public syncHpFromData(): void {
        const stats = DataManager.getInstance().getPlayerStats();
        this.maxHp = Math.max(1, Math.floor(stats.maxHp || 100));
        const currentHp = Number.isFinite(stats.currentHp) ? stats.currentHp : this.maxHp;
        this.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.maxHp));
        this.refreshHpBar();
    }

    public setStamina(currentStamina: number, maxStamina: number = this.maxStamina): void {
        this.maxStamina = Math.max(1, Math.floor(maxStamina));
        this.currentStamina = Math.max(0, Math.min(Math.floor(currentStamina), this.maxStamina));
        DataManager.getInstance().setPlayerStamina(this.currentStamina, this.maxStamina);
        if (this.currentStamina <= 0 && this.isRunning) {
            this.setRunningState(false);
        }
        this.refreshStaminaBar();
    }

    public consumeStaminaForCompletedAttack(): void {
        this.setStamina(this.currentStamina - 10, this.maxStamina);
    }

    public syncStaminaFromData(): void {
        const stats = DataManager.getInstance().getPlayerStats();
        this.maxStamina = Math.max(1, Math.floor(stats.maxStamina || 100));
        const currentStamina = Number.isFinite(stats.currentStamina) ? stats.currentStamina : this.maxStamina;
        this.currentStamina = Math.max(0, Math.min(Math.floor(currentStamina), this.maxStamina));
        if (this.currentStamina <= 0 && this.isRunning) {
            this.setRunningState(false);
        }
        this.refreshStaminaBar();
    }

    public refreshStaminaBar(): void {
        const fill = this.staminaFillNode as any;
        if (!fill) {
            return;
        }

        const ratio = this.currentStamina / Math.max(1, this.maxStamina);
        this.applyHpFillWidth(fill, Math.max(0, this.staminaFillFullWidth * ratio));
        this.syncStatusBarTransform();
    }

    public syncStatusBarTransform(): void {
        const facingSign = this.movement ? this.movement.getFacingSign() : this.initialFacingSign >= 0 ? 1 : -1;
        this.applyCounterTransform(this.hpBarNode || this.hpFillNode?.parent || null, facingSign, this.hpBarRightX, this.hpBarLeftX);
        this.applyCounterTransform(this.staminaBarNode || this.staminaFillNode?.parent || null, facingSign, this.staminaBarRightX, this.staminaBarLeftX);
    }

    private updateStamina(): void {
        this.staminaTickElapsed += Math.max(0, Laya.timer.delta || 0);

        while (this.staminaTickElapsed >= 500) {
            this.staminaTickElapsed -= 500;

            if (this.isRunning && this.movement.getIsMovingNow()) {
                this.setStamina(this.currentStamina - 10, this.maxStamina);
            } else {
                this.setStamina(this.currentStamina + 3, this.maxStamina);
            }
        }
    }

    private returnToDeathScene(): void {
        if (this.deathReturnTriggered) {
            return;
        }

        const url = String(this.deathReturnSceneUrl || "scenes/cunzhuang.ls").trim();
        if (!url) {
            return;
        }

        this.deathReturnTriggered = true;
        Laya.timer.once(0, null, () => {
            DataManager.getInstance().returnToBaseAfterDeath(url);
            Laya.Scene.open(url);
        });
    }

    private applyHpFillWidth(fill: any, width: number): void {
        fill.width = width;

        const commands = fill._gcmds;
        if (!Array.isArray(commands)) {
            return;
        }

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command && "width" in command) {
                command.width = width;
            }
        }
    }

    private applyCounterTransform(node: Laya.Node | null, facingSign: number, rightX: number, leftX: number): void {
        const sprite = node as Laya.Sprite | null;
        if (!sprite) {
            return;
        }

        const facingRight = facingSign === (this.initialFacingSign >= 0 ? 1 : -1);
        sprite.x = facingRight ? leftX : rightX;
        sprite.scaleX = facingRight ? -1 : 1;
    }

    public syncWeaponSpineSlot(force: boolean = false): void {
        const activeSlotName = this.resolveActiveWeaponSpineSlotName();
        const meleeSlotName = String(this.weaponMeleeSpineSlotName || "").trim();
        const rangedSlotName = String(this.weaponRangedSpineSlotName || "").trim();

        if (meleeSlotName && meleeSlotName !== activeSlotName) {
            this.clearSpineSlotAttachment(meleeSlotName);
        }

        if (rangedSlotName && rangedSlotName !== activeSlotName) {
            this.clearSpineSlotAttachment(rangedSlotName);
        }

        this.syncEquipmentSpineSlot("weapon", activeSlotName, force);
    }

    public resolveUpperLocomotionAnimation(lowerAnimation: string): string {
        const ranged = this.isEquippedRangedWeapon();
        const idle = ranged
            ? this.rangedUpperIdleAnimation || this.upperIdleAnimation
            : this.upperIdleAnimation;

        if (lowerAnimation === this.runAnimation) {
            return ranged
                ? this.rangedUpperRunAnimation || idle || lowerAnimation
                : this.upperRunAnimation || idle || lowerAnimation;
        }

        if (lowerAnimation === this.walkAnimation) {
            return ranged
                ? this.rangedUpperWalkAnimation || idle || lowerAnimation
                : this.upperWalkAnimation || idle || lowerAnimation;
        }

        return idle || lowerAnimation;
    }

    public resolveAttackAnimation(): string {
        if (this.isEquippedRangedWeapon()) {
            return this.rangedAttackAnimation || this.attackAnimation;
        }

        return this.attackAnimation;
    }

    public syncEquipmentSpineSlots(force: boolean = false): void {
        this.syncEquipmentSpineSlot("insertPlate", this.insertPlateSpineSlotName, force);
        this.syncEquipmentSpineSlot("helmet", this.helmetSpineSlotName, force);
        this.syncWeaponSpineSlot(force);
        this.syncEquipmentSpineSlot("armor", this.armorSpineSlotName, force);
    }

    private syncEquipmentSpineSlot(slot: EquipmentSlotType, spineSlotName: string, force: boolean): void {
        const slotName = String(spineSlotName || "").trim();
        if (!slotName) {
            return;
        }

        const attachmentName = this.resolveEquippedAttachmentName(slot);
        if (!attachmentName) {
            if (force || this.lastEquipmentAttachmentNames[slot]) {
                if (this.clearSpineSlotAttachment(slotName)) {
                    this.lastEquipmentAttachmentNames[slot] = "";
                    this.lastEquipmentIconUrls[slot] = "";
                }
            }
            return;
        }

        if (!force && attachmentName === this.lastEquipmentAttachmentNames[slot]) {
            return;
        }

        if (this.applySpineSlotAttachment(slotName, attachmentName)) {
            this.lastEquipmentAttachmentNames[slot] = attachmentName;
            this.lastEquipmentIconUrls[slot] = this.resolveEquippedItemIconUrl(slot);
        }
    }

    public refreshEquipmentFromData(): void {
        this.lastEquipmentSignature = "__force";
        this.syncEquipmentStats();
        this.syncEquipmentSpineSlots(true);
    }

    private resolveEquippedItemIconUrl(slot: EquipmentSlotType): string {
        const item = DataManager.getInstance().getEquippedItem(slot);
        if (!item || !item.icon) {
            return "";
        }

        return this.resolveAssetUrl(item.icon);
    }

    private resolveEquippedAttachmentName(slot: EquipmentSlotType): string {
        const item = DataManager.getInstance().getEquippedItem(slot);
        if (!item) {
            return "";
        }

        if (slot === "weapon") {
            return this.resolveWeaponAttachmentName(item.itemId);
        }

        if (slot === "armor") {
            return "cloth";
        }

        return "";
    }

    private resolveWeaponAttachmentName(itemId: string): string {
        const map: Record<string, string> = {
            wood_club: "weapon_slot7",
            baseket_bat: "basekat_bat",
            cleaver: "weapon_slot",
            knife: "weapon_slot2",
            long_knife: "weapon_slot5",
            machete: "weapon_slot6",
            m16: "weapon_ranged_M16",
        };

        return map[itemId] || "";
    }

    private resolveActiveWeaponSpineSlotName(): string {
        if (this.isEquippedRangedWeapon()) {
            return String(this.weaponRangedSpineSlotName || this.weaponSpineSlotName || "").trim();
        }

        return String(this.weaponMeleeSpineSlotName || this.weaponSpineSlotName || "").trim();
    }

    public isEquippedRangedWeapon(): boolean {
        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        if (!weapon || !weapon.itemId) {
            return false;
        }

        const meta = DataManager.getInstance().resolveItemMeta(weapon.itemId);
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        return subCategory.includes("ranged");
    }

    private applySpineSlotAttachment(slotName: string, attachmentName: string | null): boolean {
        const spine = this.spineNode ? this.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
        if (!spine) {
            return false;
        }

        const anySpine = spine as any;
        if (typeof anySpine.setSlotAttachment === "function") {
            try {
                anySpine.setSlotAttachment(slotName, attachmentName);
                return true;
            } catch (error) {
                return false;
            }
        }

        if (typeof anySpine.setAttachment === "function") {
            try {
                anySpine.setAttachment(slotName, attachmentName);
                return true;
            } catch (error) {
                return false;
            }
        }

        return false;
    }

    private clearSpineSlotAttachment(slotName: string): boolean {
        return this.applySpineSlotAttachment(slotName, null);
    }
    private resolveAssetUrl(path: string): string {
        const normalized = String(path || "").trim().replace(/^assets\//, "");
        if (!normalized) {
            return "";
        }

        const url = (Laya as any).URL;
        if (url && typeof url.formatURL === "function") {
            return String(url.formatURL(normalized) || normalized);
        }

        return normalized;
    }

    public snapshot(): Record<string, any> {
        return {
            walkSpeed: this.walkSpeed,
            runSpeed: this.runSpeed,
            moveSpeed: this.moveSpeed,
            footstepSoundEnabled: this.footstepSoundEnabled,
            cunzhuangWalkSoundUrl: this.cunzhuangWalkSoundUrl,
            cunzhuangRunSoundUrl: this.cunzhuangRunSoundUrl,
            forestWalkSoundUrl: this.forestWalkSoundUrl,
            forestRunSoundUrl: this.forestRunSoundUrl,
            mineWalkSoundUrl: this.mineWalkSoundUrl,
            mineRunSoundUrl: this.mineRunSoundUrl,
            walkFootstepInterval: this.walkFootstepInterval,
            runFootstepInterval: this.runFootstepInterval,
            walkFootstepPlaybackRate: this.walkFootstepPlaybackRate,
            runFootstepPlaybackRate: this.runFootstepPlaybackRate,
            footstepPlaybackRateVariance: this.footstepPlaybackRateVariance,
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
            hpFillNode: this.hpFillNode ? this.hpFillNode.name : null,
            hpBarNode: this.hpBarNode ? this.hpBarNode.name : null,
            staminaFillNode: this.staminaFillNode ? this.staminaFillNode.name : null,
            staminaBarNode: this.staminaBarNode ? this.staminaBarNode.name : null,
            weaponSlotNode: this.weaponSlotNode ? this.weaponSlotNode.name : null,
            weaponIconNode: this.weaponIconNode ? this.weaponIconNode.name : null,
            weaponSpineSlotName: this.weaponSpineSlotName,
            weaponMeleeSpineSlotName: this.weaponMeleeSpineSlotName,
            weaponRangedSpineSlotName: this.weaponRangedSpineSlotName,
            insertPlateSpineSlotName: this.insertPlateSpineSlotName,
            helmetSpineSlotName: this.helmetSpineSlotName,
            armorSpineSlotName: this.armorSpineSlotName,
            lastEquipmentIconUrls: { ...this.lastEquipmentIconUrls },
            currentHp: this.currentHp,
            maxHp: this.maxHp,
            hpFillFullWidth: this.hpFillFullWidth,
            currentStamina: this.currentStamina,
            maxStamina: this.maxStamina,
            staminaFillFullWidth: this.staminaFillFullWidth,
            hpBarRightX: this.hpBarRightX,
            hpBarLeftX: this.hpBarLeftX,
            staminaBarRightX: this.staminaBarRightX,
            staminaBarLeftX: this.staminaBarLeftX,
            deathReturnSceneUrl: this.deathReturnSceneUrl,
            owner: this.owner ? this.owner.name : null,
            scaleX: this.owner ? (this.owner as Laya.Sprite).scaleX : null,
            initialFacingSign: this.initialFacingSign,
            attackAreaRightX: this.attackAreaRightX,
            attackAreaLeftX: this.attackAreaLeftX,
            attackCooldown: this.attackCooldown,
            attackPower: this.attackPower,
            baseAttackPower: this.baseAttackPower,
            attackSpeed: this.attackSpeed,
            attackDamageRange: this.attackDamageRange,
            movement: this.movement ? this.movement.snapshot() : null,
            ui: this.ui ? this.ui.snapshot() : null,
            combat: this.combat ? this.combat.snapshot() : null,
            animation: this.animation ? this.animation.snapshot() : null,
        };
    }
}
