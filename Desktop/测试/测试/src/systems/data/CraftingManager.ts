export type CraftingStationId =
    | "campfire"
    | "pengrenji"
    | "processing"
    | "equipment"
    | "manufacture"
    | "medicine"
    | "advance";

export interface CraftingIngredient {
    itemId: string;
    name?: string;
    count: number;
    icon?: string;
}

export interface CraftingOutput {
    itemId: string;
    name?: string;
    count: number;
    icon?: string;
}

export interface CraftingRecipeDefinition {
    id: string;
    station: CraftingStationId;
    name: string;
    inputs: CraftingIngredient[];
    output: CraftingOutput;
}

export class CraftingManager {
    private readonly recipes: CraftingRecipeDefinition[] = this.createDefaultRecipes();

    public getRecipesByStation(station: CraftingStationId): CraftingRecipeDefinition[] {
        return this.recipes
            .filter((recipe) => recipe.station === station)
            .map((recipe) => this.cloneRecipe(recipe));
    }

    public getRecipe(recipeId: string): CraftingRecipeDefinition | null {
        const recipe = this.recipes.find((item) => item.id === recipeId) || null;
        return recipe ? this.cloneRecipe(recipe) : null;
    }

    private cloneRecipe(recipe: CraftingRecipeDefinition): CraftingRecipeDefinition {
        return {
            ...recipe,
            inputs: recipe.inputs.map((item) => ({ ...item })),
            output: { ...recipe.output },
        };
    }

    private createDefaultRecipes(): CraftingRecipeDefinition[] {
        return [
            {
                id: "campfire_bread",
                station: "campfire",
                name: "\u9762\u5305",
                inputs: [
                    { itemId: "wheat", name: "\u5c0f\u9ea6", count: 2, icon: "atlas/picture/items/materials/food_materials/wheat.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "bread", name: "\u9762\u5305", count: 1, icon: "atlas/picture/items/foods/eats/bread.png" },
            },
            {
                id: "campfire_grilled_fish",
                station: "campfire",
                name: "\u70e4\u9c7c",
                inputs: [
                    { itemId: "fish", name: "\u9c7c", count: 1, icon: "atlas/picture/items/materials/food_materials/fish.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "grilled_fish", name: "\u70e4\u9c7c", count: 1, icon: "atlas/picture/items/foods/eats/grilled_fish.png" },
            },
            {
                id: "campfire_grilled_mushroom",
                station: "campfire",
                name: "\u70e4\u8611\u83c7",
                inputs: [
                    { itemId: "mushroom", name: "\u8611\u83c7", count: 2, icon: "atlas/picture/items/materials/food_materials/mushroom.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "grilled_mushroom", name: "\u70e4\u8611\u83c7", count: 1, icon: "atlas/picture/items/foods/eats/grilled_mushroom.png" },
            },
            {
                id: "campfire_grilled_corn",
                station: "campfire",
                name: "\u70e4\u7389\u7c73",
                inputs: [
                    { itemId: "corn", name: "\u7389\u7c73", count: 2, icon: "atlas/picture/items/materials/food_materials/corn.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "grilled_corn", name: "\u70e4\u7389\u7c73", count: 1, icon: "atlas/picture/items/foods/eats/grilled_corn.png" },
            },
            {
                id: "campfire_grilled_potato",
                station: "campfire",
                name: "\u70e4\u571f\u8c46",
                inputs: [
                    { itemId: "potato", name: "\u571f\u8c46", count: 2, icon: "atlas/picture/items/materials/food_materials/potato.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "grilled_potato", name: "\u70e4\u571f\u8c46", count: 1, icon: "atlas/picture/items/foods/eats/grilled_potato.png" },
            },
            {
                id: "campfire_roast",
                station: "campfire",
                name: "\u70e4\u8089",
                inputs: [
                    { itemId: "meat", name: "\u751f\u8089", count: 1, icon: "atlas/picture/items/materials/food_materials/meat.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "roast", name: "\u70e4\u8089", count: 1, icon: "atlas/picture/items/foods/eats/roast.png" },
            },
            {
                id: "campfire_rice",
                station: "campfire",
                name: "\u7c73\u996d",
                inputs: [
                    { itemId: "rice_grain", name: "\u6c34\u7a3b", count: 2, icon: "atlas/picture/items/materials/food_materials/rice grain.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "rice", name: "\u7c73\u996d", count: 1, icon: "atlas/picture/items/foods/eats/rice.png" },
            },
            {
                id: "campfire_juice",
                station: "campfire",
                name: "\u679c\u6c41",
                inputs: [{ itemId: "food_material_01", name: "\u6d46\u679c", count: 4, icon: "atlas/picture/items/materials/food_materials/fruit.png" }],
                output: { itemId: "juice", name: "\u679c\u6c41", count: 1, icon: "atlas/picture/items/foods/drinks/juice.png" },
            },
            {
                id: "campfire_mushroom_soup",
                station: "campfire",
                name: "\u8611\u83c7\u6c64",
                inputs: [
                    { itemId: "mushroom", name: "\u8611\u83c7", count: 2, icon: "atlas/picture/items/materials/food_materials/mushroom.png" },
                    { itemId: "water", name: "\u6c34", count: 1, icon: "atlas/picture/items/foods/drinks/water.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                    { itemId: "seasoning", name: "\u8c03\u6599", count: 1, icon: "atlas/picture/items/materials/food_materials/seasoning.png" },
                ],
                output: { itemId: "mushroom_soup", name: "\u8611\u83c7\u6c64", count: 1, icon: "atlas/picture/items/foods/eats/mushroom_soup.png" },
            },
            {
                id: "campfire_fried_chips",
                station: "campfire",
                name: "\u85af\u6761",
                inputs: [
                    { itemId: "potato", name: "\u571f\u8c46", count: 2, icon: "atlas/picture/items/materials/food_materials/potato.png" },
                    { itemId: "seasoning", name: "\u8c03\u6599", count: 1, icon: "atlas/picture/items/materials/food_materials/seasoning.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "fried_chips", name: "\u85af\u6761", count: 1, icon: "atlas/picture/items/foods/eats/fried_chips.png" },
            },
            {
                id: "campfire_gujiao",
                station: "campfire",
                name: "\u9aa8\u80f6",
                inputs: [
                    { itemId: "shougu", name: "\u517d\u9aa8", count: 2, icon: "atlas/picture/items/materials/basic_materials/shougu.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "gujiao", name: "\u9aa8\u80f6", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gujiao.png" },
            },
            {
                id: "processing_leather",
                station: "processing",
                name: "\u76ae\u9769",
                inputs: [
                    { itemId: "hide", name: "\u517d\u76ae", count: 2, icon: "atlas/picture/items/materials/basic_materials/hide.png" },
                    { itemId: "shupi", name: "\u6811\u76ae", count: 1, icon: "atlas/picture/items/materials/basic_materials/shupi.png" },
                ],
                output: { itemId: "leather", name: "\u76ae\u9769", count: 1, icon: "atlas/picture/items/materials/advanced_materials/leather.png" },
            },
            {
                id: "processing_honey",
                station: "processing",
                name: "\u8702\u871c",
                inputs: [
                    { itemId: "hua", name: "\u82b1", count: 3, icon: "atlas/picture/items/materials/food_materials/hua.png" },
                ],
                output: { itemId: "fengmi", name: "\u8702\u871c", count: 1, icon: "atlas/picture/items/materials/food_materials/fengmi.png" },
            },
            {
                id: "processing_rope",
                station: "processing",
                name: "\u7ef3\u5b50",
                inputs: [
                    { itemId: "grass", name: "\u8349", count: 2, icon: "atlas/picture/items/materials/basic_materials/grass.png" },
                ],
                output: { itemId: "shengzi", name: "\u7ef3\u5b50", count: 1, icon: "atlas/picture/items/materials/advanced_materials/shengzi.png" },
            },
            {
                id: "processing_stone_block",
                station: "processing",
                name: "\u77f3\u5757",
                inputs: [{ itemId: "common_material_02", name: "\u77f3\u5934", count: 2, icon: "atlas/picture/items/materials/basic_materials/shitou.png" }],
                output: { itemId: "shikuai", name: "\u77f3\u5757", count: 1, icon: "atlas/picture/items/materials/advanced_materials/shikuai.png" },
            },
            {
                id: "processing_plank",
                station: "processing",
                name: "\u6728\u677f",
                inputs: [{ itemId: "wood", name: "\u6728\u5934", count: 2, icon: "atlas/picture/items/materials/basic_materials/wood.png" }],
                output: { itemId: "muban", name: "\u6728\u677f", count: 1, icon: "atlas/picture/items/materials/advanced_materials/muban.png" },
            },
            {
                id: "processing_iron_ingot",
                station: "processing",
                name: "\u94c1\u952d",
                inputs: [{ itemId: "iron", name: "\u94c1", count: 2, icon: "atlas/picture/items/materials/basic_materials/iron.png" }],
                output: { itemId: "tieding", name: "\u94c1\u952d", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
            },
            {
                id: "processing_copper_ingot",
                station: "processing",
                name: "\u94dc\u952d",
                inputs: [{ itemId: "copper", name: "\u94dc", count: 2, icon: "atlas/picture/items/materials/basic_materials/copper.png" }],
                output: { itemId: "tongding", name: "\u94dc\u952d", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tongding.png" },
            },
            {
                id: "equipment_knife",
                station: "equipment",
                name: "\u5c0f\u5200",
                inputs: [
                    { itemId: "tieding", name: "\u94c1\u952d", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
                    { itemId: "muban", name: "\u6728\u677f", count: 1, icon: "atlas/picture/items/materials/advanced_materials/muban.png" },
                ],
                output: { itemId: "knife", name: "\u5c0f\u5200", count: 1, icon: "atlas/picture/items/weapons/melees/knife.png" },
            },
            {
                id: "equipment_baseket_bat",
                station: "equipment",
                name: "\u68d2\u7403\u68cd",
                inputs: [
                    { itemId: "yingmu", name: "\u786c\u6728", count: 3, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
                    { itemId: "gujiao", name: "\u9aa8\u80f6", count: 2, icon: "atlas/picture/items/materials/advanced_materials/gujiao.png" },
                ],
                output: { itemId: "baseket_bat", name: "\u68d2\u7403\u68cd", count: 1, icon: "atlas/picture/items/weapons/melees/baseket_bat.png" },
            },
            {
                id: "equipment_qiaogun",
                station: "equipment",
                name: "\u64ac\u68cd",
                inputs: [{ itemId: "tieding", name: "\u94c1\u952d", count: 4, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" }],
                output: { itemId: "qiaogun", name: "\u64ac\u68cd", count: 1, icon: "atlas/picture/items/weapons/melees/qiaogun.png" },
            },
            {
                id: "equipment_langyabang",
                station: "equipment",
                name: "\u72fc\u7259\u68d2",
                inputs: [
                    { itemId: "nail", name: "\u94c1\u9489", count: 2, icon: "atlas/picture/items/materials/basic_materials/nail.png" },
                    { itemId: "yingmu", name: "\u786c\u6728", count: 3, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
                    { itemId: "gujiao", name: "\u9aa8\u80f6", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gujiao.png" },
                ],
                output: { itemId: "langyabang", name: "\u72fc\u7259\u68d2", count: 1, icon: "atlas/picture/items/weapons/melees/langyabang.png" },
            },
            {
                id: "equipment_cleaver",
                station: "equipment",
                name: "\u83dc\u5200",
                inputs: [
                    { itemId: "tieding", name: "\u94c1\u952d", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
                    { itemId: "yingmu", name: "\u786c\u6728", count: 1, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "cleaver", name: "\u83dc\u5200", count: 1, icon: "atlas/picture/items/weapons/melees/cleaver.png" },
            },
            {
                id: "equipment_machete",
                station: "equipment",
                name: "\u5927\u780d\u5200",
                inputs: [
                    { itemId: "tieding", name: "\u94c1\u952d", count: 5, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
                    { itemId: "yingmu", name: "\u786c\u6728", count: 2, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 2, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "machete", name: "\u5927\u780d\u5200", count: 1, icon: "atlas/picture/items/weapons/melees/machete.png" },
            },
            {
                id: "equipment_long_knife",
                station: "equipment",
                name: "\u957f\u5200",
                inputs: [
                    { itemId: "tieding", name: "\u94c1\u952d", count: 5, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
                    { itemId: "yingmu", name: "\u786c\u6728", count: 1, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 2, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "long_knife", name: "\u957f\u5200", count: 1, icon: "atlas/picture/items/weapons/melees/long_knife.png" },
            },
            {
                id: "armor_old_steel_helmet",
                station: "pengrenji",
                name: "\u8001\u5f0f\u94a2\u76d4",
                inputs: [
                    { itemId: "tieding", name: "\u94c1\u952d", count: 5, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                    { itemId: "cotton", name: "\u68c9\u82b1", count: 2, icon: "atlas/picture/items/materials/basic_materials/cotton.png" },
                ],
                output: { itemId: "laoshigangkui", name: "\u8001\u5f0f\u94a2\u76d4", count: 1, icon: "atlas/picture/items/armors/heads/laoshigangkui.png" },
            },
            {
                id: "armor_k1_helmet",
                station: "pengrenji",
                name: "K1",
                inputs: [
                    { itemId: "gaofenzicailiao", name: "\u9ad8\u5206\u5b50\u6750\u6599", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
                    { itemId: "tezhonghejin", name: "\u7279\u79cd\u5408\u91d1", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6\u6c34", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "k1", name: "K1", count: 1, icon: "atlas/picture/items/armors/heads/k1.png" },
            },
            {
                id: "armor_g6_helmet",
                station: "pengrenji",
                name: "G6",
                inputs: [
                    { itemId: "tezhonghejin", name: "\u7279\u79cd\u5408\u91d1", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
                    { itemId: "tieding", name: "\u94c1\u952d", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
                    { itemId: "gaofenzicailiao", name: "\u9ad8\u5206\u5b50\u6750\u6599", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "G6", name: "G6", count: 1, icon: "atlas/picture/items/armors/heads/G6.png" },
            },
            {
                id: "armor_ce3_helmet",
                station: "pengrenji",
                name: "CE3",
                inputs: [
                    { itemId: "taihejin", name: "\u949b\u5408\u91d1", count: 1, icon: "atlas/picture/items/materials/advanced_materials/Ti.png" },
                    { itemId: "tezhonghejin", name: "\u7279\u79cd\u5408\u91d1", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
                    { itemId: "gaofenzicailiao", name: "\u9ad8\u5206\u5b50\u6750\u6599", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 5, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "CE3", name: "CE3", count: 1, icon: "atlas/picture/items/armors/heads/CE3.png" },
            },
            {
                id: "armor_k1_insert_plate",
                station: "pengrenji",
                name: "K1\u63d2\u677f",
                inputs: [
                    { itemId: "gaofenzicailiao", name: "\u9ad8\u5206\u5b50\u6750\u6599", count: 5, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
                    { itemId: "tezhonghejin", name: "\u7279\u79cd\u5408\u91d1", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "k1chaban", name: "K1\u63d2\u677f", count: 1, icon: "atlas/picture/items/armors/bodies/k1chaban.png" },
            },
            {
                id: "armor_fn_steel_plate",
                station: "pengrenji",
                name: "FN\u94a2\u677f",
                inputs: [
                    { itemId: "tezhonggang", name: "\u7279\u79cd\u94a2", count: 4, icon: "atlas/picture/items/materials/advanced_materials/Wuding.png" },
                    { itemId: "gaofenzicailiao", name: "\u9ad8\u5206\u5b50\u6750\u6599", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6\u6c34", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "FNgangban", name: "FN\u94a2\u677f", count: 1, icon: "atlas/picture/items/armors/bodies/FNgangban.png" },
            },
            {
                id: "armor_g6_ceramic_plate",
                station: "pengrenji",
                name: "G6\u9676\u74f7\u677f",
                inputs: [
                    { itemId: "junyongcaoci", name: "\u519b\u7528\u9676\u74f7", count: 2, icon: "atlas/picture/items/materials/advanced_materials/junyongcaoci.png" },
                    { itemId: "tezhonghejin", name: "\u7279\u79cd\u5408\u91d1", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
                    { itemId: "gaofenzicailiao", name: "\u9ad8\u5206\u5b50\u6750\u6599", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
                    { itemId: "gongyejiao", name: "\u5de5\u4e1a\u80f6", count: 6, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
                ],
                output: { itemId: "G6taociban", name: "G6\u9676\u74f7\u677f", count: 1, icon: "atlas/picture/items/armors/bodies/G6taociban.png" },
            },
            {
                id: "campfire_fried_egg",
                station: "campfire",
                name: "\u8377\u5305\u86cb",
                inputs: [
                    { itemId: "egg", name: "\u9e21\u86cb", count: 1, icon: "atlas/picture/items/materials/food_materials/egg.png" },
                    { itemId: "wood", name: "\u6728\u5934", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                ],
                output: { itemId: "hebaodan", name: "\u8377\u5305\u86cb", count: 1, icon: "atlas/picture/items/foods/eats/hebaodan.png" },
            },
            {
                id: "processing_gunpowder",
                station: "processing",
                name: "\u706b\u836f",
                inputs: [
                    { itemId: "xiaoshi", name: "\u785d\u77f3", count: 1, icon: "atlas/picture/items/materials/basic_materials/xiaoshi.png" },
                    { itemId: "liuhuang", name: "\u786b", count: 1, icon: "atlas/picture/items/materials/basic_materials/liuhuang.png" },
                    { itemId: "mutan", name: "\u78b3", count: 1, icon: "atlas/picture/items/materials/basic_materials/mutan.png" },
                ],
                output: { itemId: "huoyao", name: "\u706b\u836f", count: 1, icon: "atlas/picture/items/materials/advanced_materials/huoyao.png" },
            },
            {
                id: "equipment_wood_club",
                station: "equipment",
                name: "\u6728\u68d2",
                inputs: [
                    { itemId: "wood", name: "\u6728\u5934", count: 3, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                    { itemId: "shengzi", name: "\u7ef3\u5b50", count: 1, icon: "atlas/picture/items/materials/advanced_materials/shengzi.png" },
                ],
                output: { itemId: "wood_club", name: "\u6728\u68d2", count: 1, icon: "atlas/picture/items/weapons/melees/wood_club.png" },
            },        ];
    }
}
