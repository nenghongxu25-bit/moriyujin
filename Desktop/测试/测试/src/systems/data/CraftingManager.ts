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
                id: "campfire_grilled_mushroom",
                station: "campfire",
                name: "\u70e4\u8611\u83c7",
                inputs: [{ itemId: "food_material_01", name: "\u98df\u6750", count: 2, icon: "atlas/picture/items/materials/food_materials/fruit.png" }],
                output: { itemId: "grilled_mushroom", name: "\u70e4\u8611\u83c7", count: 1, icon: "atlas/picture/items/foods/eats/grilled_mushroom.png" },
            },
            {
                id: "campfire_roast",
                station: "campfire",
                name: "\u70e4\u8089",
                inputs: [{ itemId: "food_material_01", name: "\u98df\u6750", count: 3, icon: "atlas/picture/items/materials/food_materials/fruit.png" }],
                output: { itemId: "roast", name: "\u70e4\u8089", count: 1, icon: "atlas/picture/items/foods/eats/roast.png" },
            },
            {
                id: "pengrenji_mushroom_soup",
                station: "pengrenji",
                name: "\u8611\u83c7\u6c64",
                inputs: [
                    { itemId: "food_material_01", name: "\u98df\u6750", count: 2, icon: "atlas/picture/items/materials/food_materials/fruit.png" },
                    { itemId: "water", name: "\u6c34", count: 1, icon: "atlas/picture/items/foods/drinks/water.png" },
                ],
                output: { itemId: "mushroom_soup", name: "\u8611\u83c7\u6c64", count: 1, icon: "atlas/picture/items/foods/eats/mushroom_soup.png" },
            },
            {
                id: "processing_plank",
                station: "processing",
                name: "\u6728\u677f",
                inputs: [{ itemId: "wood", name: "\u6728\u5934", count: 3, icon: "atlas/picture/items/materials/basic_materials/wood.png" }],
                output: { itemId: "base_material_10", name: "\u6728\u677f", count: 1, icon: "atlas/picture/items/materials/basic_materials/chenshuimu.png" },
            },
            {
                id: "equipment_wood_club",
                station: "equipment",
                name: "\u7b80\u6613\u6728\u68d2",
                inputs: [
                    { itemId: "wood", name: "\u6728\u5934", count: 4, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
                    { itemId: "xiaoshuzhi", name: "\u5c0f\u6811\u679d", count: 2, icon: "atlas/picture/items/materials/basic_materials/xiaoshuzhi.png" },
                ],
                output: { itemId: "wood_club", name: "\u7b80\u6613\u6728\u68d2", count: 1, icon: "atlas/picture/items/weapons/melees/wood_club.png" },
            },
            {
                id: "manufacture_bandage",
                station: "manufacture",
                name: "\u7ef7\u5e26",
                inputs: [{ itemId: "grass", name: "\u8349", count: 5, icon: "atlas/picture/items/materials/basic_materials/grass.png" }],
                output: { itemId: "bandage", name: "\u7ef7\u5e26", count: 1, icon: "atlas/picture/items/medicines/bandage.png" },
            },
            {
                id: "medicine_recovery",
                station: "medicine",
                name: "\u6062\u590d\u836f",
                inputs: [
                    { itemId: "yaocao", name: "\u836f\u8349", count: 3, icon: "atlas/picture/items/materials/basic_materials/yaocao.png" },
                    { itemId: "water", name: "\u6c34", count: 1, icon: "atlas/picture/items/foods/drinks/water.png" },
                ],
                output: { itemId: "kangfuyao", name: "\u5eb7\u590d\u836f", count: 1, icon: "atlas/picture/items/medicines/kangfuyao.png" },
            },
            {
                id: "advance_mutant_blood_2",
                station: "advance",
                name: "\u4e8c\u9636\u53d8\u5f02\u8840",
                inputs: [{ itemId: "mutant_blood_1", name: "\u4e00\u9636\u53d8\u5f02\u8840", count: 3, icon: "atlas/picture/items/misc/flood_1.png" }],
                output: { itemId: "mutant_blood_2", name: "\u4e8c\u9636\u53d8\u5f02\u8840", count: 1, icon: "atlas/picture/items/misc/flood_2.png" },
            },
        ];
    }
}
