import {
    ATTRIBUTE_NAMES,
    BAG_EQUIPMENT,
    BAWANG_HP_GROWTH,
    BAWANG_NL_GROWTH,
    BAWANG_NL_REGEN_GROWTH,
    BREAKTHROUGH_SECONDS,
    DEFAULT_EQUIPPED_SKILL_NAMES,
    HANYING_ATTACK_GROWTH,
    HANYING_HIT_GROWTH,
    INITIAL_EQUIPPED_ITEMS,
    LEARNED_SKILLS,
    MAX_SKILL_LAYER,
    MAX_SKILL_LEVEL,
    MERIDIAN_ACUPOINTS,
    MERIDIAN_BONUSES,
    MERIDIAN_COMPLETION_BONUSES,
    MERIDIAN_NAMES,
    PANEL_NAMES,
    PRIMARY_ATTRIBUTE_KEYS,
    ROLE_LEVEL,
    ROUTINE_STANDARD_BASE_STATS,
    ROLE_STAT_CONFIGS,
    ROLES,
    SECONDARY_ATTRIBUTE_NAMES,
    SKILL_CATEGORY_LABELS,
    SLOT_KEYS,
    SLOT_NAMES,
    TALENT_NAMES,
    getRoleLevelUpRequiredExperience,
} from "./RolePanelConfig";
import type { AttributeScalingStat, EquipmentData, EquipmentSlot, MoveData, PanelStats, PrimaryAttributeKey, RoleData, RoleStatConfig, SkillCategory, SkillData, SkillProgress, StatKey } from "./RolePanelTypes";

const { regClass } = Laya;

@regClass()
export class RoleEquipmentPanel extends Laya.Script {
    private attributeRoot: Laya.Sprite | null = null;
    private attributeValueList: Laya.GList | null = null;
    private secondaryAttributeList: Laya.GList | null = null;
    private freeAttributePointText: Laya.Text | null = null;
    private confirmAttributePointButton: Laya.Sprite | null = null;
    private resetAttributePointButton: Laya.Sprite | null = null;
    private equipmentRoot: Laya.Sprite | null = null;
    private meridianRoot: Laya.Sprite | null = null;
    private skillRoot: Laya.Sprite | null = null;
    private talentRoot: Laya.Sprite | null = null;
    private talentUnlockList: Laya.GList | null = null;
    private talentNameList: Laya.GList | null = null;
    private talentAptitudeList: Laya.GList | null = null;
    private talentProgressText: Laya.Text | null = null;
    private roleList: Laya.GList | null = null;
    private mainRoleCard: Laya.GWidget | null = null;
    private introText: Laya.Text | null = null;
    private panelList: Laya.GList | null = null;
    private equipmentSlotList: Laya.GList | null = null;
    private equippedList: Laya.GList | null = null;
    private replacementList: Laya.GList | null = null;
    private equippedDetailList: Laya.GList | null = null;
    private bagDetailList: Laya.GList | null = null;
    private equippedDetailRoot: Laya.Sprite | null = null;
    private bagDetailRoot: Laya.Sprite | null = null;
    private unequipButton: Laya.Sprite | null = null;
    private replaceButton: Laya.Sprite | null = null;
    private meridianList: Laya.GList | null = null;
    private acupointList: Laya.GList | null = null;
    private meridianDetailRoot: Laya.Sprite | null = null;
    private meridianProgressRoot: Laya.Sprite | null = null;
    private meridianChargeRoot: Laya.Sprite | null = null;
    private routineSlotButton: Laya.Sprite | null = null;
    private internalSlotButton: Laya.Sprite | null = null;
    private lightnessSlotButton: Laya.Sprite | null = null;
    private learnedSkillList: Laya.GList | null = null;
    private skillMoveList: Laya.GList | null = null;
    private skillMoveDetailText: Laya.Text | null = null;
    private skillSummaryText: Laya.Text | null = null;
    private currentCultivationInfo: Laya.Sprite | null = null;
    private practiceCostInfo: Laya.Sprite | null = null;
    private activateSkillButton: Laya.Sprite | null = null;
    private currentCultivationText: Laya.Text | null = null;
    private practiceCostText: Laya.Text | null = null;
    private activateSkillText: Laya.Text | null = null;
    private forwardMeridianButton: Laya.Sprite | null = null;
    private reverseMeridianButton: Laya.Sprite | null = null;
    private resetMeridianDirectionButton: Laya.Sprite | null = null;
    private meridianDetailText: Laya.Text | null = null;
    private meridianCompletionEffectText: Laya.Text | null = null;
    private meridianProgressText: Laya.Text | null = null;
    private meridianQiText: Laya.Text | null = null;
    private selectedMeridianIndex = 0;
    private hasSelectedMeridianDirection = false;
    private selectedMeridianDirection: "forward" | "reverse" = "forward";
    private readonly selectedMeridianDirections: Record<string, "forward" | "reverse"> = {};
    private readonly openedAcupointCounts: Record<string, number> = {};
    private selectedEquipmentSlotIndex = -1;
    private selectedReplacementEquipment: EquipmentData | null = null;
    private currentQi = 1000;
    private readonly maxQi = 1000;
    private readonly qiRecoverSeconds = 60;
    private qiRecoverRemainingSeconds = 60;
    private readonly meridianItemWidth = 100;
    private readonly meridianListColumns = 2;
    private readonly meridianItemHeight = 50;
    private readonly meridianItemGap = 6;
    private readonly panelItemWidth = 100;
    private readonly panelItemHeight = 50;
    private readonly equipmentGridColumns = 2;
    private readonly equipmentGridItemWidth = 100;
    private readonly equipmentGridItemHeight = 30;
    private readonly equipmentGridColumnGap = 200;
    private readonly equipmentGridRowGap = 10;
    private readonly replacementItemHeight = 50;
    private readonly skillCategoryItemHeight = 50;
    private readonly learnedSkillItemHeight = 50;
    private readonly skillMoveItemHeight = 50;
    private readonly talentItemHeight = 50;
    private readonly attributeHoldStartDelayMs = 350;
    private readonly attributeHoldRepeatMs = 80;
    private holdingAttributeIndex = -1;
    private holdingAptitudeIndex = -1;
    private attributeHoldTriggered = false;
    private selectedRoleIndex = 0;
    private readonly roleLevel = ROLE_LEVEL;
    private readonly roles = ROLES;
    private readonly panelNames = PANEL_NAMES;
    private readonly attributeNames = ATTRIBUTE_NAMES;
    private readonly primaryAttributeKeys: PrimaryAttributeKey[] = PRIMARY_ATTRIBUTE_KEYS;
    private readonly secondaryAttributeKeys: StatKey[] = ["attack", "defense", "speed", "hit", "parry", "dodge", "resistance", "toughness", "hp", "nl", "nlRegen", "hpRegen"];
    private readonly confirmedAttributePointsByRole: Record<string, PanelStats> = {};
    private readonly pendingAttributePointsByRole: Record<string, PanelStats> = {};
    private readonly roleExperienceByRole: Record<string, number> = {};
    private readonly secondaryAttributeNames = SECONDARY_ATTRIBUTE_NAMES;
    private readonly meridianNames = MERIDIAN_NAMES;
    private readonly meridianAcupoints = MERIDIAN_ACUPOINTS;
    private readonly meridianBonuses = MERIDIAN_BONUSES;
    private readonly meridianCompletionBonuses = MERIDIAN_COMPLETION_BONUSES;
    private readonly slotNames = SLOT_NAMES;
    private readonly slotKeys: EquipmentSlot[] = SLOT_KEYS;
    private readonly equippedItems: Array<EquipmentData | null> = INITIAL_EQUIPPED_ITEMS.map((item) => this.cloneEquipment(item));
    private readonly bagEquipment: EquipmentData[] = BAG_EQUIPMENT.map((item) => this.cloneEquipment(item) as EquipmentData);
    private readonly skillCategoryLabels: Record<SkillCategory, string> = SKILL_CATEGORY_LABELS;
    private selectedSkillCategory: SkillCategory = "routine";
    private selectedSkill: SkillData | null = null;
    private selectedMoveIndex = -1;
    private readonly equippedSkillNames: Record<SkillCategory, string> = { ...DEFAULT_EQUIPPED_SKILL_NAMES };
    private currentCultivation = 1200;
    private readonly maxSkillLevel = MAX_SKILL_LEVEL;
    private readonly maxSkillLayer = MAX_SKILL_LAYER;
    private readonly breakthroughSeconds = BREAKTHROUGH_SECONDS;
    private readonly skillProgressByName: Record<string, SkillProgress> = {};
    private readonly hanyingAttackGrowth = HANYING_ATTACK_GROWTH;
    private readonly hanyingHitGrowth = HANYING_HIT_GROWTH;
    private readonly bawangHpGrowth = BAWANG_HP_GROWTH;
    private readonly bawangNlGrowth = BAWANG_NL_GROWTH;
    private readonly bawangNlRegenGrowth = BAWANG_NL_REGEN_GROWTH;
    private readonly learnedSkills: SkillData[] = LEARNED_SKILLS;
    private readonly talentNames = TALENT_NAMES;
    private readonly talentRankNames = ["\u51e1", "\u4e0b", "\u4e2d", "\u4e0a", "\u7edd"];
    private readonly talentRankRequirements = [2000, 5000, 10000, 15000];
    private readonly aptitudeMaxExp = 5000;
    private readonly aptitudeExpByAttribute = [0, 0, 0, 0, 0, 0];
    private talentRank = 0;
    private talentRankExp = 0;

    private cloneEquipment(item: EquipmentData | null): EquipmentData | null {
        if (!item) {
            return null;
        }

        return {
            ...item,
            mainStats: [...item.mainStats],
            extraStats: [...item.extraStats],
        };
    }

    onAwake(): void {
        const root = this.owner as Laya.Node;
        const pageRoot = root.getChildByName("Area2D") ?? root;
        this.attributeRoot = this.findNode(root, "shuxing") as Laya.Sprite | null;
        this.equipmentRoot = (this.findNode(root, "equipment") ?? this.findNode(root, "zhuangbei") ?? this.findNode(root, "Area2D_1")) as Laya.Sprite | null;
        this.meridianRoot = this.findNode(root, "jingmai") as Laya.Sprite | null;
        this.skillRoot = this.findNode(root, "gongfa") as Laya.Sprite | null;
        this.talentRoot = this.findNode(root, "tianfu") as Laya.Sprite | null;
        this.meridianDetailText = this.findMeridianDetailText();
        this.meridianProgressText = this.findMeridianProgressText();
        this.meridianQiText = this.findMeridianQiText();
        this.introText = this.findNode(root, "jieshao") as Laya.Text | null;
        const roleRoot = this.findNode(root, "role") as Laya.Sprite | null;
        this.roleList = (roleRoot?.getChildByName("roleList") ?? roleRoot?.getChildByName("list")) as Laya.GList | null;
        this.mainRoleCard = (pageRoot.getChildByName("mainRoleCard") ?? pageRoot.getChildByName("placeItem")) as Laya.GWidget | null;
        this.panelList = (pageRoot.getChildByName("list") as Laya.GList | null) ?? this.findRolePanelList(root);
        const attributeList = this.attributeRoot?.getChildByName("list") as Laya.GList | undefined;
        this.attributeValueList = (this.attributeRoot?.getChildByName("list_1") as Laya.GList | undefined) ?? null;
        const secondaryAttributeNameList = this.attributeRoot?.getChildByName("list_2") as Laya.GList | undefined;
        this.secondaryAttributeList = (this.attributeRoot?.getChildByName("list_3") as Laya.GList | undefined) ?? null;
        this.freeAttributePointText = this.findNode(this.attributeRoot ?? root, "ziyoudian") as Laya.Text | null;
        this.confirmAttributePointButton = this.findNode(this.attributeRoot ?? root, "queding") as Laya.Sprite | null;
        this.resetAttributePointButton = this.findNode(this.attributeRoot ?? root, "chongzhi") as Laya.Sprite | null;
        this.meridianList = (this.meridianRoot?.getChildByName("list") as Laya.GList | undefined) ?? null;
        this.acupointList = (this.meridianRoot?.getChildByName("list_1") as Laya.GList | undefined) ?? null;
        this.meridianDetailRoot = (this.meridianRoot?.getChildByName("node_2") as Laya.Sprite | undefined) ?? null;
        this.meridianProgressRoot = (this.meridianRoot?.getChildByName("node_3") as Laya.Sprite | undefined) ?? null;
        this.meridianChargeRoot = (this.meridianRoot?.getChildByName("node_4") as Laya.Sprite | undefined) ?? null;
        this.forwardMeridianButton = (this.meridianRoot?.getChildByName("node") as Laya.Sprite | undefined) ?? null;
        this.reverseMeridianButton = (this.meridianRoot?.getChildByName("node_1") as Laya.Sprite | undefined) ?? null;
        this.resetMeridianDirectionButton = (this.meridianRoot?.getChildByName("node_5") as Laya.Sprite | undefined) ?? null;
        this.routineSlotButton = (this.findSkillNode("routineSlot") ?? this.findSkillNode("1")) as Laya.Sprite | null;
        this.internalSlotButton = (this.findSkillNode("internalSlot") ?? this.findSkillNode("2")) as Laya.Sprite | null;
        this.lightnessSlotButton = (this.findSkillNode("lightnessSlot") ?? this.findSkillNode("3")) as Laya.Sprite | null;
        this.learnedSkillList = (this.findSkillNode("learnedSkillList") ?? this.findSkillNode("liebiao")) as Laya.GList | null;
        this.skillMoveList = (this.findSkillNode("skillMoveList") ?? this.findSkillNode("zhaoshi")) as Laya.GList | null;
        this.skillMoveDetailText = (this.findSkillNode("skillMoveDetail") ?? this.findSkillNode("xiangqing")) as Laya.Text | null;
        this.skillSummaryText = (this.findSkillNode("skillSummary") ?? this.findSkillNode("Text_3")) as Laya.Text | null;
        this.currentCultivationInfo = (this.findSkillNode("currentCultivationInfo") ?? this.findSkillNode("cultivationInfo") ?? this.findSkillNode("4")) as Laya.Sprite | null;
        this.practiceCostInfo = (this.findSkillNode("practiceCostInfo") ?? this.findSkillNode("practiceInfo") ?? this.findSkillNode("5")) as Laya.Sprite | null;
        this.activateSkillButton = (this.findSkillNode("activateButton") ?? this.findSkillNode("jihuo") ?? this.findSkillNode("激活") ?? this.findSkillNode("6")) as Laya.Sprite | null;
        this.currentCultivationText = this.getChildText(this.currentCultivationInfo);
        this.practiceCostText = this.getChildText(this.practiceCostInfo);
        this.activateSkillText = this.getChildText(this.activateSkillButton);
        this.talentUnlockList = (this.talentRoot?.getChildByName("list") as Laya.GList | undefined) ?? null;
        this.talentNameList = (this.talentRoot?.getChildByName("list_1") as Laya.GList | undefined) ?? null;
        this.talentAptitudeList = (this.talentRoot?.getChildByName("list_2") as Laya.GList | undefined) ?? null;
        this.talentProgressText = (this.talentRoot?.getChildByName("Text_1") as Laya.Text | undefined) ?? null;
        this.equipmentSlotList = this.equipmentRoot ? ((this.findNodes(this.equipmentRoot, "list_1")[0] as Laya.GList | undefined) ?? null) : null;
        this.equippedList = this.equipmentRoot ? ((this.findNodes(this.equipmentRoot, "list_2")[0] as Laya.GList | undefined) ?? null) : null;
        this.equippedDetailList = this.equipmentRoot ? ((this.findNodes(this.equipmentRoot, "list_3")[0] as Laya.GList | undefined) ?? null) : null;
        this.bagDetailList = this.equipmentRoot ? ((this.findNodes(this.equipmentRoot, "list_4")[0] as Laya.GList | undefined) ?? null) : null;
        this.replacementList = this.equipmentRoot ? ((this.findNodes(this.equipmentRoot, "list_5")[0] as Laya.GList | undefined) ?? null) : null;
        this.equippedDetailRoot = (this.equippedDetailList?.parent as Laya.Sprite | null) ?? null;
        this.bagDetailRoot = (this.bagDetailList?.parent as Laya.Sprite | null) ?? null;
        this.unequipButton = this.findSiblingActionButton(this.equippedDetailList);
        this.replaceButton = this.findSiblingActionButton(this.bagDetailList);

        this.bindMeridianModeButtons();
        this.renderMeridianDetail();
        this.renderPanelList(this.panelList);
        this.renderList(attributeList ?? null, this.attributeNames);
        this.renderPrimaryAttributeValueList();
        this.renderList(secondaryAttributeNameList ?? null, this.secondaryAttributeNames);
        this.renderSecondaryAttributeValueList();
        this.renderFreeAttributePointText();
        this.renderEquipmentPanel(this.equipmentSlotList, this.equippedList, this.replacementList, this.equippedDetailList, this.bagDetailList);
        this.bindEquipmentActionButtons();
        this.renderSkillPanel();
        this.renderTalentPanel();
        this.renderRoleList();
        this.selectRole(0);
        Laya.stage?.on(Laya.Event.CLICK, this, this.onStageClick);
        Laya.stage?.on(Laya.Event.MOUSE_DOWN, this, this.onStageMouseDown);
        Laya.stage?.on(Laya.Event.MOUSE_UP, this, this.stopHoldingPoint);
        Laya.stage?.on(Laya.Event.MOUSE_OUT, this, this.stopHoldingPoint);
        Laya.stage?.on(Laya.Event.MOUSE_WHEEL, this, this.onStageWheel);
        Laya.timer.loop(1000, this, this.updateQiRecoveryTimer);
        Laya.timer.loop(1000, this, this.updateSkillBreakthroughTimer);
        this.switchRolePanel(0);
    }

    onDestroy(): void {
        Laya.stage?.off(Laya.Event.CLICK, this, this.onStageClick);
        Laya.stage?.off(Laya.Event.MOUSE_DOWN, this, this.onStageMouseDown);
        Laya.stage?.off(Laya.Event.MOUSE_UP, this, this.stopHoldingPoint);
        Laya.stage?.off(Laya.Event.MOUSE_OUT, this, this.stopHoldingPoint);
        this.stopHoldingPoint();
        Laya.stage?.off(Laya.Event.MOUSE_WHEEL, this, this.onStageWheel);
        Laya.timer.clear(this, this.updateQiRecoveryTimer);
        Laya.timer.clear(this, this.updateSkillBreakthroughTimer);
    }

    private renderIntro(): void {
        const role = this.roles[this.selectedRoleIndex];
        if (this.introText) {
            const currentExperience = this.getSelectedRoleExperience();
            const requiredExperience = getRoleLevelUpRequiredExperience(this.roleLevel);
            this.introText.text = role ? `${role.name}\nLv.${this.roleLevel}\n\u7ecf\u9a8c ${currentExperience}/${requiredExperience}` : "";
        }

        if (this.mainRoleCard && role) {
            this.renderRoleCard(this.mainRoleCard, role, true, false);
        }
    }

    private renderRoleList(): void {
        const list = this.roleList;
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const role = this.roles[index];
            if (!role) {
                return;
            }

            this.renderRoleCard(item, role, index === this.selectedRoleIndex, true);
            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => this.selectRole(index));
        };
        list.numItems = this.roles.length;
    }

    private selectRole(index: number): void {
        if (index < 0 || index >= this.roles.length) {
            return;
        }

        this.selectedRoleIndex = index;
        this.renderRoleList();
        this.renderIntro();
        this.refreshAttributePanel();
    }

    private renderRoleCard(item: Laya.GWidget, role: RoleData, selected: boolean, showName: boolean): void {
        const avatarRoot = (item.getChildByName("avatar") ?? item.getChildByName("Sprite") ?? item) as Laya.Sprite;
        avatarRoot.graphics.clear();
        avatarRoot.graphics.drawCircle(90, 90, 86, role.avatarColor, selected ? "#f1df8a" : "#000000", selected ? 4 : 1);

        const image = this.findNode(item, "img") as any;
        if (image) {
            image.visible = !!role.imageSrc;
            if (role.imageSrc) {
                image.src = role.imageSrc;
            }
        }

        const avatarText = this.getOrCreateRoleAvatarText(item);
        avatarText.text = role.name.substring(0, 1);
        avatarText.visible = !role.imageSrc;

        const nameText = showName ? this.getOrCreateRoleNameText(item) : item.getChildByName("Text") as Laya.Text | null;
        if (nameText) {
            nameText.text = showName ? role.name : "";
            nameText.visible = showName;
        }

    }

    private getOrCreateRoleAvatarText(item: Laya.GWidget): Laya.Text {
        let text = item.getChildByName("AvatarText") as Laya.Text | null;
        if (!text) {
            text = new Laya.Text();
            text.name = "AvatarText";
            text.x = 0;
            text.y = 28;
            text.width = 150;
            text.height = 100;
            text.fontSize = 48;
            text.color = "#ffffff";
            text.align = "center";
            text.valign = "middle";
            item.addChild(text);
        }

        return text;
    }

    private getOrCreateRoleNameText(item: Laya.GWidget): Laya.Text {
        let text = item.getChildByName("Text") as Laya.Text | null;
        if (!text) {
            text = new Laya.Text();
            text.name = "Text";
            text.x = 16;
            text.y = 149;
            text.width = 120;
            text.height = 42;
            text.fontSize = 24;
            text.color = "#ffffff";
            text.align = "center";
            text.valign = "middle";
            item.addChild(text);
        }

        return text;
    }

    private renderPanelList(list: Laya.GList | null): void {
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const text = item.getChildByName("Text") as Laya.Text | null;
            if (text) {
                text.text = this.panelNames[index] ?? "";
            }

            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => {
                this.switchRolePanel(index);
            });
        };
        list.numItems = this.panelNames.length;
    }

    private switchRolePanel(index: number): void {
        if (this.attributeRoot) {
            this.attributeRoot.visible = index === 0;
        }

        if (this.equipmentRoot) {
            this.equipmentRoot.visible = index === 1;
        }

        if (this.meridianRoot) {
            this.meridianRoot.visible = index === 4;
        }

        if (this.skillRoot) {
            this.skillRoot.visible = index === 2;
        }

        if (this.talentRoot) {
            this.talentRoot.visible = index === 3;
        }

        if (index === 4) {
            this.resetMeridianSelection();
            if (this.hasSelectedMeridianDirection) {
                this.showMeridianChargeMode(this.selectedMeridianDirection);
            } else {
                this.showMeridianInfoMode();
            }
            Laya.timer.callLater(this, this.refreshMeridianPanel);
        }

        this.bringPanelListToFront();
    }

    private bringPanelListToFront(): void {
        const list = this.panelList;
        const parent = list?.parent;
        if (!list || !parent) {
            return;
        }

        parent.setChildIndex(list, parent.numChildren - 1);
    }

    private renderList(list: Laya.GList | null, values: string[]): void {
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.setItemText(item, values[index] ?? "");
            this.setItemTextColor(item, "#ffffff");
        };
        list.numItems = values.length;
    }

    private renderTalentPanel(): void {
        this.renderTalentUnlockList();
        this.renderList(this.talentNameList, this.attributeNames);
        this.renderTalentAptitudeList();
        this.renderTalentProgressText();
    }

    private renderTalentUnlockList(): void {
        const list = this.talentUnlockList;
        if (!list) {
            return;
        }

        const itemCount = 6;
        const unlockedCount = this.getUnlockedTalentCount(itemCount);
        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const label = this.talentNames[index] ?? `天赋${index + 1}`;
            const unlocked = index < unlockedCount;
            this.setItemText(item, label);
            this.setItemTextColor(item, unlocked ? "#ffffff" : "#777777");
        };
        list.numItems = itemCount;
    }

    private renderTalentAptitudeList(): void {
        const list = this.talentAptitudeList;
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.setItemText(item, this.getAptitudeProgressLabel(index));
            const addText = (item.getChildByName("Text_1") ?? item.getChildByName("text_1")) as Laya.Text | null;
            if (addText) {
                addText.text = "加";
                addText.color = this.isAptitudeMax(index) ? "#777777" : "#f3d27a";
            }
        };
        list.numItems = this.attributeNames.length;
    }

    private renderTalentProgressText(): void {
        if (!this.talentProgressText) {
            return;
        }

        const rankName = this.talentRankNames[this.talentRank] ?? "凡";
        const nextRequirement = this.talentRankRequirements[this.talentRank];
        this.talentProgressText.text = nextRequirement === undefined
            ? `已满(${rankName})`
            : `${this.talentRankExp}/${nextRequirement}(${rankName})`;
    }

    private getAptitudeProgressLabel(index: number): string {
        return `${this.aptitudeExpByAttribute[index] ?? 0}/${this.aptitudeMaxExp}`;
    }

    private isAptitudeMax(index: number): boolean {
        return (this.aptitudeExpByAttribute[index] ?? 0) >= this.aptitudeMaxExp;
    }

    private addTalentAptitudeExperience(index: number): void {
        if (index < 0 || index >= this.attributeNames.length || this.isAptitudeMax(index)) {
            return;
        }

        this.aptitudeExpByAttribute[index] = Math.min(this.aptitudeMaxExp, (this.aptitudeExpByAttribute[index] ?? 0) + 50);
        this.addTalentRankExperience(50);

        this.renderTalentPanel();
        this.refreshAttributePanel();
    }

    private addTalentRankExperience(value: number): void {
        if (this.talentRank >= this.talentRankNames.length - 1) {
            return;
        }

        this.talentRankExp += value;
        while (this.talentRank < this.talentRankNames.length - 1) {
            const requirement = this.talentRankRequirements[this.talentRank];
            if (requirement === undefined || this.talentRankExp < requirement) {
                break;
            }

            this.talentRank += 1;
        }
    }

    private getUnlockedTalentCount(itemCount: number): number {
        const unlockCount = this.talentRank >= this.talentRankNames.length - 1
            ? this.talentRank + 2
            : this.talentRank + 1;
        return Math.max(1, Math.min(itemCount, unlockCount));
    }

    private refreshAttributePanel(): void {
        this.renderPrimaryAttributeValueList();
        this.renderSecondaryAttributeValueList();
        this.renderFreeAttributePointText();
    }

    private renderPrimaryAttributeValueList(): void {
        const list = this.attributeValueList;
        if (!list) {
            return;
        }

        const pendingAttributePoints = this.getSelectedRolePendingAttributePoints();
        const stats = this.calculateOutBattlePanelStats(pendingAttributePoints);
        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.renderPrimaryAttributeValueItem(index, item, stats);
        };
        list.numItems = this.primaryAttributeKeys.length;
    }

    private renderPrimaryAttributeValueItem(index: number, item: Laya.GWidget, stats: PanelStats): void {
        const key = this.primaryAttributeKeys[index];
        const value = key ? stats[key] ?? 0 : 0;
        const cap = key ? this.getAttributeConversionCap(key) : Number.POSITIVE_INFINITY;
        const valueText = this.getOrCreateItemText(item);
        let capText = item.getChildByName("CapText") as Laya.Text | null;
        if (!capText) {
            capText = new Laya.Text();
            capText.name = "CapText";
            capText.fontSize = 20;
            item.addChild(capText);
        }
        const valueWidth = Math.max(1, item.width * 0.56);
        valueText.text = this.formatPanelNumber(value);
        valueText.width = valueWidth;
        valueText.height = item.height;
        valueText.x = 0;
        valueText.y = 0;
        valueText.align = "right";
        valueText.valign = "middle";
        valueText.color = this.getAttributeCapColor(value, cap);
        valueText.mouseEnabled = false;

        capText.text = Number.isFinite(cap) ? `（${this.formatPanelNumber(cap)}）` : "";
        capText.width = Math.max(1, item.width - valueWidth);
        capText.height = item.height;
        capText.x = valueWidth;
        capText.y = 0;
        capText.align = "left";
        capText.valign = "middle";
        capText.color = "#9aa0a6";
        capText.mouseEnabled = false;
    }

    private getAttributeCapColor(value: number, cap: number): string {
        const overflow = value - cap;
        if (overflow <= 0) {
            return "#ffffff";
        }

        return overflow <= 100 ? "#f0a84f" : "#8f3a3a";
    }

    private renderSecondaryAttributeValueList(): void {
        const list = this.secondaryAttributeList;
        if (!list) {
            return;
        }

        const confirmedStats = this.calculateOutBattlePanelStats();
        const previewStats = this.calculateOutBattlePanelStats(this.getSelectedRolePendingAttributePoints());
        const values = this.getSecondaryAttributeValues(previewStats);
        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const key = this.secondaryAttributeKeys[index];
            const confirmedValue = key ? confirmedStats[key] ?? 0 : 0;
            const previewValue = key ? previewStats[key] ?? 0 : 0;
            this.setItemText(item, values[index] ?? "");
            this.setItemTextColor(item, previewValue !== confirmedValue ? "#f3d27a" : "#ffffff");
        };
        list.numItems = values.length;
    }

    private getTotalFreeAttributePoints(): number {
        return Math.max(0, this.getLevelGrowthCount() * 6);
    }

    private getLevelGrowthCount(): number {
        return Math.max(0, this.roleLevel - 1);
    }

    private getUsedFreeAttributePoints(stats: PanelStats): number {
        return this.primaryAttributeKeys.reduce((total, key) => total + Math.max(0, stats[key] ?? 0), 0);
    }

    private getAvailableFreeAttributePoints(): number {
        const used = this.getUsedFreeAttributePoints(this.getSelectedRoleConfirmedAttributePoints())
            + this.getUsedFreeAttributePoints(this.getSelectedRolePendingAttributePoints());
        return Math.max(0, this.getTotalFreeAttributePoints() - used);
    }

    private renderFreeAttributePointText(): void {
        if (!this.freeAttributePointText) {
            return;
        }

        this.freeAttributePointText.text = `${this.getAvailableFreeAttributePoints()}`;
    }

    private addPendingAttributePoint(attributeIndex: number): void {
        const key = this.primaryAttributeKeys[attributeIndex];
        if (!key || this.getAvailableFreeAttributePoints() <= 0) {
            return;
        }

        const pendingAttributePoints = this.getSelectedRolePendingAttributePoints();
        pendingAttributePoints[key] = (pendingAttributePoints[key] ?? 0) + 1;
        this.refreshAttributePanel();
    }

    private confirmAttributePoints(): void {
        const confirmedAttributePoints = this.getSelectedRoleConfirmedAttributePoints();
        const pendingAttributePoints = this.getSelectedRolePendingAttributePoints();
        for (const key of this.primaryAttributeKeys) {
            const pending = pendingAttributePoints[key] ?? 0;
            if (pending > 0) {
                confirmedAttributePoints[key] = (confirmedAttributePoints[key] ?? 0) + pending;
            }
            delete pendingAttributePoints[key];
        }

        this.refreshAttributePanel();
    }

    private resetAttributePoints(): void {
        const confirmedAttributePoints = this.getSelectedRoleConfirmedAttributePoints();
        const pendingAttributePoints = this.getSelectedRolePendingAttributePoints();
        for (const key of this.primaryAttributeKeys) {
            delete confirmedAttributePoints[key];
            delete pendingAttributePoints[key];
        }

        this.refreshAttributePanel();
    }

    private getPrimaryAttributeValues(stats: PanelStats): string[] {
        return [
            this.formatPanelNumber(stats.strength ?? 0),
            this.formatPanelNumber(stats.technique ?? 0),
            this.formatPanelNumber(stats.agility ?? 0),
            this.formatPanelNumber(stats.rootBone ?? 0),
            this.formatPanelNumber(stats.innerBreath ?? 0),
            this.formatPanelNumber(stats.willpower ?? 0),
        ];
    }

    private getSecondaryAttributeValues(stats: PanelStats): string[] {
        return [
            this.formatPanelNumber(stats.attack ?? 0),
            this.formatPanelNumber(stats.defense ?? 0),
            this.formatPanelNumber(stats.speed ?? 0),
            this.formatPanelNumber(stats.hit ?? 0),
            this.formatPanelNumber(stats.parry ?? 0),
            this.formatPanelNumber(stats.dodge ?? 0),
            this.formatPanelNumber(stats.resistance ?? 0),
            this.formatPanelNumber(stats.toughness ?? 0),
            this.formatPanelNumber(stats.hp ?? 0),
            this.formatPanelNumber(stats.nl ?? 0),
            this.formatPanelNumber(stats.nlRegen ?? 0),
            this.formatPanelNumber(stats.hpRegen ?? 0),
        ];
    }

    private formatPanelNumber(value: number): string {
        return Number.isInteger(value) ? `${value}` : `${Number(value.toFixed(2))}`;
    }

    private calculateOutBattlePanelStats(pendingPrimaryAttributes: PanelStats = {}): PanelStats {
        const baseSource = this.addStats(
            this.getInitialRoleStats(pendingPrimaryAttributes),
            this.getLevelGrowthStats(),
            this.getMeridianStats(),
            this.getConvertedAttributeStats(pendingPrimaryAttributes),
        );
        const equipmentSource = this.getEquipmentStats();
        const skillSource = this.addStats(
            this.getSkillStats(),
            this.getSkillAttributeScalingStats(pendingPrimaryAttributes),
        );
        const outBattleStats = this.addStats(
            this.multiplyStats(baseSource, this.getBaseOutBattleBuffMultiplier()),
            this.multiplyStats(equipmentSource, this.getEquipmentOutBattleBuffMultiplier()),
            this.multiplyStats(skillSource, this.getSkillOutBattleBuffMultiplier()),
            this.getOutBattleFlatBonus(),
        );

        return this.applyAptitudeToPrimaryAttributes(this.roundStats(outBattleStats));
    }

    private getInitialRoleStats(pendingPrimaryAttributes: PanelStats = {}): PanelStats {
        return this.addStats(this.getSelectedRoleStatConfig().initialAttributes, this.getSelectedRoleConfirmedAttributePoints(), pendingPrimaryAttributes);
    }

    private getLevelGrowthStats(): PanelStats {
        return this.multiplyStats(this.getSelectedRoleStatConfig().levelGrowthStats, this.getLevelGrowthCount());
    }

    private getMeridianStats(): PanelStats {
        let stats: PanelStats = {};
        for (const meridianName of this.meridianNames) {
            const openedCount = this.getOpenedAcupointCount(meridianName, this.getSelectedMeridianDirection(meridianName));
            if (openedCount <= 0) {
                continue;
            }

            stats = this.addStats(stats, this.multiplyStats(this.parseStatTexts(this.meridianBonuses[meridianName] ?? []), openedCount));
        }

        return stats;
    }

    private getConvertedAttributeStats(pendingPrimaryAttributes: PanelStats = {}): PanelStats {
        const attributes = this.getEffectivePrimaryAttributeSourceStats(pendingPrimaryAttributes);
        let stats: PanelStats = {};
        for (const key of this.primaryAttributeKeys) {
            const value = attributes[key] ?? 0;
            const ratios = this.getSelectedRoleStatConfig().attributeConversionRatios[key] ?? {};
            for (const targetKey of Object.keys(ratios) as StatKey[]) {
                stats = this.addStats(stats, { [targetKey]: value * (ratios[targetKey] ?? 0) });
            }
        }

        return stats;
    }

    private getPrimaryAttributeSourceStats(pendingPrimaryAttributes: PanelStats = {}): PanelStats {
        return this.addStats(
            this.pickStats(this.getInitialRoleStats(pendingPrimaryAttributes), ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]),
            this.pickStats(this.getLevelGrowthStats(), ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]),
            this.pickStats(this.getMeridianStats(), ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]),
            this.getEquipmentAttributeStats(),
            this.getSkillAttributeStats(),
        );
    }

    private getEffectivePrimaryAttributeSourceStats(pendingPrimaryAttributes: PanelStats = {}): PanelStats {
        return this.applyAttributeConversionCaps(
            this.applyAptitudeToPrimaryAttributes(this.getPrimaryAttributeSourceStats(pendingPrimaryAttributes)),
        );
    }

    private applyAptitudeToPrimaryAttributes(stats: PanelStats): PanelStats {
        const result: PanelStats = { ...stats };
        for (let index = 0; index < this.primaryAttributeKeys.length; index++) {
            const key = this.primaryAttributeKeys[index];
            const value = result[key];
            if (key && value !== undefined) {
                result[key] = value * this.getAptitudeAttributeMultiplier(index);
            }
        }

        return this.roundStats(result);
    }

    private getAptitudeAttributeMultiplier(index: number): number {
        return this.isAptitudeMax(index) ? 1.3 : 1;
    }

    private applyAttributeConversionCaps(stats: PanelStats): PanelStats {
        const result: PanelStats = { ...stats };
        for (const key of this.primaryAttributeKeys) {
            const value = result[key];
            if (key && value !== undefined) {
                result[key] = this.getAttributeValueForConversion(key, value);
            }
        }

        return this.roundStats(result);
    }

    private getAttributeValueForConversion(key: StatKey, value: number): number {
        const cap = this.getAttributeConversionCap(key);
        if (value <= cap) {
            return value;
        }

        let remaining = value - cap;
        let effectiveValue = cap;
        let multiplier = 0.8;
        while (remaining > 0 && multiplier > 0) {
            const bandValue = Math.min(50, remaining);
            effectiveValue += bandValue * multiplier;
            remaining -= bandValue;
            multiplier -= 0.2;
        }

        return effectiveValue;
    }

    private getAttributeConversionCap(key: StatKey): number {
        const roleCaps = this.getSelectedRoleStatConfig().attributeCaps;
        const cap = roleCaps?.[key];
        if (!cap) {
            return Number.POSITIVE_INFINITY;
        }

        return cap.base + cap.growth * this.getLevelGrowthCount();
    }

    private getSelectedRoleStatConfig(): RoleStatConfig {
        const roleName = this.roles[this.selectedRoleIndex]?.name ?? "青槐";
        return ROLE_STAT_CONFIGS[roleName] ?? ROLE_STAT_CONFIGS["青槐"];
    }

    private getSelectedRoleName(): string {
        return this.roles[this.selectedRoleIndex]?.name ?? "青槐";
    }

    private getSelectedRoleConfirmedAttributePoints(): PanelStats {
        const roleName = this.getSelectedRoleName();
        this.confirmedAttributePointsByRole[roleName] ??= {};
        return this.confirmedAttributePointsByRole[roleName];
    }

    private getSelectedRolePendingAttributePoints(): PanelStats {
        const roleName = this.getSelectedRoleName();
        this.pendingAttributePointsByRole[roleName] ??= {};
        return this.pendingAttributePointsByRole[roleName];
    }

    private getSelectedRoleExperience(): number {
        const roleName = this.getSelectedRoleName();
        this.roleExperienceByRole[roleName] ??= 0;
        return this.roleExperienceByRole[roleName];
    }

    private getEquipmentStats(): PanelStats {
        let stats: PanelStats = {};
        for (const equipment of this.equippedItems) {
            if (!equipment) {
                continue;
            }

            stats = this.addStats(stats, this.parseStatTexts([...equipment.mainStats, ...equipment.extraStats]));
        }

        return stats;
    }

    private getEquipmentAttributeStats(): PanelStats {
        return this.pickStats(this.getEquipmentStats(), ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]);
    }

    private getSkillStats(): PanelStats {
        let stats: PanelStats = {};
        for (const skill of this.getEquippedSkills()) {
            stats = this.addStats(stats, this.parseStatTexts(this.getSkillBaseStats(skill)));
        }

        return stats;
    }

    private getSkillAttributeStats(): PanelStats {
        return this.pickStats(this.getSkillStats(), ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"]);
    }

    private getSkillAttributeScalingStats(pendingPrimaryAttributes: PanelStats = {}): PanelStats {
        const attributes = this.getEffectivePrimaryAttributeSourceStats(pendingPrimaryAttributes);
        let stats: PanelStats = {};
        for (const skill of this.getEquippedSkills()) {
            stats = this.addStats(
                stats,
                this.calculateAttributeScalingStats(skill.scalingStats ?? [], attributes),
                this.parseAttributeScalingStatTexts(this.getSkillBaseStats(skill), attributes),
            );
        }

        return stats;
    }

    private getBaseOutBattleBuffMultiplier(): number {
        return 1;
    }

    private getEquipmentOutBattleBuffMultiplier(): number {
        return 1;
    }

    private getSkillOutBattleBuffMultiplier(): number {
        return 1;
    }

    private getOutBattleFlatBonus(): PanelStats {
        return {};
    }

    private parseStatTexts(texts: string[]): PanelStats {
        let stats: PanelStats = {};
        for (const text of texts) {
            const parsed = this.parseStatText(text);
            if (!parsed) {
                continue;
            }

            stats = this.addStats(stats, { [parsed.key]: parsed.value });
        }

        return stats;
    }

    private parseAttributeScalingStatTexts(texts: string[], attributes: PanelStats): PanelStats {
        let stats: PanelStats = {};
        for (const text of texts) {
            const parsed = this.parseAttributeScalingStatText(text, attributes);
            if (!parsed) {
                continue;
            }

            stats = this.addStats(stats, { [parsed.key]: parsed.value });
        }

        return stats;
    }

    private calculateAttributeScalingStats(scalingStats: AttributeScalingStat[], attributes: PanelStats): PanelStats {
        let stats: PanelStats = {};
        for (const scalingStat of scalingStats) {
            stats = this.addStats(stats, {
                [scalingStat.target]: (attributes[scalingStat.source] ?? 0) * scalingStat.multiplier,
            });
        }

        return stats;
    }

    private parseStatText(text: string): { key: StatKey; value: number } | null {
        const match = text.match(/^(.+?)[：:\s]*([+-]?\d+(?:\.\d+)?)(%)?$/);
        if (!match) {
            return null;
        }

        const key = this.getStatKeyByName(match[1].trim());
        if (!key) {
            return null;
        }

        return {
            key,
            value: Number(match[2]) / (match[3] ? 100 : 1),
        };
    }

    private parseAttributeScalingStatText(text: string, attributes: PanelStats): { key: StatKey; value: number } | null {
        const match = text.match(/^(.+?)[：:\s]+(.+?)\s*[xX*×]\s*([+-]?\d+(?:\.\d+)?)$/);
        if (!match) {
            return null;
        }

        const key = this.getStatKeyByName(match[1].trim());
        const attributeKey = this.getStatKeyByName(match[2].trim());
        if (!key || !attributeKey) {
            return null;
        }

        return {
            key,
            value: (attributes[attributeKey] ?? 0) * Number(match[3]),
        };
    }

    private getStatKeyByName(name: string): StatKey | null {
        const statKeyByName: Record<string, StatKey> = {
            臂力: "strength",
            技巧: "technique",
            身法: "agility",
            根骨: "rootBone",
            内息: "innerBreath",
            定力: "willpower",
            攻击: "attack",
            防御: "defense",
            速度: "speed",
            命中: "hit",
            招架: "parry",
            偏斜: "dodge",
            抵抗: "resistance",
            韧性: "toughness",
            气血: "hp",
            气血上限: "hp",
            内力: "nl",
            内力上限: "nl",
            内力回复: "nlRegen",
            气血回复: "hpRegen",
            免伤: "damageReduction",
            穿甲: "armorPenetration",
        };

        return statKeyByName[name] ?? null;
    }

    private addStats(...sources: PanelStats[]): PanelStats {
        const result: PanelStats = {};
        for (const source of sources) {
            for (const key of Object.keys(source) as StatKey[]) {
                result[key] = (result[key] ?? 0) + (source[key] ?? 0);
            }
        }

        return result;
    }

    private multiplyStats(source: PanelStats, multiplier: number): PanelStats {
        const result: PanelStats = {};
        for (const key of Object.keys(source) as StatKey[]) {
            result[key] = (source[key] ?? 0) * multiplier;
        }

        return result;
    }

    private roundStats(source: PanelStats): PanelStats {
        const result: PanelStats = {};
        for (const key of Object.keys(source) as StatKey[]) {
            result[key] = Math.round(source[key] ?? 0);
        }

        return result;
    }

    private pickStats(source: PanelStats, keys: StatKey[]): PanelStats {
        const result: PanelStats = {};
        for (const key of keys) {
            if (source[key] !== undefined) {
                result[key] = source[key];
            }
        }

        return result;
    }

    private renderEquipmentPanel(
        slotList: Laya.GList | null,
        equippedList: Laya.GList | null,
        replacementList: Laya.GList | null,
        equippedDetailList: Laya.GList | null,
        bagDetailList: Laya.GList | null,
    ): void {
        this.renderEquipmentSlots(slotList, equippedList, replacementList, equippedDetailList, bagDetailList);
        this.renderReplacementEquipmentList(replacementList, [], bagDetailList);
        this.renderEquipmentDetail(equippedDetailList, null);
        this.renderEquipmentDetail(bagDetailList, null);
        this.setDetailAreaVisible(this.equippedDetailRoot, false);
        this.setDetailAreaVisible(this.bagDetailRoot, false);
    }

    private renderEquipmentSlots(
        slotList: Laya.GList | null,
        equippedList: Laya.GList | null,
        replacementList: Laya.GList | null,
        equippedDetailList: Laya.GList | null,
        bagDetailList: Laya.GList | null,
    ): void {
        this.renderList(slotList, this.slotNames);
        this.renderClickableEquipmentList(equippedList, this.equippedItems.map((item) => item?.name ?? ""), this.selectedEquipmentSlotIndex, (index) => {
            this.selectEquipmentSlot(index, replacementList, equippedDetailList, bagDetailList);
        });
    }

    private renderClickableEquipmentList(list: Laya.GList | null, values: string[], selectedIndex: number, onClick: (index: number) => void): void {
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.renderEquipmentItem(item, values[index] ?? "", index === selectedIndex);
            this.setItemTextColor(item, "#ffffff");
            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => onClick(index));
        };
        list.numItems = values.length;
    }

    private selectEquipmentSlot(
        index: number,
        replacementList: Laya.GList | null,
        equippedDetailList: Laya.GList | null,
        bagDetailList: Laya.GList | null,
    ): void {
        this.selectedEquipmentSlotIndex = index;
        this.selectedReplacementEquipment = null;
        const equipped = this.equippedItems[index] ?? null;
        const slotKey = this.slotKeys[index];
        const replacements = slotKey ? this.bagEquipment.filter((item) => item.slot === slotKey) : [];
        this.setDetailAreaVisible(this.equippedDetailRoot, true);
        this.setDetailAreaVisible(this.bagDetailRoot, true);
        this.renderEquipmentSlots(this.equipmentSlotList, this.equippedList, this.replacementList, this.equippedDetailList, this.bagDetailList);
        this.renderReplacementEquipmentList(replacementList, replacements, bagDetailList);
        this.renderEquipmentDetail(equippedDetailList, equipped);
        this.renderEquipmentDetail(bagDetailList, null);
    }

    private renderReplacementEquipmentList(list: Laya.GList | null, values: EquipmentData[], bagDetailList: Laya.GList | null): void {
        if (!list) {
            return;
        }

        if (values.length === 0) {
            this.selectedReplacementEquipment = null;
        }

        list.visible = values.length > 0;
        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const equipment = values[index] ?? null;
            this.renderEquipmentItem(item, equipment?.name ?? "", equipment === this.selectedReplacementEquipment);
            this.setItemTextColor(item, "#ffffff");
            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => this.selectReplacementEquipment(equipment, bagDetailList));
        };
        list.numItems = values.length;
    }

    private selectReplacementEquipment(equipment: EquipmentData | null, bagDetailList: Laya.GList | null): void {
        this.selectedReplacementEquipment = equipment;
        this.setDetailAreaVisible(this.bagDetailRoot, true);
        this.renderReplacementEquipmentList(this.replacementList, this.getVisibleReplacementItems(), bagDetailList);
        this.renderEquipmentDetail(bagDetailList, equipment);
    }

    private renderEquipmentDetail(list: Laya.GList | null, equipment: EquipmentData | null): void {
        if (!list) {
            return;
        }

        const values = equipment ? [equipment.name, ...equipment.mainStats, ...equipment.extraStats] : [];
        const extraStartIndex = equipment ? 1 + equipment.mainStats.length : -1;
        list.visible = values.length > 0;
        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.setItemText(item, values[index] ?? "");
            this.setItemTextColor(item, extraStartIndex !== -1 && index >= extraStartIndex ? "#4aa3ff" : "#ffffff");
        };
        list.numItems = values.length;
    }

    private bindEquipmentActionButtons(): void {
        this.unequipButton?.offAll(Laya.Event.CLICK);
        this.replaceButton?.offAll(Laya.Event.CLICK);
        this.unequipButton?.on(Laya.Event.CLICK, this, this.unequipSelectedEquipment);
        this.replaceButton?.on(Laya.Event.CLICK, this, this.replaceSelectedEquipment);
    }

    private unequipSelectedEquipment(): void {
        const slotIndex = this.selectedEquipmentSlotIndex;
        const equipped = this.equippedItems[slotIndex] ?? null;
        if (slotIndex < 0 || !equipped) {
            return;
        }

        this.bagEquipment.push(equipped);
        this.equippedItems[slotIndex] = null;
        this.refreshEquipmentAfterInventoryChange();
    }

    private replaceSelectedEquipment(): void {
        const slotIndex = this.selectedEquipmentSlotIndex;
        const replacement = this.selectedReplacementEquipment;
        if (slotIndex < 0 || !replacement) {
            return;
        }

        const bagIndex = this.bagEquipment.indexOf(replacement);
        if (bagIndex === -1) {
            return;
        }

        const oldEquipped = this.equippedItems[slotIndex] ?? null;
        this.equippedItems[slotIndex] = replacement;
        if (oldEquipped) {
            this.bagEquipment[bagIndex] = oldEquipped;
        } else {
            this.bagEquipment.splice(bagIndex, 1);
        }

        this.selectedReplacementEquipment = null;
        this.refreshEquipmentAfterInventoryChange();
    }

    private refreshEquipmentAfterInventoryChange(): void {
        this.renderEquipmentSlots(this.equipmentSlotList, this.equippedList, this.replacementList, this.equippedDetailList, this.bagDetailList);
        if (this.selectedEquipmentSlotIndex !== -1) {
            this.selectEquipmentSlot(this.selectedEquipmentSlotIndex, this.replacementList, this.equippedDetailList, this.bagDetailList);
        }
        this.refreshAttributePanel();
    }

    private setDetailAreaVisible(root: Laya.Sprite | null, visible: boolean): void {
        if (root) {
            root.visible = visible;
        }
    }

    private findSiblingActionButton(list: Laya.GList | null): Laya.Sprite | null {
        const parent = list?.parent;
        if (!parent) {
            return null;
        }

        for (let index = 0; index < parent.numChildren; index++) {
            const child = parent.getChildAt(index);
            if (child !== list && child.name === "node") {
                return child as Laya.Sprite;
            }
        }

        return null;
    }

    private setItemText(item: Laya.GWidget, value: string): void {
        const text = this.getOrCreateItemText(item);
        text.text = value;
    }

    private setItemTextColor(item: Laya.GWidget, color: string): void {
        const text = this.getOrCreateItemText(item);
        text.color = color;
    }

    private renderEquipmentItem(item: Laya.GWidget, label: string, selected: boolean): void {
        const highlight = this.getOrCreateHighlight(item);
        highlight.visible = selected;
        highlight.graphics.clear();
        highlight.graphics.drawRect(0, 0, item.width, item.height, "rgba(0,0,0,0)", "#f1df8a", 3);
        this.setItemText(item, label);
    }

    private getOrCreateItemText(item: Laya.GWidget): Laya.Text {
        let text = item.getChildByName("Text") as Laya.Text | null;
        if (!text) {
            text = new Laya.Text();
            text.name = "Text";
            text.width = item.width;
            text.height = item.height;
            text.fontSize = 20;
            text.color = "#ffffff";
            text.align = "center";
            text.valign = "middle";
            item.addChild(text);
        }

        return text;
    }

    private renderSkillPanel(): void {
        this.bindSkillCategoryButton(this.routineSlotButton, "routine");
        this.bindSkillCategoryButton(this.internalSlotButton, "internal");
        this.bindSkillCategoryButton(this.lightnessSlotButton, "lightness");
        this.selectSkillCategory("routine");
    }

    private bindSkillCategoryButton(button: Laya.Sprite | null, category: SkillCategory): void {
        if (!button) {
            return;
        }

        this.renderEquipmentItem(button as Laya.GWidget, this.getEquippedSkillName(category), category === this.selectedSkillCategory);
        button.offAll(Laya.Event.CLICK);
        button.on(Laya.Event.CLICK, this, () => this.selectSkillCategory(category));
    }

    private getEquippedSkillName(category: SkillCategory): string {
        return this.equippedSkillNames[category] || "无";
    }

    private selectSkillCategory(category: SkillCategory): void {
        this.selectedSkillCategory = category;
        const skills = this.getLearnedSkillsByCategory(category);
        this.selectedSkill = skills[0] ?? null;
        this.selectedMoveIndex = this.selectedSkill && this.selectedSkill.moves.length > 0 ? 0 : -1;
        this.refreshSkillCategoryButtons();
        this.renderLearnedSkillList(skills);
        this.renderSelectedSkill();
    }

    private refreshSkillCategoryButtons(): void {
        this.bindSkillCategoryButton(this.routineSlotButton, "routine");
        this.bindSkillCategoryButton(this.internalSlotButton, "internal");
        this.bindSkillCategoryButton(this.lightnessSlotButton, "lightness");
    }

    private renderLearnedSkillList(skills: SkillData[]): void {
        const list = this.learnedSkillList;
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const skill = skills[index] ?? null;
            this.renderEquipmentItem(item, skill?.name ?? "", skill === this.selectedSkill);
            this.setItemTextColor(item, skill && this.isSkillEquipped(skill) ? "#f3d27a" : "#ffffff");
            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => this.selectLearnedSkill(skill));
        };
        list.numItems = skills.length;
    }

    private selectLearnedSkill(skill: SkillData | null): void {
        if (!skill) {
            return;
        }

        this.selectedSkill = skill;
        this.selectedMoveIndex = skill.moves.length > 0 ? 0 : -1;
        this.renderLearnedSkillList(this.getLearnedSkillsByCategory(this.selectedSkillCategory));
        this.renderSelectedSkill();
    }

    private renderSelectedSkill(): void {
        const skill = this.selectedSkill;
        if (this.skillSummaryText) {
            this.skillSummaryText.text = skill
                ? [skill.name, this.getSkillLevelText(skill), ...this.getSkillBaseStats(skill), ...this.getSkillScalingStatTexts(skill), this.getSkillLayerText(skill)].join("\n")
                : "";
        }

        this.renderSkillMoveList(skill);
        this.renderSelectedMoveDetail();
        this.renderSkillCultivationInfo();
        this.renderActivateSkillButton();
    }

    private renderSkillMoveList(skill: SkillData | null): void {
        const list = this.skillMoveList;
        if (!list) {
            return;
        }

        const moves = skill?.moves ?? [];
        const progress = skill ? this.getSkillProgress(skill) : null;
        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const move = moves[index] ?? null;
            this.renderEquipmentItem(item, move?.name ?? "", index === this.selectedMoveIndex);
            this.setItemTextColor(item, move && progress && this.isMoveUnlocked(move, progress) ? "#ffffff" : "#777777");
            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => this.selectSkillMove(index));
        };
        list.numItems = moves.length;
    }

    private isMoveUnlocked(move: MoveData, progress: SkillProgress): boolean {
        return progress.level >= (move.unlockLevel ?? 1);
    }

    private selectSkillMove(index: number): void {
        const skill = this.selectedSkill;
        if (!skill || index < 0 || index >= skill.moves.length) {
            return;
        }

        this.selectedMoveIndex = index;
        this.renderSkillMoveList(skill);
        this.renderSelectedMoveDetail();
        this.renderSkillCultivationInfo();
    }

    private renderSelectedMoveDetail(): void {
        if (!this.skillMoveDetailText) {
            return;
        }

        const move = this.selectedSkill?.moves[this.selectedMoveIndex] ?? null;
        this.skillMoveDetailText.text = move ? `${move.name}\n${move.detail}` : "";
    }

    private renderSkillCultivationInfo(): void {
        const move = this.selectedSkill?.moves[this.selectedMoveIndex] ?? null;
        if (this.currentCultivationText) {
            this.currentCultivationText.text = `\u4fee\u4e3a\uff1a${this.currentCultivation}`;
        }

        if (this.practiceCostText) {
            this.practiceCostText.text = this.getPracticeButtonText(move);
        }
    }

    private renderActivateSkillButton(): void {
        const button = this.activateSkillButton;
        const text = this.activateSkillText ?? this.getChildText(button);
        if (!button || !text) {
            return;
        }

        const skill = this.selectedSkill;
        button.visible = !!skill;
        text.text = skill && this.isSkillEquipped(skill) ? "已激活" : "激活";
        button.offAll(Laya.Event.CLICK);
        button.on(Laya.Event.CLICK, this, this.activateSelectedSkill);
    }

    private activateSelectedSkill(): void {
        const skill = this.selectedSkill;
        if (!skill || this.isSkillEquipped(skill)) {
            this.renderActivateSkillButton();
            return;
        }

        this.equippedSkillNames[skill.category] = skill.name;
        this.refreshSkillCategoryButtons();
        this.renderLearnedSkillList(this.getLearnedSkillsByCategory(this.selectedSkillCategory));
        this.renderActivateSkillButton();
        this.refreshAttributePanel();
    }

    private isSkillEquipped(skill: SkillData): boolean {
        return this.equippedSkillNames[skill.category] === skill.name;
    }

    private getEquippedSkills(): SkillData[] {
        return (Object.keys(this.equippedSkillNames) as SkillCategory[])
            .map((category) => this.learnedSkills.find((skill) => skill.category === category && skill.name === this.equippedSkillNames[category]))
            .filter((skill): skill is SkillData => !!skill);
    }

    private tryPracticeSelectedSkill(): void {
        const skill = this.selectedSkill;
        const move = skill?.moves[this.selectedMoveIndex] ?? null;
        if (!skill || !move) {
            return;
        }

        const progress = this.getSkillProgress(skill);
        if ((progress.level >= this.maxSkillLevel && progress.layer >= this.maxSkillLayer) || progress.breakthroughRemainingSeconds > 0) {
            return;
        }

        if (progress.layer >= this.maxSkillLayer) {
            if (progress.level >= this.maxSkillLevel) {
                return;
            }
            progress.breakthroughRemainingSeconds = this.breakthroughSeconds;
            this.renderSelectedSkill();
            return;
        }

        if (this.currentCultivation < move.practiceCost) {
            return;
        }

        this.currentCultivation -= move.practiceCost;
        progress.layer = Math.min(this.maxSkillLayer, progress.layer + 1);
        this.renderSelectedSkill();
        this.refreshAttributePanel();
    }

    private updateSkillBreakthroughTimer(): void {
        let shouldRefresh = false;
        for (const skillName in this.skillProgressByName) {
            const progress = this.skillProgressByName[skillName];
            if (progress.breakthroughRemainingSeconds <= 0) {
                continue;
            }

            progress.breakthroughRemainingSeconds -= 1;
            if (progress.breakthroughRemainingSeconds <= 0) {
                progress.level = Math.min(this.maxSkillLevel, progress.level + 1);
                progress.layer = 0;
                progress.breakthroughRemainingSeconds = 0;
                this.refreshAttributePanel();
            }

            shouldRefresh = true;
        }

        if (shouldRefresh) {
            this.renderSelectedSkill();
        }
    }

    private getPracticeButtonText(move: MoveData | null): string {
        const skill = this.selectedSkill;
        if (!skill || !move) {
            return "\u6d88\u8017\uff1a0";
        }

        const progress = this.getSkillProgress(skill);
        if (progress.level >= this.maxSkillLevel && progress.layer >= this.maxSkillLayer) {
            return "\u5df2\u6ee1\u91cd";
        }

        if (progress.breakthroughRemainingSeconds > 0) {
            return `\u7a81\u7834 ${this.formatClockTime(progress.breakthroughRemainingSeconds)}`;
        }

        if (progress.layer >= this.maxSkillLayer) {
            return `\u7a81\u7834 ${this.formatClockTime(this.breakthroughSeconds)}`;
        }

        return `\u6d88\u8017\uff1a${move.practiceCost}`;
    }

    private getSkillLevelText(skill: SkillData): string {
        const progress = this.getSkillProgress(skill);
        return progress.level >= this.maxSkillLevel && progress.layer >= this.maxSkillLayer ? "\u5df2\u6ee1\u91cd" : `\u7b2c${progress.level}\u91cd`;
    }

    private getSkillBaseStats(skill: SkillData): string[] {
        if (skill.name === "\u5bd2\u7f28\u843d\u6708\u67aa") {
            const progress = this.getSkillProgress(skill);
            const level = Math.max(1, Math.min(this.maxSkillLevel, progress.level));
            const layer = Math.max(0, Math.min(this.maxSkillLayer, progress.layer));
            const attack = this.getHanyingAttackByProgress(level, layer);
            const hit = this.getHanyingHitByProgress(level, layer);
            return [`\u653b\u51fb\uff1a${attack}`, `\u547d\u4e2d\uff1a${hit}`];
        }

        if (skill.name === "\u9738\u738b\u8bc0") {
            const progress = this.getSkillProgress(skill);
            const level = Math.max(1, Math.min(this.maxSkillLevel, progress.level));
            const layer = Math.max(0, Math.min(this.maxSkillLayer, progress.layer));
            const hp = this.getSkillStatByProgress(3450, this.bawangHpGrowth, level, layer);
            const nl = this.getSkillStatByProgress(975, this.bawangNlGrowth, level, layer);
            const nlRegen = this.getSkillStatByProgress(30, this.bawangNlRegenGrowth, level, layer);
            return [`\u6c14\u8840\uff1a${hp}`, `\u5185\u529b\uff1a${nl}`, `\u5185\u529b\u56de\u590d\uff1a${nlRegen}`];
        }

        const coefficientStats = this.getSkillCoefficientBaseStats(skill);
        if (coefficientStats.length > 0) {
            return [...skill.baseStats, ...coefficientStats];
        }

        return skill.baseStats;
    }

    private getSkillCoefficientBaseStats(skill: SkillData): string[] {
        const standardStats = this.getSkillStandardBaseStats(skill.category);
        const coefficients = skill.baseStatCoefficients ?? {};
        const texts: string[] = [];
        for (const key of Object.keys(coefficients) as StatKey[]) {
            const standardValue = standardStats[key];
            const coefficient = coefficients[key];
            if (standardValue === undefined || coefficient === undefined) {
                continue;
            }

            texts.push(`${this.getStatNameByKey(key)}：${this.formatPanelNumber(standardValue * coefficient)}`);
        }

        return texts;
    }

    private getSkillStandardBaseStats(category: SkillCategory): PanelStats {
        if (category === "routine") {
            return ROUTINE_STANDARD_BASE_STATS;
        }

        return {};
    }

    private getSkillScalingStatTexts(skill: SkillData): string[] {
        return (skill.scalingStats ?? []).map((scalingStat) => {
            return `${this.getStatNameByKey(scalingStat.target)}：${this.getStatNameByKey(scalingStat.source)} * ${this.formatPanelNumber(scalingStat.multiplier)}`;
        });
    }

    private getStatNameByKey(key: StatKey): string {
        const statNameByKey: Record<StatKey, string> = {
            strength: "臂力",
            technique: "技巧",
            agility: "身法",
            rootBone: "根骨",
            innerBreath: "内息",
            willpower: "定力",
            attack: "攻击",
            defense: "防御",
            speed: "速度",
            hit: "命中",
            parry: "招架",
            dodge: "偏斜",
            resistance: "抵抗",
            toughness: "韧性",
            hp: "气血",
            nl: "内力",
            nlRegen: "内力回复",
            hpRegen: "气血回复",
            damageReduction: "免伤",
            armorPenetration: "穿甲",
        };

        return statNameByKey[key];
    }

    private getHanyingAttackByProgress(level: number, layer: number): number {
        return this.getSkillStatByProgress(735, this.hanyingAttackGrowth, level, layer);
    }

    private getHanyingHitByProgress(level: number, layer: number): number {
        return this.getSkillStatByProgress(234, this.hanyingHitGrowth, level, layer);
    }

    private getSkillStatByProgress(baseValue: number, growthValues: number[], level: number, layer: number): number {
        const completedLevelGrowth = growthValues.slice(0, Math.max(0, level - 1)).reduce((sum, value) => sum + value, 0);
        const currentLevelGrowth = growthValues[Math.max(0, level - 1)] ?? 0;
        return Math.round(baseValue + completedLevelGrowth + currentLevelGrowth * layer / this.maxSkillLayer);
    }

    private getSkillLayerText(skill: SkillData): string {
        const progress = this.getSkillProgress(skill);
        return `\u4fee\u70bc\u5c42\u6570${progress.layer}/${this.maxSkillLayer}`;
    }

    private getSkillProgress(skill: SkillData): SkillProgress {
        let progress = this.skillProgressByName[skill.name];
        if (!progress) {
            progress = {
                level: 1,
                layer: 0,
                breakthroughRemainingSeconds: 0,
            };
            this.skillProgressByName[skill.name] = progress;
        }

        return progress;
    }

    private formatClockTime(seconds: number): string {
        const safeSeconds = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(safeSeconds / 60);
        const remainingSeconds = safeSeconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    }

    private getLearnedSkillsByCategory(category: SkillCategory): SkillData[] {
        return this.learnedSkills.filter((skill) => skill.category === category);
    }

    private getChildText(node: Laya.Sprite | null): Laya.Text | null {
        return (node?.getChildByName("Text") ?? null) as Laya.Text | null;
    }

    private renderMeridianList(meridianList: Laya.GList | null, acupointList: Laya.GList | null): void {
        if (!meridianList) {
            return;
        }

        meridianList.itemRenderer = (index: number, item: Laya.GWidget) => {
            const meridianName = this.meridianNames[index] ?? "";
            this.renderMeridianItem(item, meridianName, index === this.selectedMeridianIndex);

            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => {
                this.selectMeridianIndex(index);
            });
        };
        meridianList.off(Laya.Event.CLICK, this, this.onMeridianListClick);
        meridianList.on(Laya.Event.CLICK, this, this.onMeridianListClick, [meridianList, acupointList]);
        meridianList.numItems = this.meridianNames.length;

        this.renderAcupointList(acupointList, this.meridianNames[this.selectedMeridianIndex] ?? "");
    }

    private onMeridianListClick(meridianList: Laya.GList, acupointList: Laya.GList | null): void {
        const item = meridianList.touchItem;
        if (!item) {
            return;
        }

        const childIndex = meridianList.getChildIndex(item);
        const itemIndex = meridianList.childIndexToItemIndex(childIndex);
        const meridianName = this.meridianNames[itemIndex];
        if (!meridianName) {
            return;
        }

        this.selectMeridianIndex(itemIndex);
    }

    private renderAcupointList(list: Laya.GList | null, meridianName: string): void {
        const acupoints = this.getDisplayAcupoints(meridianName);
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.renderAcupointItem(item, acupoints[index] ?? "", false, this.isAcupointOpened(meridianName, index, acupoints.length));
            item.offAll(Laya.Event.CLICK);
        };
        list.numItems = acupoints.length;
        this.refreshVisibleAcupointItems(list, meridianName);
        Laya.timer.callLater(this, () => this.refreshVisibleAcupointItems(list, meridianName));
    }

    private refreshMeridianPanel(): void {
        this.renderMeridianList(this.meridianList, this.acupointList);
    }

    private onStageMouseDown(): void {
        if (this.attributeRoot?.visible) {
            const attributeIndex = this.getPrimaryAttributeAddIndexByStagePoint(Laya.stage.mouseX, Laya.stage.mouseY);
            if (attributeIndex !== -1) {
                this.holdingAttributeIndex = attributeIndex;
                this.attributeHoldTriggered = false;
                Laya.timer.once(this.attributeHoldStartDelayMs, this, this.startHoldingAttributePoint);
            }
        }

        if (this.talentRoot?.visible) {
            const aptitudeIndex = this.getTalentAptitudeAddIndexByStagePoint(Laya.stage.mouseX, Laya.stage.mouseY);
            if (aptitudeIndex !== -1) {
                this.holdingAptitudeIndex = aptitudeIndex;
                this.attributeHoldTriggered = false;
                Laya.timer.once(this.attributeHoldStartDelayMs, this, this.startHoldingAptitudePoint);
            }
        }
    }

    private startHoldingAttributePoint(): void {
        if (this.holdingAttributeIndex === -1 || !this.attributeRoot?.visible) {
            return;
        }

        this.attributeHoldTriggered = true;
        this.addHoldingAttributePoint();
        Laya.timer.loop(this.attributeHoldRepeatMs, this, this.addHoldingAttributePoint);
    }

    private addHoldingAttributePoint(): void {
        if (this.holdingAttributeIndex === -1 || !this.attributeRoot?.visible) {
            this.stopHoldingPoint();
            return;
        }

        this.addPendingAttributePoint(this.holdingAttributeIndex);
        if (this.getAvailableFreeAttributePoints() <= 0) {
            this.stopHoldingPoint();
        }
    }

    private stopHoldingPoint(): void {
        this.holdingAttributeIndex = -1;
        this.holdingAptitudeIndex = -1;
        Laya.timer.clear(this, this.startHoldingAttributePoint);
        Laya.timer.clear(this, this.addHoldingAttributePoint);
        Laya.timer.clear(this, this.startHoldingAptitudePoint);
        Laya.timer.clear(this, this.addHoldingAptitudePoint);
    }

    private startHoldingAptitudePoint(): void {
        if (this.holdingAptitudeIndex === -1 || !this.talentRoot?.visible) {
            return;
        }

        this.attributeHoldTriggered = true;
        this.addHoldingAptitudePoint();
        Laya.timer.loop(this.attributeHoldRepeatMs, this, this.addHoldingAptitudePoint);
    }

    private addHoldingAptitudePoint(): void {
        if (this.holdingAptitudeIndex === -1 || !this.talentRoot?.visible) {
            this.stopHoldingPoint();
            return;
        }

        this.addTalentAptitudeExperience(this.holdingAptitudeIndex);
        if (this.isAptitudeMax(this.holdingAptitudeIndex)) {
            this.stopHoldingPoint();
        }
    }

    private onStageClick(): void {
        const shouldSkipAttributeClick = this.attributeHoldTriggered;
        this.attributeHoldTriggered = false;
        const stageX = Laya.stage.mouseX;
        const stageY = Laya.stage.mouseY;
        const panelIndex = this.getPanelIndexByStagePoint(stageX, stageY);
        if (panelIndex !== -1) {
            this.switchRolePanel(panelIndex);
            return;
        }

        if (this.handleRoleStageClick(stageX, stageY)) {
            return;
        }

        if (!shouldSkipAttributeClick && this.attributeRoot?.visible && this.handleAttributeStageClick(stageX, stageY)) {
            return;
        }

        if (this.equipmentRoot?.visible && this.handleEquipmentStageClick(stageX, stageY)) {
            return;
        }

        if (this.skillRoot?.visible && this.handleSkillStageClick(stageX, stageY)) {
            return;
        }

        if (!shouldSkipAttributeClick && this.talentRoot?.visible && this.handleTalentStageClick(stageX, stageY)) {
            return;
        }

        if (!this.meridianRoot?.visible) {
            return;
        }

        if (this.meridianChargeRoot?.visible && this.isPointInNode(this.meridianChargeRoot, stageX, stageY)) {
            this.tryChargeSelectedAcupoint();
        } else if (this.resetMeridianDirectionButton?.visible && this.isPointInNode(this.resetMeridianDirectionButton, stageX, stageY)) {
            this.resetSelectedMeridianDirection();
        } else if (this.isPointInNode(this.forwardMeridianButton, stageX, stageY)) {
            this.showMeridianChargeMode("forward");
        } else if (this.isPointInNode(this.reverseMeridianButton, stageX, stageY)) {
            this.showMeridianChargeMode("reverse");
        } else if (this.isPointInNode(this.meridianList, stageX, stageY)) {
            this.selectMeridianByStagePoint(stageX, stageY);
        }
    }

    private handleRoleStageClick(stageX: number, stageY: number): boolean {
        const index = this.getVerticalListIndexByStagePoint(this.roleList, stageX, stageY, this.roles.length, 198);
        if (index === -1) {
            return false;
        }

        this.selectRole(index);
        return true;
    }

    private handleAttributeStageClick(stageX: number, stageY: number): boolean {
        if (this.isPointInNode(this.confirmAttributePointButton, stageX, stageY)) {
            this.confirmAttributePoints();
            return true;
        }

        if (this.isPointInNode(this.resetAttributePointButton, stageX, stageY)) {
            this.resetAttributePoints();
            return true;
        }

        const attributeIndex = this.getPrimaryAttributeAddIndexByStagePoint(stageX, stageY);
        if (attributeIndex !== -1) {
            this.addPendingAttributePoint(attributeIndex);
            return true;
        }

        return false;
    }

    private getPrimaryAttributeAddIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.attributeValueList;
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const itemWidth = 100;
        const itemHeight = 30;
        const addButtonOffsetX = 119;
        const addButtonWidth = 30;
        const columns = 2;
        const columnStride = itemWidth + 200;
        const rowStride = itemHeight;
        const y = local.y + scrollY;
        const row = Math.floor(y / rowStride);
        const rowOffset = y - row * rowStride;
        if (row < 0 || rowOffset < 0 || rowOffset > itemHeight) {
            return -1;
        }

        const column = Math.floor(local.x / columnStride);
        const columnOffset = local.x - column * columnStride;
        if (column < 0 || column >= columns || columnOffset < addButtonOffsetX || columnOffset > addButtonOffsetX + addButtonWidth) {
            return -1;
        }

        const index = row * columns + column;
        return index >= 0 && index < this.primaryAttributeKeys.length ? index : -1;
    }

    private handleTalentStageClick(stageX: number, stageY: number): boolean {
        const index = this.getTalentAptitudeAddIndexByStagePoint(stageX, stageY);
        if (index === -1) {
            return false;
        }

        this.addTalentAptitudeExperience(index);
        return true;
    }

    private getTalentAptitudeAddIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.talentAptitudeList;
        if (!list?.visible) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const addButtonOffsetX = 160;
        const addButtonWidth = 50;
        const y = local.y + scrollY;
        const row = Math.floor(y / this.talentItemHeight);
        const rowOffset = y - row * this.talentItemHeight;
        if (row < 0 || row >= this.attributeNames.length || rowOffset < 0 || rowOffset > this.talentItemHeight) {
            return -1;
        }

        if (local.x < addButtonOffsetX || local.x > addButtonOffsetX + addButtonWidth) {
            return -1;
        }

        return row;
    }

    private handleEquipmentStageClick(stageX: number, stageY: number): boolean {
        if (this.isPointInNode(this.unequipButton, stageX, stageY)) {
            this.unequipSelectedEquipment();
            return true;
        }

        if (this.isPointInNode(this.replaceButton, stageX, stageY)) {
            this.replaceSelectedEquipment();
            return true;
        }

        const equippedIndex = this.getEquipmentGridIndexByStagePoint(this.equippedList, stageX, stageY, this.equippedItems.length);
        if (equippedIndex !== -1) {
            this.selectEquipmentSlot(equippedIndex, this.replacementList, this.equippedDetailList, this.bagDetailList);
            return true;
        }

        const replacementIndex = this.getReplacementIndexByStagePoint(stageX, stageY);
        if (replacementIndex !== -1) {
            const replacements = this.getVisibleReplacementItems();
            this.selectReplacementEquipment(replacements[replacementIndex] ?? null, this.bagDetailList);
            return true;
        }

        return false;
    }

    private getEquipmentGridIndexByStagePoint(list: Laya.GList | null, stageX: number, stageY: number, itemCount: number): number {
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const rowStride = this.equipmentGridItemHeight + this.equipmentGridRowGap;
        const columnStride = this.equipmentGridItemWidth + this.equipmentGridColumnGap;
        const row = Math.floor((local.y + scrollY) / rowStride);
        const rowOffset = (local.y + scrollY) - row * rowStride;
        if (rowOffset > this.equipmentGridItemHeight) {
            return -1;
        }

        const column = Math.floor(local.x / columnStride);
        const columnOffset = local.x - column * columnStride;
        if (column < 0 || column >= this.equipmentGridColumns || columnOffset > this.equipmentGridItemWidth) {
            return -1;
        }

        const itemIndex = row * this.equipmentGridColumns + column;
        return itemIndex >= 0 && itemIndex < itemCount ? itemIndex : -1;
    }

    private getReplacementIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.replacementList;
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const replacements = this.getVisibleReplacementItems();
        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const index = Math.floor((local.y + scrollY) / this.replacementItemHeight);
        return index >= 0 && index < replacements.length ? index : -1;
    }

    private getVisibleReplacementItems(): EquipmentData[] {
        const list = this.replacementList;
        if (!list?.visible) {
            return [];
        }

        const selected = this.selectedEquipmentSlotIndex;
        const slotKey = this.slotKeys[selected];
        return slotKey ? this.bagEquipment.filter((item) => item.slot === slotKey) : [];
    }

    private handleSkillStageClick(stageX: number, stageY: number): boolean {
        if (this.isPointInNode(this.routineSlotButton, stageX, stageY)) {
            this.selectSkillCategory("routine");
            return true;
        }

        if (this.isPointInNode(this.internalSlotButton, stageX, stageY)) {
            this.selectSkillCategory("internal");
            return true;
        }

        if (this.isPointInNode(this.lightnessSlotButton, stageX, stageY)) {
            this.selectSkillCategory("lightness");
            return true;
        }

        if (this.isPointInNode(this.activateSkillButton, stageX, stageY)) {
            this.activateSelectedSkill();
            return true;
        }

        if (this.isPointInNode(this.practiceCostInfo, stageX, stageY)) {
            this.tryPracticeSelectedSkill();
            return true;
        }

        const skills = this.getLearnedSkillsByCategory(this.selectedSkillCategory);
        const skillIndex = this.getVerticalListIndexByStagePoint(this.learnedSkillList, stageX, stageY, skills.length, this.learnedSkillItemHeight);
        if (skillIndex !== -1) {
            this.selectLearnedSkill(skills[skillIndex] ?? null);
            return true;
        }

        const moveCount = this.selectedSkill?.moves.length ?? 0;
        const moveIndex = this.getVerticalListIndexByStagePoint(this.skillMoveList, stageX, stageY, moveCount, this.skillMoveItemHeight);
        if (moveIndex !== -1) {
            this.selectSkillMove(moveIndex);
            return true;
        }

        return false;
    }

    private getVerticalListIndexByStagePoint(list: Laya.GList | null, stageX: number, stageY: number, itemCount: number, itemHeight: number): number {
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const index = Math.floor((local.y + scrollY) / itemHeight);
        return index >= 0 && index < itemCount ? index : -1;
    }

    private onStageWheel(event: Laya.Event): void {
        if (!this.meridianRoot?.visible) {
            return;
        }

        const stageX = Laya.stage.mouseX;
        const stageY = Laya.stage.mouseY;
        const target = this.isPointInNode(this.meridianList, stageX, stageY)
            ? this.meridianList
            : this.isPointInNode(this.acupointList, stageX, stageY)
                ? this.acupointList
                : null;
        if (!target?.scroller) {
            return;
        }

        const direction = event.delta > 0 ? 1 : -1;
        const nextY = target.scroller.posY + direction * (this.meridianItemHeight + this.meridianItemGap);
        target.scroller.setPosY(nextY, false);
    }

    private selectMeridianByStagePoint(stageX: number, stageY: number): void {
        const list = this.meridianList;
        if (!list) {
            return;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const itemIndex = this.getListItemIndexByPoint(local.x, local.y, scrollY, this.meridianNames.length, this.meridianListColumns);
        const meridianName = this.meridianNames[itemIndex];
        if (!meridianName) {
            return;
        }

        this.selectMeridianIndex(itemIndex);
    }

    private selectMeridianIndex(index: number): void {
        if (index < 0 || index >= this.meridianNames.length) {
            return;
        }

        this.selectedMeridianIndex = index;
        const meridianName = this.meridianNames[index];
        const selectedDirection = this.getSelectedMeridianDirection(meridianName);
        this.hasSelectedMeridianDirection = selectedDirection !== undefined;
        this.selectedMeridianDirection = selectedDirection ?? "forward";
        this.refreshMeridianListOnly();
        this.renderAcupointList(this.acupointList, meridianName);
        this.renderMeridianDetail();
        if (selectedDirection) {
            this.showMeridianChargeMode(selectedDirection);
        } else {
            this.showMeridianInfoMode();
        }
    }

    private getListItemIndexByPoint(localX: number, localY: number, scrollY: number, itemCount: number, columns: number): number {
        if (localX < 0 || localY < 0) {
            return -1;
        }

        const rowStride = this.meridianItemHeight + this.meridianItemGap;
        const row = Math.floor((localY + scrollY) / rowStride);
        const rowOffset = (localY + scrollY) - row * rowStride;
        if (rowOffset > this.meridianItemHeight) {
            return -1;
        }

        const column = Math.floor(localX / this.meridianItemWidth);
        if (column < 0 || column >= columns) {
            return -1;
        }

        const itemIndex = row * columns + column;
        return itemIndex >= 0 && itemIndex < itemCount ? itemIndex : -1;
    }

    private refreshMeridianListOnly(): void {
        const list = this.meridianList;
        if (!list) {
            return;
        }

        list.itemRenderer = (index: number, item: Laya.GWidget) => {
            const meridianName = this.meridianNames[index] ?? "";
            this.renderMeridianItem(item, meridianName, index === this.selectedMeridianIndex);

            item.offAll(Laya.Event.CLICK);
            item.on(Laya.Event.CLICK, this, () => this.selectMeridianIndex(index));
        };
        list.numItems = this.meridianNames.length;
    }

    private getPanelIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.panelList;
        if (!list || !this.isPointInNode(list, stageX, stageY)) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        if (local.y < 0 || local.y > this.panelItemHeight) {
            return -1;
        }

        const index = Math.floor(local.x / this.panelItemWidth);
        return index >= 0 && index < this.panelNames.length ? index : -1;
    }

    private renderMeridianDetail(): void {
        const text = this.meridianDetailText;
        if (!text) {
            return;
        }

        const meridianName = this.meridianNames[this.selectedMeridianIndex] ?? "";
        const bonuses = this.meridianBonuses[meridianName] ?? [];
        const openedCount = this.getOpenedAcupointCount(meridianName, this.getSelectedMeridianDirection(meridianName));
        const currentBonuses = this.scaleBonusTexts(bonuses, openedCount);
        const completionBonuses = this.getMeridianCompletionBonusTexts(meridianName);
        const selectedCompletionBonuses = this.selectedMeridianDirection === "forward"
            ? completionBonuses.forward
            : completionBonuses.reverse;
        const completionEffectText = this.getOrCreateMeridianCompletionEffectText();

        if (this.hasSelectedMeridianDirection) {
            text.text = [
                `经脉：${meridianName}`,
                `方向：${this.selectedMeridianDirection === "forward" ? "顺通" : "逆通"}`,
                `当前已提升：${currentBonuses.length > 0 ? currentBonuses.join("，") : "无"}`,
            ].join("\n");

            if (completionEffectText) {
                completionEffectText.visible = true;
                completionEffectText.color = openedCount >= 10 ? "#f3d27a" : "#777777";
                completionEffectText.text = `通脉效果：${selectedCompletionBonuses.join("，")}`;
            }
        } else {
            text.text = [
                `经脉：${meridianName}`,
                `顺通效果：${completionBonuses.forward.join("，")}`,
                `逆通效果：${completionBonuses.reverse.join("，")}`,
            ].join("\n");

            if (completionEffectText) {
                completionEffectText.visible = false;
                completionEffectText.text = "";
            }
        }

        if (this.meridianProgressText) {
            this.meridianProgressText.text = `${openedCount}/10\n冲穴需要${this.getSelectedAcupointQiCost()}真气`;
        }

        this.renderMeridianQi();
    }

    private getOrCreateMeridianCompletionEffectText(): Laya.Text | null {
        const detailRoot = this.meridianDetailRoot;
        const detailText = this.meridianDetailText;
        if (!detailRoot || !detailText) {
            return null;
        }

        if (!this.meridianCompletionEffectText) {
            const text = new Laya.Text();
            text.name = "MeridianCompletionEffectText";
            text.fontSize = detailText.fontSize;
            text.width = detailText.width;
            text.height = 40;
            text.x = detailText.x;
            text.y = detailText.y + 92;
            text.wordWrap = true;
            detailRoot.addChild(text);
            this.meridianCompletionEffectText = text;
        }

        return this.meridianCompletionEffectText;
    }
    private findMeridianDetailText(): Laya.Text | null {
        const detailRoot = this.meridianRoot?.getChildByName("node_2");
        if (!detailRoot) {
            return null;
        }

        return (detailRoot.getChildByName("xiangxi") ?? detailRoot.getChildByName("xiangqing") ?? detailRoot.getChildByName("Text")) as Laya.Text | null;
    }

    private findMeridianProgressText(): Laya.Text | null {
        const progressRoot = this.meridianRoot?.getChildByName("node_3");
        if (!progressRoot) {
            return null;
        }

        return progressRoot.getChildByName("jingdu") as Laya.Text | null;
    }

    private findMeridianQiText(): Laya.Text | null {
        const progressRoot = this.meridianRoot?.getChildByName("node_3");
        if (!progressRoot) {
            return null;
        }

        return progressRoot.getChildByName("zhenqi") as Laya.Text | null;
    }

    private getOpenedAcupointCount(meridianName: string, direction = this.getSelectedMeridianDirection(meridianName)): number {
        if (!direction) {
            return 0;
        }

        return Math.max(0, Math.min(10, this.openedAcupointCounts[this.getMeridianProgressKey(meridianName, direction)] ?? 0));
    }

    private isAcupointOpened(meridianName: string, index: number, acupointCount: number): boolean {
        const openedCount = this.getOpenedAcupointCount(meridianName, this.getSelectedMeridianDirection(meridianName));
        return index < openedCount;
    }

    private getDisplayAcupoints(meridianName: string): string[] {
        const acupoints = this.meridianAcupoints[meridianName] ?? [];
        const selectedDirection = this.getSelectedMeridianDirection(meridianName);
        return selectedDirection === "reverse" ? [...acupoints].reverse() : acupoints;
    }

    private getSelectedMeridianDirection(meridianName: string): "forward" | "reverse" | undefined {
        return this.selectedMeridianDirections[meridianName];
    }

    private getMeridianProgressKey(meridianName: string, direction: "forward" | "reverse"): string {
        return `${meridianName}:${direction}`;
    }

    private resetMeridianSelection(): void {
        this.renderMeridianDetail();
    }

    private scaleBonusTexts(bonuses: string[], count: number): string[] {
        return bonuses.map((bonus) => bonus.replace(/\+(\d+(?:\.\d+)?)/, (_match, value) => `+${this.formatBonusNumber(Number(value) * count)}`));
    }

    private getMeridianCompletionBonusTexts(meridianName: string): { forward: string[]; reverse: string[] } {
        const bonuses = this.meridianCompletionBonuses[meridianName];
        return {
            forward: bonuses?.forward ?? ["未设定"],
            reverse: bonuses?.reverse ?? ["未设定"],
        };
    }

    private bindMeridianModeButtons(): void {
        this.forwardMeridianButton?.offAll(Laya.Event.CLICK);
        this.reverseMeridianButton?.offAll(Laya.Event.CLICK);
        this.forwardMeridianButton?.on(Laya.Event.CLICK, this, () => this.showMeridianChargeMode("forward"));
        this.reverseMeridianButton?.on(Laya.Event.CLICK, this, () => this.showMeridianChargeMode("reverse"));
        this.setButtonText(this.forwardMeridianButton, "顺通");
        this.setButtonText(this.reverseMeridianButton, "逆通");
        this.setMeridianChargeButtonText("冲穴");
        this.showMeridianInfoMode();
    }

    private showMeridianInfoMode(): void {
        this.hasSelectedMeridianDirection = false;
        if (this.meridianDetailRoot) {
            this.meridianDetailRoot.visible = true;
        }

        if (this.meridianProgressRoot) {
            this.meridianProgressRoot.visible = true;
        }

        if (this.forwardMeridianButton) {
            this.forwardMeridianButton.visible = true;
        }

        if (this.reverseMeridianButton) {
            this.reverseMeridianButton.visible = true;
        }

        if (this.resetMeridianDirectionButton) {
            this.resetMeridianDirectionButton.visible = false;
        }

        if (this.meridianChargeRoot) {
            this.meridianChargeRoot.visible = false;
        }
    }

    private showMeridianChargeMode(direction: "forward" | "reverse" = "forward"): void {
        this.hasSelectedMeridianDirection = true;
        this.selectedMeridianDirection = direction;
        const meridianName = this.meridianNames[this.selectedMeridianIndex] ?? "";
        if (meridianName) {
            this.selectedMeridianDirections[meridianName] = direction;
        }
        if (this.meridianDetailRoot) {
            this.meridianDetailRoot.visible = true;
        }

        if (this.meridianProgressRoot) {
            this.meridianProgressRoot.visible = true;
        }

        if (this.forwardMeridianButton) {
            this.forwardMeridianButton.visible = false;
        }

        if (this.reverseMeridianButton) {
            this.reverseMeridianButton.visible = false;
        }

        if (this.resetMeridianDirectionButton) {
            this.resetMeridianDirectionButton.visible = true;
        }

        if (this.meridianChargeRoot) {
            this.meridianChargeRoot.visible = true;
        }

        this.setMeridianChargeButtonText("冲穴");
        this.renderAcupointList(this.acupointList, this.meridianNames[this.selectedMeridianIndex] ?? "");
        this.renderMeridianDetail();
    }

    private resetSelectedMeridianDirection(): void {
        const meridianName = this.meridianNames[this.selectedMeridianIndex] ?? "";
        const direction = this.getSelectedMeridianDirection(meridianName);
        if (!meridianName || !direction) {
            this.showMeridianInfoMode();
            this.renderMeridianDetail();
            return;
        }

        delete this.selectedMeridianDirections[meridianName];
        delete this.openedAcupointCounts[this.getMeridianProgressKey(meridianName, direction)];
        this.hasSelectedMeridianDirection = false;
        this.selectedMeridianDirection = "forward";
        this.showMeridianInfoMode();
        this.renderAcupointList(this.acupointList, meridianName);
        this.renderMeridianDetail();
        this.refreshAttributePanel();
    }

    private tryChargeSelectedAcupoint(): void {
        const meridianName = this.meridianNames[this.selectedMeridianIndex] ?? "";
        if (!meridianName) {
            return;
        }

        const openedCount = this.getOpenedAcupointCount(meridianName, this.selectedMeridianDirection);
        if (openedCount >= 10) {
            this.setMeridianChargeButtonText("已全通");
            return;
        }

        const cost = this.getSelectedAcupointQiCost();
        if (this.currentQi < cost) {
            this.setMeridianChargeButtonText("真气不足");
            Laya.timer.once(800, this, () => this.setMeridianChargeButtonText("冲穴"));
            return;
        }

        this.currentQi -= cost;
        this.openedAcupointCounts[this.getMeridianProgressKey(meridianName, this.selectedMeridianDirection)] = openedCount + 1;
        this.refreshMeridianListOnly();
        this.renderAcupointList(this.acupointList, meridianName);
        this.refreshVisibleAcupointItems(this.acupointList, meridianName);
        this.renderMeridianDetail();
        this.refreshAttributePanel();
        this.setMeridianChargeButtonText(this.getOpenedAcupointCount(meridianName, this.selectedMeridianDirection) >= 10 ? "已全通" : "冲穴");
    }

    private setMeridianChargeButtonText(value: string): void {
        const text = (this.meridianChargeRoot?.getChildByName("Text") ?? this.meridianChargeRoot?.getChildByName("chongxue")) as Laya.Text | null;
        if (text) {
            text.text = value;
        }
    }

    private setButtonText(button: Laya.Sprite | null, value: string): void {
        const text = button?.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.text = value;
        }
    }

    private getSelectedAcupointQiCost(): number {
        const meridianName = this.meridianNames[this.selectedMeridianIndex] ?? "";
        const openedCount = this.getOpenedAcupointCount(meridianName, this.selectedMeridianDirection);
        return (openedCount + 1) * 100;
    }

    private renderMeridianQi(): void {
        if (!this.meridianQiText) {
            return;
        }

        const recoverText = this.currentQi >= this.maxQi
            ? "真气已满"
            : `${this.qiRecoverRemainingSeconds}秒后恢复1点真气`;
        this.meridianQiText.text = `${this.currentQi}/${this.maxQi}\n${recoverText}`;
    }

    private updateQiRecoveryTimer(): void {
        if (this.currentQi >= this.maxQi) {
            this.qiRecoverRemainingSeconds = this.qiRecoverSeconds;
            this.renderMeridianQi();
            return;
        }

        this.qiRecoverRemainingSeconds -= 1;
        if (this.qiRecoverRemainingSeconds <= 0) {
            this.currentQi = Math.min(this.maxQi, this.currentQi + 1);
            this.qiRecoverRemainingSeconds = this.qiRecoverSeconds;
        }

        this.renderMeridianQi();
    }

    private formatBonusNumber(value: number): string {
        return Number.isInteger(value) ? `${value}` : `${Number(value.toFixed(2))}`;
    }

    private isPointInNode(node: Laya.Sprite | null, stageX: number, stageY: number): boolean {
        if (!this.isNodeVisibleInTree(node)) {
            return false;
        }

        const point = node.localToGlobal(new Laya.Point(0, 0), true);
        return stageX >= point.x
            && stageX <= point.x + node.width
            && stageY >= point.y
            && stageY <= point.y + node.height;
    }

    private isNodeVisibleInTree(node: Laya.Sprite | null): boolean {
        let current: Laya.Node | null = node;
        while (current) {
            const visible = (current as Laya.Sprite).visible;
            if (visible === false) {
                return false;
            }

            current = current.parent;
        }

        return !!node;
    }

    private renderMeridianItem(item: Laya.GWidget, label: string, selected: boolean): void {
        this.renderSelectableItem(item, label, selected);
        const openedCount = this.getOpenedAcupointCount(label);
        const isOpened = openedCount >= 10;
        const background = (item as any).background;
        if (background) {
            background.fillColor = isOpened ? "#2f2b20" : "#1c1c1c";
        }

        const text = item.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.color = isOpened ? "#f3d27a" : "#777777";
        }
    }

    private renderAcupointItem(item: Laya.GWidget, label: string, selected: boolean, opened: boolean): void {
        this.renderSelectableItem(item, label, selected);
        const background = (item as any).background;
        if (background) {
            background.fillColor = opened ? "#2f2b20" : "#1c1c1c";
        }

        const text = item.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.color = opened ? "#f3d27a" : "#777777";
        }
    }

    private refreshVisibleAcupointItems(list: Laya.GList | null, meridianName: string): void {
        if (!list) {
            return;
        }

        const acupoints = this.meridianAcupoints[meridianName] ?? [];
        const displayAcupoints = this.getDisplayAcupoints(meridianName);
        for (let childIndex = 0; childIndex < list.numChildren; childIndex++) {
            const item = list.getChildAt(childIndex) as Laya.GWidget;
            const itemIndex = list.childIndexToItemIndex(childIndex);
            const label = displayAcupoints[itemIndex] ?? "";
            if (!label) {
                continue;
            }

            this.renderAcupointItem(item, label, false, this.isAcupointOpened(meridianName, itemIndex, displayAcupoints.length));
        }
    }

    private renderSelectableItem(item: Laya.GWidget, label: string, selected: boolean): void {
        const highlight = this.getOrCreateHighlight(item);
        highlight.visible = selected;
        highlight.graphics.clear();
        highlight.graphics.drawRect(0, 0, item.width, item.height, "rgba(0,0,0,0)", "#f1df8a", 4);

        const text = item.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.text = label;
        }
    }

    private getOrCreateHighlight(item: Laya.GWidget): Laya.Sprite {
        let highlight = item.getChildByName("Highlight") as Laya.Sprite | null;
        if (!highlight) {
            highlight = new Laya.Sprite();
            highlight.name = "Highlight";
            item.addChild(highlight);
        } else {
            item.setChildIndex(highlight, item.numChildren - 1);
        }

        return highlight;
    }

    private findRolePanelList(root: Laya.Node): Laya.GList | null {
        const lists = this.findNodes(root, "list");
        for (const node of lists) {
            if (node instanceof Laya.GList && node.width > 500 && node.height <= 100 && node.y >= 180 && node.y <= 230) {
                return node;
            }
        }

        return null;
    }

    private findSkillNode(name: string): Laya.Node | null {
        return this.skillRoot ? this.findNode(this.skillRoot, name) : null;
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

    private findNodes(root: Laya.Node, name: string, results: Laya.Node[] = []): Laya.Node[] {
        if (root.name === name) {
            results.push(root);
        }

        for (let i = 0; i < root.numChildren; i++) {
            this.findNodes(root.getChildAt(i), name, results);
        }

        return results;
    }
}


