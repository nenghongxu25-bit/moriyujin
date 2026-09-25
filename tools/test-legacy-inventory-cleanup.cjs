const fs = require('fs'), assert = require('assert'), ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, experimentalDecorators: true }
}).outputText, file);
const storage = new Map();
global.localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) };
const { DataManager } = require('../src/systems/datamanager.ts');
const dm = DataManager.getInstance();
for (const name of ['weapons','foods','materials','medicines','misc'])
    dm.items.registerItemTable(JSON.parse(fs.readFileSync(`${__dirname}/../assets/config/items/${name}.json`, 'utf8')));
const gun = {itemId:'akm',name:'AKM',count:1,gridWidth:2,gridHeight:1,rotated:true,gridVersion:2};
const retired = {itemId:'bandage',name:'Bandage',count:3};
const keys = ['laya_test_base_inventory_v1','laya_test_warehouse_inventory_v1','laya_test_quick_slots_v1','laya_test_equipment_v1'];
const originals = keys.map((k,i) => i === 3 ? {weapon:gun,helmet:retired} : [null,gun,retired,{itemId:'unknown_retired',name:'Old',count:1}]);
keys.forEach((k,i)=>dm.save.saveJson(k,originals[i]));
dm.save.saveJson('laya_test_player_stats_v1',{health:73});
dm.inventory.loadPersistedInventories();
dm.inventory.enterScene('forest');
dm.cleanRetiredInventory();
keys.forEach((k,i)=>{
    const result=dm.save.loadJson(k);
    // Grid migration may normalize the bag; other saves must preserve weapon details exactly.
    if(i===3)assert.deepStrictEqual(result,{weapon:gun,helmet:null});
    else if(i!==0)assert.deepStrictEqual(result,[null,gun,null,null]);
    assert(Object.values(result).filter(Boolean).every(x=>x.itemId==='akm'));
    assert(dm.save.loadJson(k+'_before_retired_cleanup_20260921'));
});
assert(dm.inventory.getInventorySnapshot().filter(Boolean).every(x=>x.itemId==='akm'));
dm.inventory.enterScene('base');
assert(dm.inventory.getInventorySnapshot().filter(Boolean).every(x=>x.itemId==='akm'));
const backups=keys.map(k=>storage.get(k+'_before_retired_cleanup_20260921'));
dm.cleanRetiredInventory();
keys.forEach((k,i)=>dm.save.saveJson(k,originals[i])); // Simulate an old cloud save imported again.
dm.cleanRetiredInventory();
keys.forEach((k,i)=>{
    assert.equal(storage.get(k+'_before_retired_cleanup_20260921'),backups[i]);
    assert(Object.values(dm.save.loadJson(k)).filter(Boolean).every(x=>x.itemId==='akm'));
});
assert.deepStrictEqual(dm.save.loadJson('laya_test_player_stats_v1'),{health:73});
console.log('PASS: four save slots cleaned, weapons preserved, backups stable, repeat/cloud cleanup, cached base/run cleanup, stats untouched');
