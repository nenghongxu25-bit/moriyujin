export type EquipmentSlot = "weapon" | "armor" | "wrist" | "waist" | "ring" | "pendant";
export type SkillCategory = "routine" | "internal" | "lightness";
export type MoveKind = "active" | "passive";

export type StatKey =
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
    | "parry"
    | "dodge"
    | "resistance"
    | "toughness"
    | "hp"
    | "nl"
    | "nlRegen"
    | "hpRegen"
    | "damageReduction"
    | "armorPenetration";

export type PrimaryAttributeKey = Extract<StatKey, "strength" | "technique" | "agility" | "rootBone" | "innerBreath" | "willpower">;

export type PanelStats = Partial<Record<StatKey, number>>;
export type AttributeCapStats = Partial<Record<StatKey, AttributeCapData>>;
export type AttributeConversionRatios = Record<PrimaryAttributeKey, PanelStats>;

export interface AttributeCapData {
    base: number;
    growth: number;
}

export interface RoleStatConfig {
    initialAttributes: PanelStats;
    levelGrowthStats: PanelStats;
    attributeConversionRatios: AttributeConversionRatios;
    attributeCaps: AttributeCapStats;
}

export interface EquipmentData {
    name: string;
    slot: EquipmentSlot;
    mainStats: string[];
    extraStats: string[];
}

export interface AttributeScalingStat {
    target: StatKey;
    source: StatKey;
    multiplier: number;
}

export interface MoveData {
    name: string;
    kind?: MoveKind;
    detail: string;
    practiceCost: number;
    unlockLevel?: number;
}

export interface SkillData {
    name: string;
    category: SkillCategory;
    baseStats: string[];
    baseStatCoefficients?: PanelStats;
    scalingStats?: AttributeScalingStat[];
    moves: MoveData[];
}

export interface SkillProgress {
    level: number;
    layer: number;
    breakthroughRemainingSeconds: number;
}

export interface RoleData {
    name: string;
    avatarColor: string;
    imageSrc?: string;
}
