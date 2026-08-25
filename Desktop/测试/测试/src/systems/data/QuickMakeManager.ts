import type { CraftingIngredient, CraftingOutput } from "./CraftingManager";

export interface QuickMakeRecipeDefinition {
    id: string;
    name: string;
    inputs: CraftingIngredient[];
    output: CraftingOutput;
}

export class QuickMakeManager {
    private readonly recipes: QuickMakeRecipeDefinition[] = this.createDefaultRecipes();

    public getRecipes(): QuickMakeRecipeDefinition[] {
        return this.recipes.map((recipe) => this.cloneRecipe(recipe));
    }

    public getRecipe(recipeId: string): QuickMakeRecipeDefinition | null {
        const recipe = this.recipes.find((item) => item.id === recipeId) || null;
        return recipe ? this.cloneRecipe(recipe) : null;
    }

    private cloneRecipe(recipe: QuickMakeRecipeDefinition): QuickMakeRecipeDefinition {
        return {
            ...recipe,
            inputs: recipe.inputs.map((item) => ({ ...item })),
            output: { ...recipe.output },
        };
    }

    private createDefaultRecipes(): QuickMakeRecipeDefinition[] {
        return [
            {
                id: "quick_make_wood_club",
                name: "\u7b80\u6613\u6728\u68d2",
                inputs: [{ itemId: "wood", name: "\u6728\u5934", count: 3, icon: "atlas/picture/items/materials/basic_materials/wood.png" }],
                output: { itemId: "wood_club", name: "\u7b80\u6613\u6728\u68d2", count: 1, icon: "atlas/picture/items/weapons/melees/wood_club.png" },
            },
            {
                id: "quick_make_bandage",
                name: "\u7ef7\u5e26",
                inputs: [
                    { itemId: "grass", name: "\u8349", count: 3, icon: "atlas/picture/items/materials/basic_materials/grass.png" },
                    { itemId: "shupi", name: "\u6811\u76ae", count: 1, icon: "atlas/picture/items/materials/basic_materials/shupi.png" },
                ],
                output: { itemId: "bandage", name: "\u7ef7\u5e26", count: 1, icon: "atlas/picture/items/medicines/bandage.png" },
            },
        ];
    }
}
