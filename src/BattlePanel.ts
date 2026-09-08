const { regClass } = Laya;

interface BattleUnit {
    name: string;
    level: number;
    strength: number;
    technique: number;
    agility: number;
    rootBone: number;
    innerBreath: number;
    willpower: number;
    hp: number;
    maxHp: number;
    hpRegen: number;
    nl: number;
    maxNl: number;
    nlRegen: number;
    attack: number;
    defense: number;
    hit: number;
    dodge: number;
    parry: number;
    speed: number;
    damageReduction: number;
    side: "player" | "enemy";
}

type BattleStatKey =
    | "strength"
    | "technique"
    | "agility"
    | "rootBone"
    | "innerBreath"
    | "willpower"
    | "attack"
    | "defense"
    | "speed"
    | "hit"
    | "dodge"
    | "parry"
    | "resistance"
    | "toughness"
    | "hp"
    | "nl"
    | "hpRegen"
    | "nlRegen"
    | "damageReduction";

type BattleStats = Partial<Record<BattleStatKey, number>>;

interface DamageEvent {
    side: "player" | "enemy";
    index: number;
    damage: number;
    result: "damage" | "dodge" | "parry";
    text: string;
}

@regClass()
export class BattlePanel extends Laya.Script {
    private static readonly ROUND_INTERVAL = 1200;
    private static readonly ACTION_INTERVAL = 450;
    private static readonly APPROACH_DURATION = 180;
    private static readonly WINDUP_DELAY = 120;
    private static readonly CHARGE_DURATION = 200;
    private static readonly STRIKE_CURVE_DURATION = 0.3;
    private static readonly STRIKE_CURVE_HEIGHT = 2500;
    private static readonly STRIKE_DURATION = BattlePanel.STRIKE_CURVE_DURATION * 1000;
    private static readonly RETURN_DURATION = 180;
    private static readonly CHARGE_DISTANCE = 18;
    private static readonly STRIKE_DISTANCE = 150;
    private static readonly RECOVERY_TEXT_DURATION = 700;
    private static readonly HP_REGEN_TEXT_NAME = "HpRegenText";
    private static readonly NL_REGEN_TEXT_NAME = "NlRegenText";
    private static readonly DEFENSE_CORRECTION_COEFFICIENT = 1;
    private static readonly PARRY_RATE_SPEED_COEFFICIENT = 1.5;
    private static readonly DODGE_RATE_HIT_COEFFICIENT = 1.5;
    private static readonly TRIGGER_RATE_LEVEL_COEFFICIENT = 10;
    private static readonly TRIGGER_RATE_CONSTANT = 500;
    private static readonly BASE_PARRY_DAMAGE_REDUCTION = 0.2;
    private static readonly BASE_DODGE_DAMAGE_REDUCTION = 0.15;
    private static readonly ATTRIBUTE_TRIGGER_REDUCTION_SCALE = 0.001;
    private static readonly DEFAULT_ROLE_LEVEL = 100;

    private static readonly LEVEL_GROWTH_STATS: BattleStats = {
        attack: 20,
        defense: 20,
        hp: 100,
        hit: 5,
        dodge: 5,
        parry: 5,
        speed: 5,
        nl: 10,
    };

    private playerFormation: Laya.GWidget | null = null;
    private enemyFormation: Laya.GWidget | null = null;
    private actionList: Laya.GList | null = null;
    private roundText: Laya.Text | null = null;
    private exitBattleButton: Laya.Sprite | null = null;
    private readonly playerSlots: Array<Laya.GWidget | null> = [];
    private readonly enemySlots: Array<Laya.GWidget | null> = [];
    private round = 1;
    private battleEnded = false;

    private readonly playerUnits: BattleUnit[] = [
        this.createDefaultUnit("青槐", "player"),
        this.createDefaultUnit("苏云澜", "player"),
        this.createDefaultUnit("段青岚", "player"),
        this.createDefaultUnit("柳听雪", "player"),
        this.createDefaultUnit("燕十方", "player"),
    ];

    private readonly enemyUnits: BattleUnit[] = [
        this.createDefaultUnit("东方不败", "enemy", 2),
    ];

    onAwake(): void {
        const root = this.owner as Laya.Node;
        this.playerFormation = this.findNode(root, "playerlist") as Laya.GWidget | null;
        this.enemyFormation = this.findNode(root, "playerlist_1") as Laya.GWidget | null;
        this.actionList = this.findNode(root, "list") as Laya.GList | null;
        this.roundText = this.findNode(root, "huihe") as Laya.Text | null;
        this.exitBattleButton = this.findExitBattleButton(root);
        if (this.exitBattleButton) {
            this.exitBattleButton.visible = false;
        }

        this.hideLegacyFormation();
        this.collectFormationSlots();
        this.refreshBattleLists();

        if (this.actionList) {
            this.actionList.itemRenderer = (index: number, item: Laya.GWidget) => {
                this.renderActionItem(index, item);
            };
            this.actionList.numItems = 1;
        }

        this.updateRoundText("自动战斗开始");
        Laya.timer.once(BattlePanel.ROUND_INTERVAL, this, this.processRound);
    }

    onDestroy(): void {
        Laya.timer.clear(this, this.processRound);
        Laya.timer.clear(this, this.processRoundAction);
        Laya.timer.clearAll(this);
    }

    private createDefaultUnit(name: string, side: "player" | "enemy", multiplier = 1): BattleUnit {
        const baseAttribute = Math.round(130 * multiplier);
        const level = Math.max(1, Math.round(BattlePanel.DEFAULT_ROLE_LEVEL * multiplier));
        const stats = this.calculateBattlePanelStats({
            strength: baseAttribute,
            technique: baseAttribute,
            agility: baseAttribute,
            rootBone: baseAttribute,
            innerBreath: baseAttribute,
            willpower: baseAttribute,
        }, level);
        const maxHp = Math.round(stats.hp ?? 1);
        const maxNl = Math.round(stats.nl ?? 1);
        return {
            name,
            level,
            strength: Math.round(stats.strength ?? 0),
            technique: Math.round(stats.technique ?? 0),
            agility: Math.round(stats.agility ?? 0),
            rootBone: Math.round(stats.rootBone ?? 0),
            innerBreath: Math.round(stats.innerBreath ?? 0),
            willpower: Math.round(stats.willpower ?? 0),
            hp: maxHp,
            maxHp,
            hpRegen: Math.round(stats.hpRegen ?? 0),
            nl: maxNl,
            maxNl,
            nlRegen: Math.round(stats.nlRegen ?? 0),
            attack: Math.round(stats.attack ?? 0),
            defense: Math.round(stats.defense ?? 0),
            hit: Math.round(stats.hit ?? 0),
            dodge: Math.round(stats.dodge ?? 0),
            parry: Math.round(stats.parry ?? 0),
            speed: Math.round(stats.speed ?? 0),
            damageReduction: stats.damageReduction ?? 0,
            side,
        };
    }

    private calculateBattlePanelStats(initialStats: BattleStats, level: number): BattleStats {
        const equipmentStats = this.getDefaultEquipmentStats();
        const skillStats = this.getDefaultSkillStats();
        const primaryAttributeSource = this.addStats(
            this.pickStats(initialStats, ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]),
            this.pickStats(equipmentStats, ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]),
            this.pickStats(skillStats, ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]),
        );
        const selfStats = this.addStats(
            initialStats,
            this.multiplyStats(BattlePanel.LEVEL_GROWTH_STATS, Math.max(0, level - 1)),
            this.getConvertedAttributeStats(primaryAttributeSource),
            equipmentStats,
            skillStats,
        );

        return this.roundStats(selfStats);
    }

    private getConvertedAttributeStats(attributes: BattleStats): BattleStats {
        const strength = attributes.strength ?? 0;
        const technique = attributes.technique ?? 0;
        const agility = attributes.agility ?? 0;
        const rootBone = attributes.rootBone ?? 0;
        const innerBreath = attributes.innerBreath ?? 0;
        const willpower = attributes.willpower ?? 0;

        return {
            attack: strength * 5,
            hp: rootBone * 20,
            hit: technique * 5,
            dodge: agility * 5,
            speed: agility * 5,
            parry: technique * 5,
            resistance: willpower * 2.5,
            toughness: rootBone,
            nl: innerBreath * 10,
            nlRegen: innerBreath / 2,
            defense: 0,
            damageReduction: 0,
        };
    }

    private getDefaultEquipmentStats(): BattleStats {
        return {
            attack: 18,
            hit: 10,
            defense: 22,
            hp: 130,
            parry: 8,
            dodge: 3,
            nl: 60,
            innerBreath: 2,
            willpower: 2,
        };
    }

    private getDefaultSkillStats(): BattleStats {
        return {
            attack: this.getSkillStatByProgress(930, [217, 217, 217, 217, 217, 217, 217, 217, 217, 217], 1, 0),
            hit: this.getSkillStatByProgress(294, [68.6, 68.6, 68.6, 68.6, 68.6, 68.6, 68.6, 68.6, 68.6, 68.6], 1, 0),
            hp: this.getSkillStatByProgress(3450, [805, 805, 805, 805, 805, 805, 805, 805, 805, 805], 1, 0) + 180,
            nl: this.getSkillStatByProgress(975, [227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5], 1, 0),
            nlRegen: this.getSkillStatByProgress(30, [7, 7, 7, 7, 7, 7, 7, 7, 7, 7], 1, 0),
            willpower: 10,
            speed: 24,
            dodge: 16,
        };
    }

    private getSkillStatByProgress(baseValue: number, growthValues: number[], level: number, layer: number): number {
        const completedLevelGrowth = growthValues.slice(0, Math.max(0, level - 1)).reduce((sum, value) => sum + value, 0);
        const currentLevelGrowth = growthValues[Math.max(0, level - 1)] ?? 0;
        return Math.round(baseValue + completedLevelGrowth + currentLevelGrowth * layer / 3);
    }

    private addStats(...sources: BattleStats[]): BattleStats {
        const result: BattleStats = {};
        for (const source of sources) {
            for (const key of Object.keys(source) as BattleStatKey[]) {
                result[key] = (result[key] ?? 0) + (source[key] ?? 0);
            }
        }

        return result;
    }

    private multiplyStats(source: BattleStats, multiplier: number): BattleStats {
        const result: BattleStats = {};
        for (const key of Object.keys(source) as BattleStatKey[]) {
            result[key] = (source[key] ?? 0) * multiplier;
        }

        return result;
    }

    private roundStats(source: BattleStats): BattleStats {
        const result: BattleStats = {};
        for (const key of Object.keys(source) as BattleStatKey[]) {
            result[key] = Math.round(source[key] ?? 0);
        }

        return result;
    }

    private pickStats(source: BattleStats, keys: BattleStatKey[]): BattleStats {
        const result: BattleStats = {};
        for (const key of keys) {
            if (source[key] !== undefined) {
                result[key] = source[key];
            }
        }

        return result;
    }

    private renderFormationSlot(item: Laya.GWidget, unit: BattleUnit | null): void {
        const text = item.getChildByName("Text") as Laya.Text | null;
        const unitInfo = item.getChildByName("Sprite") as Laya.Sprite | null;
        const unitName = unit?.name ?? "";

        if (text) {
            text.text = unitName;
        }

        const hurtText = item.getChildByName("hurt") as Laya.Text | null;
        if (hurtText) {
            hurtText.text = "";
        }
        this.ensureRecoveryText(item, BattlePanel.HP_REGEN_TEXT_NAME, "#32e65a", 40);
        this.ensureRecoveryText(item, BattlePanel.NL_REGEN_TEXT_NAME, "#3da7ff", 40);

        if (unitInfo) {
            unitInfo.visible = unitName !== "";
            if (unit) {
                this.renderBar(unitInfo, "HpBar", unit.hp, unit.maxHp);
                this.renderBar(unitInfo, "NLBar", unit.nl, unit.maxNl);
            }
        }
    }

    private renderBar(unitInfo: Laya.Sprite, barName: string, value: number, maxValue: number): void {
        const bar = unitInfo.getChildByName(barName) as Laya.Sprite | null;
        if (!bar) {
            return;
        }

        const fill = bar.getChildByName("Fill") as Laya.Sprite | null;
        if (!fill) {
            return;
        }

        fill.x = 0;
        fill.scaleX = this.clamp01(maxValue > 0 ? value / maxValue : 0);

        const valueText = this.findDirectTextChild(bar);
        if (valueText) {
            valueText.text = `${Math.max(0, Math.round(value))}/${Math.max(0, Math.round(maxValue))}`;
        }
    }

    private renderActionItem(index: number, item: Laya.GWidget): void {
        const title = (item.getChildByName("Text") ?? item.getChildByName("name")) as Laya.Text | null;
        const detail = item.getChildByName("Text_1") as Laya.Text | null;
        if (title) {
            title.text = index === 0 ? "鑷姩鎴樻枟" : "";
        }
        if (detail) {
            detail.text = index === 0 ? "每回合每人出手一次" : "";
        }
    }

    private processRound(): void {
        if (this.battleEnded) {
            return;
        }

        const playerAlive = this.findFirstAlive(this.playerUnits);
        const enemyAlive = this.findFirstAlive(this.enemyUnits);
        if (!playerAlive || !enemyAlive) {
            this.endBattle(playerAlive ? "鑳滃埄" : "澶辫触");
            return;
        }

        this.processRoundAction(this.getActionOrder(), 0);
    }

    private processRoundAction(actionOrder: BattleUnit[], actionIndex: number): void {
        if (this.battleEnded) {
            return;
        }

        if (actionIndex >= actionOrder.length) {
            const result = this.getBattleResult();
            if (result) {
                this.refreshBattleLists();
                this.endBattle(result);
                return;
            }

            this.playRoundRecoverySequence(() => {
                if (this.battleEnded) {
                    return;
                }

                this.round += 1;
                this.refreshBattleLists();
                this.updateRoundText(`第${this.round}回合`);
                Laya.timer.once(BattlePanel.ROUND_INTERVAL, this, this.processRound);
            });
            return;
        }

        const attacker = actionOrder[actionIndex];
        if (!this.isAlive(attacker)) {
            this.processRoundAction(actionOrder, actionIndex + 1);
            return;
        }

        const target = this.getAttackTarget(attacker);
        if (!target) {
            const result = this.getBattleResult();
            if (result) {
                this.refreshBattleLists();
                this.endBattle(result);
            }
            return;
        }

        const actionResult = this.resolveAttack(attacker, target);
        this.playAttackAnimation(attacker, target, () => {
            if (this.battleEnded) {
                return;
            }

            if (actionResult.damage > 0) {
                this.applyDamage(target, actionResult.damage);
            }

            this.refreshUnitSlot(target);
            this.showDamageEvents([{
                side: target.side,
                index: this.getUnitIndex(target),
                damage: actionResult.damage,
                result: actionResult.result,
                text: actionResult.text,
            }]);

            const result = this.getBattleResult();
            if (result) {
                this.endBattle(result);
                return;
            }

            Laya.timer.once(BattlePanel.ACTION_INTERVAL, this, this.processRoundAction, [actionOrder, actionIndex + 1]);
        });
    }
    private applyDamage(unit: BattleUnit, damage: number): void {
        unit.hp = Math.max(0, unit.hp - damage);
    }

    private playRoundRecoverySequence(done: () => void): void {
        const hpRecoveries = this.applyRoundHpRecovery();
        this.refreshBattleLists();
        this.showRecoveryTexts(BattlePanel.HP_REGEN_TEXT_NAME, hpRecoveries);

        Laya.timer.once(BattlePanel.RECOVERY_TEXT_DURATION, this, () => {
            this.clearRecoveryTexts(BattlePanel.HP_REGEN_TEXT_NAME);
            const nlRecoveries = this.applyRoundNlRecovery();
            this.refreshBattleLists();
            this.showRecoveryTexts(BattlePanel.NL_REGEN_TEXT_NAME, nlRecoveries);

            Laya.timer.once(BattlePanel.RECOVERY_TEXT_DURATION, this, () => {
                this.clearRecoveryTexts(BattlePanel.NL_REGEN_TEXT_NAME);
                done();
            });
        });
    }

    private applyRoundHpRecovery(): Map<BattleUnit, number> {
        const recoveries = new Map<BattleUnit, number>();
        for (const unit of this.getAllAliveUnits()) {
            const recovery = Math.max(0, Math.round(unit.hpRegen));
            if (recovery > 0) {
                unit.hp = Math.min(unit.maxHp, unit.hp + recovery);
                recoveries.set(unit, recovery);
            }
        }

        return recoveries;
    }

    private applyRoundNlRecovery(): Map<BattleUnit, number> {
        const recoveries = new Map<BattleUnit, number>();
        for (const unit of this.getAllAliveUnits()) {
            const recovery = Math.max(0, Math.round(unit.nlRegen));
            if (recovery > 0) {
                unit.nl = Math.min(unit.maxNl, unit.nl + recovery);
                recoveries.set(unit, recovery);
            }
        }

        return recoveries;
    }

    private resolveAttack(attacker: BattleUnit, defender: BattleUnit): { damage: number; result: "damage" | "dodge" | "parry"; text: string } {
        const parryRate = this.getParryRate(attacker, defender);
        const dodgeRate = this.getDodgeRate(attacker, defender);
        const parryRoll = Math.random();
        const dodgeRoll = Math.random();
        const parrySuccess = parryRoll < parryRate;
        const dodgeSuccess = dodgeRoll < dodgeRate;

        if (parrySuccess || dodgeSuccess) {
            let result: "dodge" | "parry";
            if (parrySuccess && dodgeSuccess) {
                const parryDepth = parryRate > 0 ? parryRoll / parryRate : 1;
                const dodgeDepth = dodgeRate > 0 ? dodgeRoll / dodgeRate : 1;
                result = parryDepth <= dodgeDepth ? "parry" : "dodge";
            } else {
                result = parrySuccess ? "parry" : "dodge";
            }

            const triggerReduction = result === "parry"
                ? this.getParryDamageReduction(attacker, defender)
                : this.getDodgeDamageReduction(attacker, defender);
            const damage = this.getFinalDamage(attacker, defender, triggerReduction);
            return result === "parry"
                ? { damage, result, text: `\u62db\u67b6 -${damage}` }
                : { damage, result, text: `\u504f\u659c -${damage}` };
        }

        const damage = this.getFinalDamage(attacker, defender, 0);
        return { damage, result: "damage", text: `-${damage}` };
    }

    private getFinalDamage(attacker: BattleUnit, defender: BattleUnit, triggerDamageReduction: number, attackMultiplier = 1): number {
        const baseDamage = Math.max(0, attacker.attack * attackMultiplier);
        const defenseMultiplier = 1 - this.getDefenseReduction(baseDamage, defender);
        const selfReductionMultiplier = 1 - this.clamp01(defender.damageReduction);
        const triggerReductionMultiplier = 1 - this.clamp01(triggerDamageReduction);
        return Math.max(1, Math.round(baseDamage * defenseMultiplier * selfReductionMultiplier * triggerReductionMultiplier));
    }

    private getParryRate(attacker: BattleUnit, defender: BattleUnit): number {
        const denominator = defender.parry
            + attacker.speed * BattlePanel.PARRY_RATE_SPEED_COEFFICIENT
            + attacker.level * BattlePanel.TRIGGER_RATE_LEVEL_COEFFICIENT
            + BattlePanel.TRIGGER_RATE_CONSTANT;
        if (denominator <= 0) {
            return 0;
        }

        return this.clamp01(defender.parry / denominator);
    }

    private getDodgeRate(attacker: BattleUnit, defender: BattleUnit): number {
        const denominator = defender.dodge
            + attacker.hit * BattlePanel.DODGE_RATE_HIT_COEFFICIENT
            + attacker.level * BattlePanel.TRIGGER_RATE_LEVEL_COEFFICIENT
            + BattlePanel.TRIGGER_RATE_CONSTANT;
        if (denominator <= 0) {
            return 0;
        }

        return this.clamp01(defender.dodge / denominator);
    }

    private getParryDamageReduction(attacker: BattleUnit, defender: BattleUnit): number {
        const attributeDifference = Math.max(0, defender.rootBone - attacker.strength);
        return this.clamp01(BattlePanel.BASE_PARRY_DAMAGE_REDUCTION + attributeDifference * BattlePanel.ATTRIBUTE_TRIGGER_REDUCTION_SCALE);
    }

    private getDodgeDamageReduction(attacker: BattleUnit, defender: BattleUnit): number {
        const attributeDifference = Math.max(0, defender.agility - attacker.agility);
        return this.clamp01(BattlePanel.BASE_DODGE_DAMAGE_REDUCTION + attributeDifference * BattlePanel.ATTRIBUTE_TRIGGER_REDUCTION_SCALE);
    }

    private getDefenseReduction(baseDamage: number, defender: BattleUnit): number {
        const effectiveDefense = defender.defense * BattlePanel.DEFENSE_CORRECTION_COEFFICIENT;
        const denominator = baseDamage + effectiveDefense;
        if (denominator <= 0) {
            return 0;
        }

        return this.clamp01(effectiveDefense / denominator);
    }

    private findFirstAlive(units: BattleUnit[]): BattleUnit | null {
        for (const unit of units) {
            if (this.isAlive(unit)) {
                return unit;
            }
        }

        return null;
    }

    private getActionOrder(): BattleUnit[] {
        return [...this.playerUnits, ...this.enemyUnits]
            .filter((unit) => this.isAlive(unit))
            .sort((a, b) => b.speed - a.speed);
    }

    private getAttackTarget(attacker: BattleUnit): BattleUnit | null {
        const attackerIndex = this.getUnitIndex(attacker);
        if (attackerIndex < 0) {
            return null;
        }

        const targetUnits = attacker.side === "player" ? this.enemyUnits : this.playerUnits;
        const rowOrder = this.getTargetRowOrder(Math.floor(attackerIndex / 3));
        const columnOrder = attacker.side === "player" ? [0, 1, 2] : [2, 1, 0];

        for (const row of rowOrder) {
            for (const column of columnOrder) {
                const target = targetUnits[row * 3 + column];
                if (target && this.isAlive(target)) {
                    return target;
                }
            }
        }

        return null;
    }

    private getTargetRowOrder(startRow: number): number[] {
        const rows: number[] = [startRow];

        for (let distance = 1; distance < 3; distance++) {
            const upperRow = startRow - distance;
            const lowerRow = startRow + distance;

            if (upperRow >= 0) {
                rows.push(upperRow);
            }

            if (lowerRow < 3) {
                rows.push(lowerRow);
            }
        }

        return rows;
    }
    private playAttackAnimation(attacker: BattleUnit, target: BattleUnit, onImpact: () => void): void {
        const attackerSlot = this.getUnitSlot(attacker);
        const targetSlot = this.getUnitSlot(target);
        const attackerParent = attackerSlot?.parent as Laya.Sprite | null;
        const animationParent = this.owner as Laya.Sprite | null;
        if (!attackerSlot || !targetSlot || !attackerParent || !animationParent) {
            onImpact();
            return;
        }

        const originalParent = attackerParent;
        const originalParentIndex = originalParent.getChildIndex(attackerSlot);
        const originalSlotX = attackerSlot.x;
        const originalSlotY = attackerSlot.y;
        const originalZOrder = attackerSlot.zOrder;
        const originalScaleX = attackerSlot.scaleX;
        const originalScaleY = attackerSlot.scaleY;
        const displayScaleX = originalScaleX * originalParent.globalScaleX / animationParent.globalScaleX;
        const displayScaleY = originalScaleY * originalParent.globalScaleY / animationParent.globalScaleY;
        const displayWidth = attackerSlot.width * Math.abs(displayScaleX);
        const displayHeight = attackerSlot.height * Math.abs(displayScaleY);
        const originalGlobal = attackerSlot.localToGlobal(new Laya.Point(0, 0), true);
        const originalAnimationLocal = animationParent.globalToLocal(originalGlobal, true);
        const direction = attacker.side === "player" ? 1 : -1;
        const targetCenterGlobal = targetSlot.localToGlobal(
            new Laya.Point(targetSlot.width * 0.5, targetSlot.height * 0.5),
            true
        );
        const targetCenterLocal = animationParent.globalToLocal(targetCenterGlobal, true);
        const targetDisplayWidth = targetSlot.width * Math.abs(targetSlot.globalScaleX / animationParent.globalScaleX);
        const frontCenterX = targetCenterLocal.x - direction * (targetDisplayWidth * 0.5 + displayWidth * 0.5 + 10);
        const frontCenterY = targetCenterLocal.y;
        const frontX = frontCenterX - displayWidth * 0.5;
        const frontY = frontCenterY - displayHeight * 0.5;
        const chargeX = frontX - direction * BattlePanel.CHARGE_DISTANCE;
        const strikeX = chargeX + direction * BattlePanel.STRIKE_DISTANCE;

        Laya.Tween.clearAll(attackerSlot);
        animationParent.addChild(attackerSlot);
        attackerSlot.pos(originalAnimationLocal.x, originalAnimationLocal.y);
        attackerSlot.scale(displayScaleX, displayScaleY);
        attackerSlot.zOrder = 1000;
        Laya.Tween.to(
            attackerSlot,
            { x: frontX, y: frontY },
            BattlePanel.APPROACH_DURATION,
            null,
            Laya.Handler.create(this, () => {
                Laya.timer.once(BattlePanel.WINDUP_DELAY, this, () => {
                    Laya.Tween.to(
                        attackerSlot,
                        { x: chargeX },
                        BattlePanel.CHARGE_DURATION,
                        null,
                        Laya.Handler.create(this, () => {
                            Laya.Tween.to(
                                attackerSlot,
                                { x: strikeX },
                                BattlePanel.STRIKE_DURATION,
                                BattlePanel.strikeEase,
                                Laya.Handler.create(this, () => {
                                    onImpact();
                                    Laya.Tween.to(
                                        attackerSlot,
                                        { x: originalAnimationLocal.x, y: originalAnimationLocal.y },
                                        BattlePanel.RETURN_DURATION,
                                        null,
                                        Laya.Handler.create(this, () => {
                                            originalParent.addChildAt(
                                                attackerSlot,
                                                Math.min(originalParentIndex, originalParent.numChildren)
                                            );
                                            attackerSlot.pos(originalSlotX, originalSlotY);
                                            attackerSlot.scale(originalScaleX, originalScaleY);
                                            attackerSlot.zOrder = originalZOrder;
                                        })
                                    );
                                })
                            );
                        })
                    );
                });
            })
        );
    }
    private static strikeEase(t: number, b: number, c: number, d: number): number {
        const curveDuration = BattlePanel.STRIKE_CURVE_DURATION;
        const curveHeight = BattlePanel.STRIKE_CURVE_HEIGHT;
        const curveTime = Math.max(0, Math.min(curveDuration, t / 1000));
        const remainingDistance = curveHeight - (curveHeight / (curveDuration * curveDuration)) * curveTime * curveTime;
        const progress = Math.max(0, Math.min(1, 1 - remainingDistance / curveHeight));

        return b + c * progress;
    }

    private getUnitSlot(unit: BattleUnit): Laya.GWidget | null {
        const index = this.getUnitIndex(unit);
        if (index < 0) {
            return null;
        }

        return unit.side === "player"
            ? this.playerSlots[index] ?? null
            : this.enemySlots[index] ?? null;
    }
    private refreshUnitSlot(unit: BattleUnit): void {
        const slot = this.getUnitSlot(unit);
        if (slot) {
            this.renderFormationSlot(slot, unit);
        }
    }

    private getUnitIndex(unit: BattleUnit): number {
        const units = unit.side === "player" ? this.playerUnits : this.enemyUnits;
        return units.indexOf(unit);
    }

    private getAllAliveUnits(): BattleUnit[] {
        return [...this.playerUnits, ...this.enemyUnits].filter((unit) => this.isAlive(unit));
    }

    private showRecoveryTexts(textName: string, recoveries: Map<BattleUnit, number>): void {
        for (const [unit, value] of recoveries) {
            const slot = this.getUnitSlot(unit);
            const text = slot?.getChildByName(textName) as Laya.Text | null;
            if (text) {
                text.text = `+${value}`;
            }
        }
    }

    private clearRecoveryTexts(textName: string): void {
        for (const slot of [...this.playerSlots, ...this.enemySlots]) {
            const text = slot?.getChildByName(textName) as Laya.Text | null;
            if (text) {
                text.text = "";
            }
        }
    }

    private ensureRecoveryText(slot: Laya.GWidget, name: string, color: string, y: number): Laya.Text {
        let text = slot.getChildByName(name) as Laya.Text | null;
        if (!text) {
            text = new Laya.Text();
            text.name = name;
            slot.addChild(text);
        }

        text.width = slot.width;
        text.height = 28;
        text.x = 0;
        text.y = y;
        text.fontSize = 24;
        text.bold = true;
        text.color = color;
        text.align = "center";
        text.valign = "middle";
        text.text = "";
        return text;
    }

    private showDamageEvents(events: DamageEvent[]): void {
        for (const event of events) {
            const slots = event.side === "player" ? this.playerSlots : this.enemySlots;
            const unit = event.side === "player" ? this.playerUnits[event.index] : this.enemyUnits[event.index];
            const item = unit ? this.getUnitSlot(unit) : slots[event.index];
            const hurtText = item?.getChildByName("hurt") as Laya.Text | null;
            if (!hurtText) {
                continue;
            }

            const damageText = event.text;
            hurtText.text = damageText;
            Laya.timer.once(500, this, this.clearHurtText, [hurtText, damageText]);
        }
    }

    private clearHurtText(hurtText: Laya.Text, damageText: string): void {
        if (hurtText.text === damageText) {
            hurtText.text = "";
        }
    }

    private getBattleResult(): string | null {
        const hasPlayerAlive = this.findFirstAlive(this.playerUnits) !== null;
        const hasEnemyAlive = this.findFirstAlive(this.enemyUnits) !== null;

        if (hasPlayerAlive && !hasEnemyAlive) {
            return "鑳滃埄";
        }

        if (!hasPlayerAlive && hasEnemyAlive) {
            return "澶辫触";
        }

        if (!hasPlayerAlive && !hasEnemyAlive) {
            return "鍚屽綊浜庡敖";
        }

        return null;
    }

    private endBattle(result: string): void {
        this.battleEnded = true;
        Laya.timer.clear(this, this.processRound);
        this.updateRoundText(`战斗结束：${result}`);
        if (this.exitBattleButton) {
            this.exitBattleButton.visible = true;
        }
    }

    private isAlive(unit: BattleUnit): boolean {
        return unit.hp > 0;
    }

    private refreshBattleLists(): void {
        for (const slot of [...this.playerSlots, ...this.enemySlots]) {
            if (slot) {
                this.renderFormationSlot(slot, null);
            }
        }

        this.renderFormationSlots(this.playerSlots, this.playerUnits);
        this.renderFormationSlots(this.enemySlots, this.enemyUnits);
    }

    private hideLegacyFormation(): void {
        if (this.playerFormation) {
            this.playerFormation.visible = true;
        }

        if (this.enemyFormation) {
            this.enemyFormation.visible = true;
        }
    }
    private collectFormationSlots(): void {
        this.playerSlots.length = Math.max(9, this.playerUnits.length);
        this.playerSlots.fill(null);
        this.enemySlots.length = Math.max(9, this.enemyUnits.length);
        this.enemySlots.fill(null);

        for (let i = 0; i < this.playerSlots.length; i++) {
            this.playerSlots[i] = this.playerFormation?.getChildByName(`placeItem_${i}`) as Laya.GWidget | null;
        }

        for (let i = 0; i < this.enemySlots.length; i++) {
            this.enemySlots[i] = this.enemyFormation?.getChildByName(`placeItem_${i}`) as Laya.GWidget | null;
        }
    }
    private renderFormationSlots(slots: Array<Laya.GWidget | null>, units: BattleUnit[]): void {
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            if (slot) {
                this.renderFormationSlot(slot, units[i] ?? null);
            }
        }
    }
    private updateRoundText(message: string): void {
        if (this.roundText) {
            this.roundText.text = message;
        }
    }

    private clamp01(value: number): number {
        return Math.max(0, Math.min(1, value));
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    private findDirectTextChild(root: Laya.Node): Laya.Text | null {
        for (let i = 0; i < root.numChildren; i++) {
            const child = root.getChildAt(i);
            if (child instanceof Laya.Text) {
                return child;
            }
        }

        return null;
    }

    private findNode(root: Laya.Node, name: string): Laya.Node | null {
        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findNode(root.getChildAt(i), name);
            if (result) {
                return result;
            }
        }

        return null;
    }

    private findExitBattleButton(root: Laya.Node): Laya.Sprite | null {
        if (root instanceof Laya.Text && (root.text.indexOf("退出战斗") !== -1 || root.text.indexOf("退出") !== -1 || root.text.indexOf("閫") !== -1)) {
            return root.parent as Laya.Sprite | null;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findExitBattleButton(root.getChildAt(i));
            if (result) {
                return result;
            }
        }

        return null;
    }
}
