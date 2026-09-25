const fs = require('fs'), assert = require('assert'), ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, experimentalDecorators: true }
}).outputText, file);
const storage = new Map();
global.localStorage = { getItem: k => storage.get(k) || null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) };
const { DataManager } = require('../src/systems/datamanager.ts');
const { CraftingManager } = require('../src/systems/data/CraftingManager.ts');
const { QuickMakeManager } = require('../src/systems/data/QuickMakeManager.ts');
const dm = DataManager.getInstance();
const tables = ['weapons','foods','materials','medicines','misc'].map(name => JSON.parse(fs.readFileSync(`${__dirname}/../assets/config/items/${name}.json`, 'utf8')));
tables.forEach(table => dm.items.registerItemTable(table));
for (const table of tables) for (const item of table.items) {
    assert.equal(dm.isItemEnabled(item.id), table.category === 'weapons', item.id);
    assert(dm.resolveItemMeta(item.id), 'Keep metadata for saved items');
}
assert.equal(dm.isItemEnabled('unknown'), false);
const crafting = new CraftingManager(), quick = new QuickMakeManager();
for (const recipe of crafting.recipes) assert.equal(crafting.getRecipe(recipe.id), null);
for (const station of ['campfire','pengrenji','processing','equipment','manufacture','medicine','advance']) assert.deepStrictEqual(crafting.getRecipesByStation(station), []);
for (const recipe of quick.recipes) assert.equal(quick.getRecipe(recipe.id), null);
assert.deepStrictEqual(quick.getRecipes(), []);
dm.inventory.loadPersistedInventories();
const mixed = [{ itemId: 'akm', count: 1 }, { itemId: 'bandage', count: 2 }];
assert.equal(dm.grantItemsToActiveIfSpace(mixed), false);
assert.equal(dm.grantItemsToWarehouse(mixed), false);
assert.equal(dm.getInventorySnapshot().filter(Boolean).length, 0);
assert.equal(dm.getWarehouseSnapshot().filter(Boolean).length, 0);
dm.grantItemsToActive(mixed);
assert.deepStrictEqual(dm.getInventorySnapshot().filter(Boolean).map(i => i.itemId), ['akm']);
assert.equal(dm.transferLooseItemToActive({itemId:'bandage',count:1}), false);
assert.equal(dm.canUseItem('bandage'), false);
assert.equal(dm.canAssignItemToQuickSlot('bandage'), false);
assert.equal(dm.canEquipItemToSlot('laoshigangkui','helmet'), false);
assert.equal(dm.canEquipItemToSlot('akm','weapon'), true);
dm.equippedItems.helmet = {itemId:'laoshigangkui',name:'helmet',count:1};
assert.equal(dm.getEquipmentDefenseBonus(), 0);
const drop = id => ({itemId:id,label:id,minCount:1,maxCount:1,probability:1});
assert.deepStrictEqual(dm.rollHarvestDrops('test',[drop('bandage'),drop('akm')]).map(i=>i.itemId), ['akm']);
const saved = [{itemId:'bandage',name:'bandage',count:3}];
dm.save.saveJson('laya_test_quick_slots_v1', saved);
dm.quickSlots.load();dm.quickSlots.clearMissingItems();
assert.equal(dm.getQuickSlotItems()[0].count,3);
assert.equal(dm.activateQuickSlot(0).success,false);
assert.equal(dm.getQuickSlotItems()[0].count,3);
assert.deepStrictEqual(dm.save.loadJson('laya_test_quick_slots_v1'), saved);
console.log(`PASS: ${tables.reduce((n,t)=>n+t.items.length,0)} item flags, all recipes disabled, atomic grant rejection, weapon grants/equipment, drops, disabled effects, saved quick slots preserved`);
