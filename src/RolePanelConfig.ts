import type { AttributeCapStats, AttributeConversionRatios, EquipmentData, EquipmentSlot, PanelStats, PrimaryAttributeKey, RoleData, RoleStatConfig, SkillCategory, SkillData, StatKey } from "./RolePanelTypes";

export const ROLE_LEVEL = 1;
export const ROLE_BASE_LEVEL_UP_EXP = 250;
export const ROLE_LEVEL_UP_EXP_QUADRATIC_RATE = 3.06;

export function getRoleLevelUpRequiredExperience(level: number): number {
    const normalizedLevel = Math.max(1, Math.floor(level));
    return Math.round(ROLE_BASE_LEVEL_UP_EXP + ROLE_LEVEL_UP_EXP_QUADRATIC_RATE * (normalizedLevel - 1) ** 2);
}

export const LEVEL_GROWTH_STATS: PanelStats = {
    attack: 20,
    defense: 20,
    hp: 100,
    hit: 5,
    dodge: 5,
    parry: 5,
    speed: 5,
    nl: 10,
};

export const ATTRIBUTE_CONVERSION_RATIOS: AttributeConversionRatios = {
    strength: {
        attack: 5,
    },
    technique: {
        hit: 5,
        parry: 5,
    },
    agility: {
        speed: 5,
        dodge: 5,
    },
    rootBone: {
        hp: 20,
        toughness: 1,
    },
    innerBreath: {
        nl: 10,
        nlRegen: 0.5,
    },
    willpower: {
        resistance: 2.5,
    },
};

export const ROLES: RoleData[] = [
    { name: "\u9752\u69d0", avatarColor: "#2fd3c4" },
    { name: "\u6c88\u6e05\u6b4c", avatarColor: "#6aa9ff" },
    { name: "\u9646\u660e\u5ddd", avatarColor: "#d8b15f" },
    { name: "\u767d\u82b7", avatarColor: "#b98cff" },
    { name: "\u6768\u94c1\u8863", avatarColor: "#d96b6b" },
    { name: "\u71d5\u5341\u65b9", avatarColor: "#c88a5a" },
];

export const PANEL_NAMES = ["\u5c5e\u6027", "\u88c5\u5907", "\u529f\u6cd5", "\u5929\u8d4b", "\u7ecf\u8109"];

export const ATTRIBUTE_NAMES = ["\u81c2\u529b", "\u6280\u5de7", "\u8eab\u6cd5", "\u6839\u9aa8", "\u5185\u606f", "\u5b9a\u529b"];

export const BASE_ATTRIBUTES: PanelStats = {
    strength: 10,
    technique: 10,
    agility: 10,
    rootBone: 10,
    innerBreath: 10,
    willpower: 10,
};

export const INITIAL_PANEL_STATS: PanelStats = {
    ...BASE_ATTRIBUTES,
};

export const PRIMARY_ATTRIBUTE_KEYS: PrimaryAttributeKey[] = ["strength", "technique", "agility", "rootBone", "innerBreath", "willpower"];

export const STANDARD_ATTRIBUTE_CAPS: AttributeCapStats = {
    strength: { base: 15, growth: 1.5 },
    technique: { base: 15, growth: 1.5 },
    agility: { base: 15, growth: 1.5 },
    rootBone: { base: 15, growth: 1.5 },
    innerBreath: { base: 15, growth: 1.5 },
    willpower: { base: 15, growth: 1.5 },
};

export const ROLE_ATTRIBUTE_CAPS: Record<string, AttributeCapStats> = {
    青槐: STANDARD_ATTRIBUTE_CAPS,
    沈清歌: STANDARD_ATTRIBUTE_CAPS,
    陆明川: STANDARD_ATTRIBUTE_CAPS,
    白芷: STANDARD_ATTRIBUTE_CAPS,
    杨铁衣: STANDARD_ATTRIBUTE_CAPS,
    燕十方: STANDARD_ATTRIBUTE_CAPS,
};

export const ROLE_STAT_CONFIGS: Record<string, RoleStatConfig> = {
    青槐: {
        initialAttributes: { ...INITIAL_PANEL_STATS },
        levelGrowthStats: { ...LEVEL_GROWTH_STATS },
        attributeConversionRatios: ATTRIBUTE_CONVERSION_RATIOS,
        attributeCaps: ROLE_ATTRIBUTE_CAPS["青槐"],
    },
    沈清歌: {
        initialAttributes: { ...INITIAL_PANEL_STATS },
        levelGrowthStats: { ...LEVEL_GROWTH_STATS },
        attributeConversionRatios: ATTRIBUTE_CONVERSION_RATIOS,
        attributeCaps: ROLE_ATTRIBUTE_CAPS["沈清歌"],
    },
    陆明川: {
        initialAttributes: { ...INITIAL_PANEL_STATS },
        levelGrowthStats: { ...LEVEL_GROWTH_STATS },
        attributeConversionRatios: ATTRIBUTE_CONVERSION_RATIOS,
        attributeCaps: ROLE_ATTRIBUTE_CAPS["陆明川"],
    },
    白芷: {
        initialAttributes: { ...INITIAL_PANEL_STATS },
        levelGrowthStats: { ...LEVEL_GROWTH_STATS },
        attributeConversionRatios: ATTRIBUTE_CONVERSION_RATIOS,
        attributeCaps: ROLE_ATTRIBUTE_CAPS["白芷"],
    },
    杨铁衣: {
        initialAttributes: { ...INITIAL_PANEL_STATS },
        levelGrowthStats: { ...LEVEL_GROWTH_STATS },
        attributeConversionRatios: ATTRIBUTE_CONVERSION_RATIOS,
        attributeCaps: ROLE_ATTRIBUTE_CAPS["杨铁衣"],
    },
    燕十方: {
        initialAttributes: {
            strength: 12,
            technique: 8,
            agility: 11,
            rootBone: 13,
            innerBreath: 8,
            willpower: 8,
        },
        levelGrowthStats: {
            attack: 23.5,
            defense: 19,
            speed: 4.8,
            hit: 4.8,
            parry: 4.75,
            dodge: 4.77,
            resistance: 2.45,
            toughness: 1.12,
            hp: 109,
            nl: 9.2,
            nlRegen: 0.5,
            hpRegen: 0,
        },
        attributeConversionRatios: {
            strength: {
                attack: 5.6,
            },
            technique: {
                hit: 4.8,
                parry: 4.6,
            },
            agility: {
                speed: 4.88,
                dodge: 4.85,
            },
            rootBone: {
                hp: 20.5,
                toughness: 1.11,
            },
            innerBreath: {
                nl: 8.1,
                nlRegen: 0.5,
            },
            willpower: {
                resistance: 2.23,
            },
        },
        attributeCaps: {
            ...STANDARD_ATTRIBUTE_CAPS,
            strength: { base: 15, growth: 1.89 },
        },
    },
};

export const SECONDARY_ATTRIBUTE_NAMES = [
    "\u653b\u51fb",
    "\u9632\u5fa1",
    "\u901f\u5ea6",
    "\u547d\u4e2d",
    "\u62db\u67b6",
    "\u504f\u659c",
    "\u62b5\u6297",
    "\u97e7\u6027",
    "\u6c14\u8840",
    "\u5185\u529b",
    "\u5185\u529b\u56de\u590d",
    "\u6c14\u8840\u6062\u590d",
];

export const MERIDIAN_NAMES = [
    "\u624b\u592a\u9634\u7ecf",
    "\u624b\u53a5\u9634\u7ecf",
    "\u624b\u5c11\u9634\u7ecf",
    "\u624b\u9633\u660e\u7ecf",
    "\u624b\u5c11\u9633\u7ecf",
    "\u624b\u592a\u9633\u7ecf",
    "\u8db3\u9633\u660e\u7ecf",
    "\u8db3\u5c11\u9633\u7ecf",
    "\u8db3\u592a\u9633\u7ecf",
    "\u8db3\u592a\u9634\u7ecf",
    "\u8db3\u53a5\u9634\u7ecf",
    "\u8db3\u5c11\u9634\u7ecf",
    "\u4efb\u8109",
    "\u7763\u8109",
    "\u51b2\u8109",
    "\u5e26\u8109",
    "\u9634\u8df7\u8109",
    "\u9633\u8df7\u8109",
    "\u9634\u7ef4\u8109",
    "\u9633\u7ef4\u8109",
];

export const MERIDIAN_ACUPOINTS: Record<string, string[]> = {
    手太阴经: ["中府", "云门", "天府", "侠白", "尺泽", "孔最", "列缺", "经渠", "太渊", "鱼际"],
    手厥阴经: ["天池", "天泉", "曲泽", "郄门", "间使", "内关", "大陵", "劳宫", "中冲", "膻中"],
    手少阴经: ["极泉", "青灵", "少海", "灵道", "通里", "阴郄", "神门", "少府", "少冲", "巨阙"],
    手阳明经: ["商阳", "二间", "三间", "合谷", "阳溪", "偏历", "温溜", "下廉", "上廉", "手三里"],
    手少阳经: ["关冲", "液门", "中渚", "阳池", "外关", "支沟", "会宗", "三阳络", "四渎", "天井"],
    手太阳经: ["少泽", "前谷", "后溪", "腕骨", "阳谷", "养老", "支正", "小海", "肩贞", "臑俞"],
    足阳明经: ["承泣", "四白", "巨髎", "地仓", "大迎", "颊车", "下关", "头维", "人迎", "水突"],
    足少阳经: ["瞳子髎", "听会", "上关", "颔厌", "悬颅", "悬厘", "曲鬓", "率谷", "天冲", "浮白"],
    足太阳经: ["睛明", "攒竹", "眉冲", "曲差", "五处", "承光", "通天", "络却", "玉枕", "天柱"],
    足太阴经: ["隐白", "大都", "太白", "公孙", "商丘", "三阴交", "漏谷", "地机", "阴陵泉", "血海"],
    足厥阴经: ["大敦", "行间", "太冲", "中封", "蠡沟", "中都", "膝关", "曲泉", "阴包", "足五里"],
    足少阴经: ["涌泉", "然谷", "太溪", "大钟", "水泉", "照海", "复溜", "交信", "筑宾", "阴谷"],
    任脉: ["会阴", "曲骨", "中极", "关元", "石门", "气海", "阴交", "神阙", "水分", "下脘"],
    督脉: ["长强", "腰俞", "腰阳关", "命门", "悬枢", "脊中", "中枢", "筋缩", "至阳", "灵台"],
    冲脉: ["横骨", "大赫", "气穴", "四满", "中注", "肓俞", "商曲", "石关", "阴都", "腹通谷"],
    带脉: ["带脉", "五枢", "维道", "章门", "京门", "足临泣", "外关", "居髎", "肾俞", "志室"],
    阴跷脉: ["然谷", "照海", "交信", "横骨", "大赫", "气穴", "中注", "缺盆", "人迎", "睛明"],
    阳跷脉: ["申脉", "仆参", "跗阳", "居髎", "臑俞", "巨骨", "肩髃", "地仓", "巨髎", "承泣"],
    阴维脉: ["筑宾", "府舍", "大横", "腹哀", "期门", "天突", "廉泉", "内关", "公孙", "关元"],
    阳维脉: ["金门", "阳交", "臑俞", "天髎", "肩井", "头维", "本神", "阳白", "头临泣", "风池"],
};

export const MERIDIAN_BONUSES: Record<string, string[]> = {
    手太阴经: ["攻击 +18"],
    手厥阴经: ["攻击 +11", "速度 +8"],
    手少阴经: ["攻击 +5", "命中 +4"],
    手阳明经: ["命中 +8", "招架 +7"],
    手少阳经: ["防御 +7", "招架 +5"],
    手太阳经: ["防御 +24.6", "偏斜 +20"],
    足阳明经: ["偏斜 +12"],
    足少阳经: ["速度 +4", "偏斜 +6"],
    足太阳经: ["速度 +12", "命中 +13"],
    足太阴经: ["气血 +150", "内力回复 +4"],
    足厥阴经: ["气血 +41", "防御 +14"],
    足少阴经: ["气血 +20"],
    任脉: ["气血 +90", "防御 +36"],
    督脉: ["命中 +18", "偏斜 +24"],
    冲脉: ["气血 +120"],
    带脉: ["命中 +24"],
    阴跷脉: ["防御 +64"],
    阳跷脉: ["速度 +16", "偏斜 +20"],
    阴维脉: ["速度 +14", "招架 +18"],
    阳维脉: ["攻击 +15", "命中 +16"],
};

export const MERIDIAN_COMPLETION_BONUSES: Record<string, { forward: string[]; reverse: string[] }> = {
    手太阴经: { forward: ["臂力 +15"], reverse: ["内息 +15"] },
    手厥阴经: { forward: ["穿甲 +5%"], reverse: ["免伤 +3%"] },
    手少阴经: { forward: ["臂力 +5"], reverse: ["根骨 +5"] },
    手阳明经: { forward: ["攻击 +3%"], reverse: ["气血 +5%"] },
    手少阳经: { forward: ["内息 +5"], reverse: ["身法 +5"] },
    手太阳经: { forward: ["根骨 +15"], reverse: ["身法 +15"] },
    足太阴经: { forward: ["内力回复 +15%"], reverse: ["气血回复 +15%"] },
    足厥阴经: { forward: ["内力回复 +10%"], reverse: ["气血回复 +10%"] },
    足少阴经: { forward: ["内力回复 +5%"], reverse: ["气血回复 +5%"] },
    足阳明经: { forward: ["命中 +5%"], reverse: ["偏斜 +5%"] },
    足少阳经: { forward: ["速度 +3%"], reverse: ["招架 +3%"] },
    足太阳经: { forward: ["韧性 +100"], reverse: ["定力 +100"] },
    冲脉: { forward: ["受治疗 +12%"], reverse: ["气血回复 +15%"] },
    督脉: { forward: ["内力回复 +15%"], reverse: ["内力上限 +10%"] },
    任脉: { forward: ["气血回复 +12%"], reverse: ["免伤 +5%"] },
    阴跷脉: { forward: ["韧性 +200"], reverse: ["定力 +200"] },
    阳跷脉: { forward: ["穿甲 +10%"], reverse: ["气血上限 +12%"] },
    带脉: { forward: ["命中 +5%"], reverse: ["速度 +5%"] },
    阳维脉: { forward: ["臂力 +20"], reverse: ["根骨 +20"] },
    阴维脉: { forward: ["内息 +20"], reverse: ["身法 +20"] },
};

export const SLOT_NAMES = ["\u6b66\u5668", "\u62a4\u7532", "\u62a4\u8155", "\u62a4\u8170", "\u6212\u6307", "\u540a\u5760"];

export const SLOT_KEYS: EquipmentSlot[] = ["weapon", "armor", "wrist", "waist", "ring", "pendant"];

export const INITIAL_EQUIPPED_ITEMS: Array<EquipmentData | null> = [
    { name: "\u6728\u5251", slot: "weapon", mainStats: ["\u653b\u51fb +18"], extraStats: ["\u547d\u4e2d +6"] },
    { name: "\u5e03\u8863", slot: "armor", mainStats: ["\u9632\u5fa1 +12"], extraStats: ["\u6c14\u8840 +80"] },
    { name: "\u5e03\u62a4\u8155", slot: "wrist", mainStats: ["\u62db\u67b6 +8"], extraStats: ["\u547d\u4e2d +4"] },
    { name: "\u5e03\u62a4\u8170", slot: "waist", mainStats: ["\u9632\u5fa1 +10"], extraStats: ["\u504f\u659c +3"] },
    { name: "\u6728\u6212\u6307", slot: "ring", mainStats: ["\u5185\u529b +60"], extraStats: ["\u5185\u606f +2"] },
    { name: "\u6728\u540a\u5760", slot: "pendant", mainStats: ["\u6c14\u8840 +50"], extraStats: ["\u5b9a\u529b +2"] },
];

export const BAG_EQUIPMENT: EquipmentData[] = [
    { name: "\u9752\u94a2\u5251", slot: "weapon", mainStats: ["\u653b\u51fb +42"], extraStats: ["\u547d\u4e2d +10", "\u6280\u5de7 +3"] },
    { name: "\u7af9\u67c4\u957f\u5251", slot: "weapon", mainStats: ["\u653b\u51fb +31"], extraStats: ["\u901f\u5ea6 +5"] },
    { name: "\u9752\u5e03\u957f\u886b", slot: "armor", mainStats: ["\u9632\u5fa1 +24"], extraStats: ["\u6c14\u8840 +120"] },
    { name: "\u7f1a\u4e1d\u62a4\u8155", slot: "wrist", mainStats: ["\u62db\u67b6 +14"], extraStats: ["\u547d\u4e2d +7"] },
    { name: "\u7f1a\u4e1d\u8170\u5e26", slot: "waist", mainStats: ["\u9632\u5fa1 +16"], extraStats: ["\u504f\u659c +8"] },
    { name: "\u9752\u7389\u6212", slot: "ring", mainStats: ["\u5185\u529b +130"], extraStats: ["\u5185\u606f +5"] },
    { name: "\u69d0\u6728\u540a\u5760", slot: "pendant", mainStats: ["\u6c14\u8840 +110"], extraStats: ["\u5b9a\u529b +5"] },
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
    routine: "\u5957\u8def",
    internal: "\u5185\u529f",
    lightness: "\u8f7b\u529f",
};

export const DEFAULT_EQUIPPED_SKILL_NAMES: Record<SkillCategory, string> = {
    routine: "\u9738\u738b\u5200\u6cd5",
    internal: "\u9738\u738b\u8bc0",
    lightness: "",
};

export const MAX_SKILL_LEVEL = 10;
export const MAX_SKILL_LAYER = 3;
export const BREAKTHROUGH_SECONDS = 60;
export const HANYING_ATTACK_GROWTH = [171, 172, 171, 172, 171, 172, 171, 172, 171, 172];
export const HANYING_HIT_GROWTH = [54, 54, 54, 54, 55, 55, 55, 55, 55, 55];
export const BAWANG_HP_GROWTH = [805, 805, 805, 805, 805, 805, 805, 805, 805, 805];
export const BAWANG_NL_GROWTH = [227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5, 227.5];
export const BAWANG_NL_REGEN_GROWTH = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7];

export const ROUTINE_STANDARD_BASE_STATS: PanelStats = {
    attack: 2700,
    hit: 1500,
    parry: 1500,
};

export const LEARNED_SKILLS: SkillData[] = [
    {
        name: "\u9738\u738b\u5200\u6cd5",
        category: "routine",
        baseStats: [],
        baseStatCoefficients: {
            attack: 1.3,
            hit: 0.5,
        },
        moves: [
            { name: "\u9738\u6c14\u521d\u73b0", detail: "\u7b2c1\u91cd\u89e3\u9501\n\u4e3b\u52a8\n\u83b7\u5f97\u6700\u5927\u751f\u547d\u503c8%\u7684\u4e34\u65f6\u62a4\u76fe\n\u4e3a\u81ea\u5df1\u65bd\u52a0\u201c\u529b\u91cf\u201dbuff\n\u529b\u91cf\uff1a\u589e\u52a0\u81ea\u8eab5%\u81c2\u529b\n\u53ef\u53e0\u52a05\u5c42\uff0c\u6301\u7eed25\u8c03\u606f\n\u51b7\u5374\u65f6\u95f48\u8c03\u606f\n\u6d88\u8017300\u5185\u529b", practiceCost: 140, unlockLevel: 1 },
            { name: "\u91cd\u697c", detail: "\u7b2c3\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u88c5\u5907\u91cd\u697c\u65f6\uff1a\n\u653b\u51fb+1550\n\u547d\u4e2d-100\n\u666e\u653b\u500d\u7387\u4e3a1.3\u500d", practiceCost: 160, unlockLevel: 3 },
            { name: "\u5378\u7532", detail: "\u7b2c5\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u6bcf\u6b21\u51fa\u624b\u83b7\u5f97\u201c\u5378\u7532\u201dbuff\n\u964d\u4f4e\u81ea\u8eab5%\u9632\u5fa1\u529b\n\u6700\u591a\u53e0\u52a06\u5c42\n\u6d88\u801725\u70b9\u5185\u529b", practiceCost: 190, unlockLevel: 5 },
            { name: "\u957f\u6b4c", detail: "\u7b2c7\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u51fb\u8d25\u76ee\u6807\u7acb\u5373\u518d\u884c\u52a8\u4e00\u6b21", practiceCost: 230, unlockLevel: 7 },
            { name: "\u65e0\u5f52", detail: "\u7b2c10\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u5378\u7532buff\u6ee16\u5c42\u65f6\uff0c\u4e0b\u56de\u5408\u8f6c\u5316\u4e3a\u4e00\u5c42\u201c\u65e0\u5f52\u201dbuff\n-30%\u9632\u5fa1\n+45%\u653b\u51fb\n+15%\u7a7f\u7532\n\u6301\u7eed\u81f3\u6218\u6597\u7ed3\u675f", practiceCost: 280, unlockLevel: 10 },
        ],
    },
    {
        name: "\u5bd2\u7f28\u843d\u6708\u67aa",
        category: "routine",
        baseStats: [],
        moves: [
            { name: "\u96ea\u6ee1\u5173\u5c71\u6708", detail: "\u7b2c1\u91cd\u89e3\u9501\n\u4e3b\u52a8\n\u8ffd\u8e2a\u7a81\u523a\n\u4f24\u5bb31350+\u81c2\u529b\u00d76\n\u4e0d\u53ef\u504f\u659c\n\u51b7\u537411\u8c03\u606f\n\u5185\u529b\u6d88\u8017250", practiceCost: 120, unlockLevel: 1 },
            { name: "\u767d\u7f28\u7167\u5bd2\u5ddd", detail: "\u7b2c3\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u653b\u51fb\u547d\u4e2d\u540e\u9644\u52a0\u5bd2\u52b2\n\u964d\u4f4e20%\u901f\u5ea6\n\u6301\u7eed2\u56de\u5408", practiceCost: 140, unlockLevel: 3 },
            { name: "\u56de\u9a6c\u8e0f\u60ca\u9e3f", detail: "\u7b2c5\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u653b\u51fb\u88ab\u504f\u659c/\u62db\u67b6\u65f6\u6982\u7387\u8ffd\u51fb\n\u6982\u738735%+\u8eab\u6cd5\u00d70.2%\n\u9020\u621085%\u4f24\u5bb3\n\u5185\u529b\u6d88\u8017150", practiceCost: 160, unlockLevel: 5 },
            { name: "\u5317\u98ce\u5377\u65ad\u4e91", detail: "\u7b2c7\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u961f\u53cb\u653b\u51fb\u65f6\u6982\u7387\u534f\u52a9\u653b\u51fb\n\u6982\u738735%+\u8eab\u6cd5\u00d70.1%\n\u9020\u621065%\u4f24\u5bb3\n\u5185\u529b\u6d88\u801750", practiceCost: 180, unlockLevel: 7 },
            { name: "\u94c1\u810a\u5370\u971c\u5bd2", detail: "\u7b2c10\u91cd\u89e3\u9501\n\u88ab\u52a8\n\u653b\u51fb\u5e26\u6709\u5bd2\u52b2\u7684\u76ee\u6807\u65f6\n\u81ea\u8eab\u83b7\u5f9715%\u62a4\u7532\u7a7f\u900f", practiceCost: 220, unlockLevel: 10 },
        ],
    },
    {
        name: "\u9738\u738b\u8bc0",
        category: "internal",
        baseStats: [],
        moves: [
            { name: "\u9738\u738b", detail: "\u7b2c3\u91cd\u89e3\u9501\n\u6bcf\u6b21\u53d7\u51fb\u6709\uff0830% + 0.15\u00d7\u81c2\u529b\uff09\u6982\u7387\u83b7\u5f971\u5c42\u201c\u9738\u738b\u201dbuff\n\u6301\u7eed\u6574\u573a\u6218\u6597\uff0c\u6700\u591a5\u5c42", practiceCost: 180, unlockLevel: 3 },
            { name: "\u51fa\u950b", detail: "\u7b2c5\u91cd\u89e3\u9501\n\u6bcf\u5c42\u201c\u9738\u738b\u201dbuff\u589e\u52a0\uff08\u9738\u6c14\u00d70.3 + \u81c2\u529b\u00d70.25\uff09\u653b\u51fb\u529b", practiceCost: 220, unlockLevel: 5 },
            { name: "\u9547\u52bf", detail: "\u7b2c7\u91cd\u89e3\u9501\n\u6bcf\u5c42\u201c\u9738\u738b\u201dbuff\u589e\u52a0\uff08\u9738\u6c14\u00d70.3 + \u5185\u606f\u00d70.2\uff09\u6c14\u8840\u56de\u590d\n\u56de\u5408\u7ed3\u675f\u56de\u590d", practiceCost: 260, unlockLevel: 7 },
            { name: "\u80cc\u6c34", detail: "\u7b2c10\u91cd\u89e3\u9501\n\u6bcf\u5c42\u201c\u9738\u738b\u201dbuff\u589e\u52a0\uff08\u9738\u6c14\u00d70.18\uff09\u97e7\u6027\u503c", practiceCost: 320, unlockLevel: 10 },
        ],
    },
    {
        name: "\u7a7a\u5c71\u7384\u6708\u624b",
        category: "routine",
        baseStats: [],
        baseStatCoefficients: {
            attack: 0.8,
            hit: 1.22,
        },
        moves: [],
    },
];

export const TALENT_NAMES = ["\u9752\u69d0\u672a\u9192"];
