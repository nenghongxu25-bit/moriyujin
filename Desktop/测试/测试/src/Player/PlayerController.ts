const { regClass, property } = Laya;

import { PlayerMovementController } from "./PlayerMovementController";
import { PlayerUIHints } from "./PlayerUIHints";
import { PlayerCombatController, type PlayerAttackOptions } from "./PlayerCombatController";
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

    @property(Number)
    public attackHitboxShowDelay: number = 0;

    @property(Number)
    public attackHitboxVisibleDuration: number = 200;

    @property(Number)
    public rangedAttackRange: number = 520;

    @property(Number)
    public rangedAttackWidth: number = 90;

    @property(Number)
    public rangedAttackHitDelay: number = 220;

    @property(String)
    public rangedAttackSoundUrl: string = "sound/sfx/weapon/ranged/akm/akm_singleshot.mp3";

    @property(Number)
    public rangedWeaponAimRotationOffset: number = 0;

    @property(Number)
    public rangedChargeDuration: number = 900;

    @property(Number)
    public rangedMinDamageMultiplier: number = 0.75;

    @property(Number)
    public rangedMaxDamageMultiplier: number = 2;

    @property(String)
    public rangedBulletTextureUrl: string = "atlas/picture/ui/zidan.png";

    @property(Number)
    public rangedBulletSpeed: number = 900;

    @property(Number)
    public rangedBulletScale: number = 1;

    @property(Number)
    public rangedBulletRotationOffset: number = 0;

    @property(Number)
    public rangedBulletSpawnOffsetX: number = 0;

    @property(Number)
    public rangedBulletSpawnOffsetY: number = 0;

    @property(String)
    public idleAnimation: string = "idle/idle_melee_swing";

    @property(String)
    public walkAnimation: string = "walk/walk_body_lower";

    @property(String)
    public runAnimation: string = "run/run_body_lower";

    @property({ type: Number, caption: "Run Animation Rate", tips: "Playback rate used only by the player run Spine locomotion animation." })
    public runAnimationPlaybackRate: number = 1.3;

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
    private lastWeaponVisualSignature: string = "__init";
    private equipmentVisualInitAttempts: number = 0;
    private rangedWeaponAimActive: boolean = false;
    private rangedWeaponAimX: number = 1;
    private rangedWeaponAimY: number = 0;
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
        this.animation.onAwake();
        this.scheduleEquipmentVisualInitialization();
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
        this.animation.onStart();
        this.scheduleEquipmentVisualInitialization();
    }

    onUpdate(): void {
        this.movement.onUpdate();
        this.updateStamina();
        this.syncEquipmentStats();
        this.animation.onUpdate();
        this.syncRangedWeaponAimRotation("update");
    }

    onLateUpdate(): void {
        this.syncRangedWeaponAimRotation("late");
    }

    onPreRender(): void {
        this.syncRangedWeaponAimRotation("pre");
    }

    onDestroy(): void {
        if (PlayerController.activeInstance === this) {
            PlayerController.activeInstance = null;
        }

        this.animation?.onDestroy();
        this.combat?.onDestroy();
        this.ui?.onDestroy();
        Laya.timer.clear(this, this.tryInitializeEquipmentVisuals);
    }

    public playAttack(queueIfBusy: boolean = false, options: PlayerAttackOptions = {}): boolean {
        return this.combat.playAttack(queueIfBusy, options);
    }

    public clearQueuedAttack(): void {
        this.combat.clearQueuedAttack();
    }

    public setAttackFacingByDirection(x: number, y: number = 0): boolean {
        return this.movement.setAttackFacingByDirection(x, y);
    }

    public clearAttackFacingOverride(): void {
        this.movement.clearAttackFacingOverride();
    }

    public setRangedWeaponAimByDirection(x: number, y: number = 0): void {
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude <= 0.0001) {
            return;
        }

        Laya.timer.clear(this, this.clearRangedWeaponAim);
        this.rangedWeaponAimActive = true;
        this.rangedWeaponAimX = x / magnitude;
        this.rangedWeaponAimY = y / magnitude;
        this.syncRangedWeaponAimRotation("input");
    }

    public clearRangedWeaponAim(): void {
        Laya.timer.clear(this, this.clearRangedWeaponAim);
        this.rangedWeaponAimActive = false;
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
        this.scheduleEquipmentVisualInitialization();
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

    public syncWeaponSpineSlot(force: boolean = false): boolean {
        const activeSlotName = this.resolveActiveWeaponSpineSlotName();
        const meleeSlotName = String(this.weaponMeleeSpineSlotName || "").trim();
        const rangedSlotName = String(this.weaponRangedSpineSlotName || "").trim();
        const visualSignature = this.resolveWeaponVisualSignature(activeSlotName);
        const shouldForce = force || visualSignature !== this.lastWeaponVisualSignature;

        if (shouldForce) {
            let cleared = true;
            if (meleeSlotName) {
                cleared = this.clearSpineSlotAttachment(meleeSlotName) && cleared;
            }
            if (rangedSlotName) {
                cleared = this.clearSpineSlotAttachment(rangedSlotName) && cleared;
            }
            if (!cleared) {
                return false;
            }
        }

        if (this.syncEquipmentSpineSlot("weapon", activeSlotName, shouldForce)) {
            this.lastWeaponVisualSignature = visualSignature;
            return true;
        }

        return false;
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

    public syncEquipmentSpineSlots(force: boolean = false): boolean {
        let success = true;
        success = this.syncEquipmentSpineSlot("insertPlate", this.insertPlateSpineSlotName, force) && success;
        success = this.syncEquipmentSpineSlot("helmet", this.helmetSpineSlotName, force) && success;
        success = this.syncWeaponSpineSlot(force) && success;
        success = this.syncEquipmentSpineSlot("armor", this.armorSpineSlotName, force) && success;
        return success;
    }

    private syncEquipmentSpineSlot(slot: EquipmentSlotType, spineSlotName: string, force: boolean): boolean {
        const slotName = String(spineSlotName || "").trim();
        if (!slotName) {
            return true;
        }

        const attachmentName = this.resolveEquippedAttachmentName(slot);
        if (!attachmentName) {
            if (force || this.lastEquipmentAttachmentNames[slot]) {
                if (this.clearSpineSlotAttachment(slotName)) {
                    this.lastEquipmentAttachmentNames[slot] = "";
                    this.lastEquipmentIconUrls[slot] = "";
                    return true;
                }
                return false;
            }
            return true;
        }

        if (!force && attachmentName === this.lastEquipmentAttachmentNames[slot]) {
            return true;
        }

        if (this.applySpineSlotAttachment(slotName, attachmentName)) {
            this.lastEquipmentAttachmentNames[slot] = attachmentName;
            this.lastEquipmentIconUrls[slot] = this.resolveEquippedItemIconUrl(slot);
            return true;
        }

        return false;
    }

    public refreshEquipmentFromData(): void {
        this.lastEquipmentSignature = "__force";
        this.lastWeaponVisualSignature = "__force";
        this.syncEquipmentStats();
        this.scheduleEquipmentVisualInitialization();
    }

    public refreshEquipmentVisualsFromData(): boolean {
        return this.syncEquipmentSpineSlots(true);
    }

    private scheduleEquipmentVisualInitialization(): void {
        Laya.timer.clear(this, this.tryInitializeEquipmentVisuals);
        this.equipmentVisualInitAttempts = 0;
        this.tryInitializeEquipmentVisuals();
    }

    private tryInitializeEquipmentVisuals = (): void => {
        this.equipmentVisualInitAttempts += 1;
        if (this.refreshEquipmentVisualsFromData()) {
            return;
        }

        if (this.equipmentVisualInitAttempts < 20) {
            Laya.timer.once(50, this, this.tryInitializeEquipmentVisuals);
        }
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
            fal: "weapon_ranged_FAL",
            m16: "weapon_ranged_M16",
            geluoke: "weapon_ranged_geluoke",
            akm: "weapon_ranged_AK47",
        };

        return map[itemId] || "";
    }

    private resolveActiveWeaponSpineSlotName(): string {
        if (this.isEquippedRangedWeapon()) {
            return String(this.weaponRangedSpineSlotName || this.weaponSpineSlotName || "").trim();
        }

        return String(this.weaponMeleeSpineSlotName || this.weaponSpineSlotName || "").trim();
    }

    private resolveWeaponVisualSignature(activeSlotName: string): string {
        const weapon = DataManager.getInstance().getEquippedItem("weapon");
        const itemId = weapon?.itemId || "";
        const attachmentName = itemId ? this.resolveWeaponAttachmentName(itemId) : "";
        const ranged = this.isEquippedRangedWeapon() ? "ranged" : "melee";
        return [
            ranged,
            itemId,
            attachmentName,
            activeSlotName,
            String(this.weaponMeleeSpineSlotName || "").trim(),
            String(this.weaponRangedSpineSlotName || "").trim(),
        ].join("|");
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

    public applyRangedAttackDamage(options: PlayerAttackOptions = {}): boolean {
        const target = this.resolveRangedAttackTarget(options);
        if (!target) {
            return false;
        }

        target.receiver.takeDamage(this.resolveRangedAttackDamage(options.chargeRatio));
        return true;
    }

    public spawnRangedBullet(options: PlayerAttackOptions = {}): void {
        const owner = this.owner as Laya.Sprite | null;
        const textureUrl = String(this.rangedBulletTextureUrl || "").trim().replace(/^assets\//, "");
        if (!owner || !textureUrl) {
            return;
        }

        const parent = owner.parent as Laya.Sprite | null;
        if (!parent || typeof parent.globalToLocal !== "function") {
            return;
        }

        const direction = this.resolveRangedDirection(options);
        const baseAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        const spreadAngle = Math.max(0, Number(options.spreadAngle) || 0);
        const bulletAngle = baseAngle + (Math.random() - 0.5) * spreadAngle;
        const radians = bulletAngle * Math.PI / 180;
        const range = Math.max(1, Number(this.rangedAttackRange) || Number(this.attackDamageRange) || 1);
        const speed = Math.max(1, Number(this.rangedBulletSpeed) || 1);
        const duration = Math.max(1, Math.floor(range / speed * 1000));
        const globalStart = this.resolveRangedBulletStartGlobalPoint(owner, direction);
        const localStart = parent.globalToLocal(globalStart, false);
        const bullet = new Laya.Sprite();
        const scale = Math.max(0.01, Number(this.rangedBulletScale) || 1);

        bullet.mouseEnabled = false;
        bullet.loadImage(textureUrl, Laya.Handler.create(this, this.centerRangedBulletPivot, [bullet]));
        bullet.pos(localStart.x, localStart.y);
        bullet.scale(scale, scale);
        bullet.rotation = bulletAngle + (Number(this.rangedBulletRotationOffset) || 0);
        parent.addChild(bullet);

        Laya.Tween.to(
            bullet,
            {
                x: localStart.x + Math.cos(radians) * range,
                y: localStart.y + Math.sin(radians) * range,
            },
            duration,
            undefined,
            Laya.Handler.create(this, this.destroyRangedBullet, [bullet]),
        );
    }

    public resolveRangedChargeRatio(heldMs: number, dragRatio: number): number {
        const duration = Math.max(1, this.rangedChargeDuration || 1);
        const timeRatio = Math.max(0, Math.min(1, heldMs / duration));
        const aimRatio = Math.max(0, Math.min(1, dragRatio));
        return Math.max(timeRatio, aimRatio);
    }

    private resolveRangedAttackDamage(chargeRatio: number = 0): number {
        const ratio = Math.max(0, Math.min(1, Number(chargeRatio) || 0));
        const minMultiplier = Math.max(0, Number(this.rangedMinDamageMultiplier) || 0);
        const maxMultiplier = Math.max(minMultiplier, Number(this.rangedMaxDamageMultiplier) || minMultiplier);
        const multiplier = minMultiplier + (maxMultiplier - minMultiplier) * ratio;
        return Math.max(1, Math.floor((this.attackPower || 0) * multiplier));
    }

    private resolveRangedAttackTarget(options: PlayerAttackOptions): { receiver: { takeDamage(amount: number): void }; distance: number } | null {
        const owner = this.owner as Laya.Sprite | null;
        if (!owner || !Laya.stage) {
            return null;
        }

        const origin = this.getGlobalPosition(owner);
        const direction = this.resolveRangedDirection(options);
        const range = Math.max(1, this.rangedAttackRange || this.attackDamageRange || 1);
        const halfWidth = Math.max(1, (this.rangedAttackWidth || 1) / 2);
        let best: { receiver: { takeDamage(amount: number): void }; distance: number } | null = null;

        this.visitNodes(Laya.stage, (node) => {
            if (node === this.owner) {
                return;
            }

            const receiver = this.findDamageReceiver(node);
            if (!receiver || (receiver.isDead && receiver.isDead())) {
                return;
            }

            const point = this.getGlobalPosition(node as Laya.Sprite);
            const dx = point.x - origin.x;
            const dy = point.y - origin.y;
            const forward = dx * direction.x + dy * direction.y;
            if (forward <= 0 || forward > range) {
                return;
            }

            const side = Math.abs(dx * direction.y - dy * direction.x);
            if (side > halfWidth) {
                return;
            }

            if (!best || forward < best.distance) {
                best = { receiver, distance: forward };
            }
        });

        return best;
    }

    private resolveRangedDirection(options: PlayerAttackOptions): { x: number; y: number } {
        let x = Number(options.directionX) || 0;
        let y = Number(options.directionY) || 0;
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude > 0.0001) {
            return { x: x / magnitude, y: y / magnitude };
        }

        x = this.movement?.getAttackDirection() || 1;
        return { x: x >= 0 ? 1 : -1, y: 0 };
    }

    private resolveRangedBulletStartGlobalPoint(owner: Laya.Sprite, direction: { x: number; y: number }): Laya.Point {
        const localStart = new Laya.Point(
            direction.x * (Number(this.rangedBulletSpawnOffsetX) || 0),
            direction.y * (Number(this.rangedBulletSpawnOffsetX) || 0) + (Number(this.rangedBulletSpawnOffsetY) || 0),
        );
        return owner.localToGlobal(localStart, false);
    }

    private destroyRangedBullet(bullet: Laya.Sprite): void {
        Laya.Tween.clearAll(bullet);
        if (!bullet.destroyed) {
            bullet.destroy();
        }
    }

    private centerRangedBulletPivot(bullet: Laya.Sprite): void {
        if (!bullet || bullet.destroyed) {
            return;
        }

        const texture = (bullet as any).texture;
        const width = Number(texture?.width) || Number((bullet as any).width) || 0;
        const height = Number(texture?.height) || Number((bullet as any).height) || 0;
        if (width > 0 && height > 0) {
            bullet.pivot(width * 0.5, height * 0.5);
        }
    }

    private findDamageReceiver(node: Laya.Node | null): ({ takeDamage(amount: number): void; isDead?(): boolean } | null) {
        const components = (node as any)?._components || (node as any)?.components || [];
        for (let i = 0; i < components.length; i++) {
            const component = components[i] as any;
            if (component === this || !component || typeof component.takeDamage !== "function") {
                continue;
            }

            if (typeof component.isDead === "function") {
                return component;
            }
        }

        return null;
    }

    private visitNodes(root: Laya.Node | null, visitor: (node: Laya.Node) => void): void {
        if (!root) {
            return;
        }

        visitor(root);
        const childCount = (root as any).numChildren || 0;
        for (let i = 0; i < childCount; i++) {
            this.visitNodes(root.getChildAt(i), visitor);
        }
    }

    private getGlobalPosition(node: Laya.Sprite): Laya.Point {
        const point = new Laya.Point();
        if (node && typeof node.localToGlobal === "function") {
            node.localToGlobal(point, false);
        }
        return point;
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
        const spine = this.spineNode ? this.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
        if (!spine) {
            return false;
        }

        const anySpine = spine as any;
        let cleared = false;

        if (this.applySpineSlotAttachment(slotName, null)) {
            cleared = true;
        }

        if (typeof anySpine.setSlotAttachment === "function") {
            try {
                anySpine.setSlotAttachment(slotName, "");
                cleared = true;
            } catch (error) {
            }
        }

        try {
            const slot = typeof anySpine.findSlot === "function" ? anySpine.findSlot(slotName) : null;
            if (slot && typeof slot.setAttachment === "function") {
                slot.setAttachment(null);
                cleared = true;
            }
        } catch (error) {
        }

        return cleared;
    }

    private syncRangedWeaponAimRotation(phase: string = "update"): void {
        if (!this.rangedWeaponAimActive || !this.isEquippedRangedWeapon()) {
            return;
        }

        const slotName = String(this.weaponRangedSpineSlotName || this.weaponSpineSlotName || "").trim();
        if (!slotName) {
            return;
        }

        const spine = this.spineNode ? this.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
        this.configureSpineForRuntimeAim(spine);
        const skeleton = this.resolveSpineSkeleton(spine);
        const bone = this.resolveSpineSlotBone(spine, slotName, skeleton);
        if (!bone) {
            return;
        }

        const worldAngle = Math.atan2(this.rangedWeaponAimY, this.rangedWeaponAimX) * 180 / Math.PI;
        const ownerScaleX = this.owner ? (this.owner as Laya.Sprite).scaleX : 1;
        const localAngle = ownerScaleX < 0 ? 180 - worldAngle : worldAngle;
        const targetRotation = this.normalizeDegrees(localAngle + (Number(this.rangedWeaponAimRotationOffset) || 0));
        bone.rotation = targetRotation;

        if (skeleton && typeof skeleton.updateWorldTransform === "function") {
            try {
                const physics = (globalThis as any).spine?.Physics?.update ?? 2;
                skeleton.updateWorldTransform(physics);
            } catch (error) {
            }
        } else if (typeof bone.updateWorldTransform === "function") {
            try {
                bone.updateWorldTransform();
            } catch (error) {
            }
        }

        this.markSpineRenderDirty(spine);
    }

    private configureSpineForRuntimeAim(spine: Laya.Spine2DRenderNode | null): void {
        const anySpine = spine as any;
        if (!anySpine) {
            return;
        }

        try {
            if ("enableCache" in anySpine) {
                anySpine.enableCache = false;
            }
            if ("useFastRender" in anySpine) {
                anySpine.useFastRender = false;
            }
        } catch (error) {
        }
    }

    private markSpineRenderDirty(spine: Laya.Spine2DRenderNode | null): void {
        const anySpine = spine as any;
        if (!anySpine) {
            return;
        }

        if ("_needUpdate" in anySpine) {
            anySpine._needUpdate = true;
        }
    }

    private resolveSpineSlotBone(spine: Laya.Spine2DRenderNode | null, slotName: string, skeleton?: any | null): any | null {
        if (!spine) {
            return null;
        }

        const anySpine = spine as any;

        try {
            const slot = typeof anySpine.getSlotByName === "function"
                ? anySpine.getSlotByName(slotName)
                : null;
            if (slot?.bone) {
                return slot.bone;
            }
        } catch (error) {
        }

        try {
            const slot = typeof anySpine.findSlot === "function"
                ? anySpine.findSlot(slotName)
                : null;
            if (slot?.bone) {
                return slot.bone;
            }
        } catch (error) {
        }

        try {
            const slot = skeleton && typeof skeleton.findSlot === "function"
                ? skeleton.findSlot(slotName)
                : null;
            return slot?.bone || null;
        } catch (error) {
            return null;
        }
    }

    private resolveSpineSkeleton(spine: Laya.Spine2DRenderNode | null): any | null {
        const render = (spine as any)?._spineRender;
        if (!render || typeof render.getSkeleton !== "function") {
            return null;
        }

        try {
            return render.getSkeleton();
        } catch (error) {
            return null;
        }
    }

    private normalizeDegrees(value: number): number {
        let result = value;
        while (result > 180) {
            result -= 360;
        }
        while (result < -180) {
            result += 360;
        }
        return result;
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
            runAnimationPlaybackRate: this.runAnimationPlaybackRate,
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
            attackHitboxShowDelay: this.attackHitboxShowDelay,
            attackHitboxVisibleDuration: this.attackHitboxVisibleDuration,
            rangedAttackRange: this.rangedAttackRange,
            rangedAttackWidth: this.rangedAttackWidth,
            rangedAttackHitDelay: this.rangedAttackHitDelay,
            rangedAttackSoundUrl: this.rangedAttackSoundUrl,
            rangedWeaponAimRotationOffset: this.rangedWeaponAimRotationOffset,
            rangedChargeDuration: this.rangedChargeDuration,
            rangedMinDamageMultiplier: this.rangedMinDamageMultiplier,
            rangedMaxDamageMultiplier: this.rangedMaxDamageMultiplier,
            rangedBulletTextureUrl: this.rangedBulletTextureUrl,
            rangedBulletSpeed: this.rangedBulletSpeed,
            rangedBulletScale: this.rangedBulletScale,
            rangedBulletRotationOffset: this.rangedBulletRotationOffset,
            rangedBulletSpawnOffsetX: this.rangedBulletSpawnOffsetX,
            rangedBulletSpawnOffsetY: this.rangedBulletSpawnOffsetY,
            movement: this.movement ? this.movement.snapshot() : null,
            ui: this.ui ? this.ui.snapshot() : null,
            combat: this.combat ? this.combat.snapshot() : null,
            animation: this.animation ? this.animation.snapshot() : null,
        };
    }
}
