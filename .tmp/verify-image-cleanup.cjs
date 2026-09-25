const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm'),ts=require('../node_modules/typescript');
const plan=JSON.parse(fs.readFileSync('.tmp/image-cleanup-plan.json','utf8'));
const audit=JSON.parse(fs.readFileSync('.tmp/image-audit.json','utf8'));
const errors=[];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const m of plan.moves){
 if(!fs.existsSync(m.to)){errors.push('Missing '+m.to);continue;}
 if(m.hash&&hash(m.to)!==m.hash)errors.push('Changed pixels '+m.to);
 if(m.uuid&&JSON.parse(fs.readFileSync(m.to+'.meta','utf8').replace(/^\uFEFF/,'')).uuid!==m.uuid)errors.push('UUID changed '+m.to);
 if(fs.existsSync(m.from))errors.push('Old file remains '+m.from);
}
for(const d of plan.duplicates){
 if(fs.existsSync(d.from))errors.push('Duplicate remains '+d.from);
 if(hash(d.keep)!==d.hash)errors.push('Canonical mismatch '+d.keep);
 if(hash(plan.backup+'/removed-duplicates/'+d.from)!==d.hash)errors.push('Backup mismatch '+d.from);
}
for(const i of audit.images.filter(i=>i.path.startsWith('assets/spine/')||i.path.startsWith('assets/tileset/'))){if(hash(i.path)!==i.hash)errors.push('Protected asset changed '+i.path);}
function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(['node_modules','dist'].includes(e.name))return [];const p=dir+'/'+e.name;return e.isDirectory()?walk(p):[p];});}
const sourceFiles=['assets','src','settings','tools'].flatMap(walk).filter(p=>/\.(ts|js|cjs|json|ls|lh|tres|lmat|html|py|ps1)$/.test(p)&&!p.endsWith('LegacyItemIconAliases.ts')&&!p.startsWith('assets/libs/'));
for(const p of sourceFiles){const text=fs.readFileSync(p,'utf8');for(const d of plan.duplicates)if(text.includes(d.oldUuid))errors.push('Removed UUID in '+p);for(const m of plan.moves)if(text.includes(m.from.slice(7)))errors.push('Old path in '+p+': '+m.from);}
const aliasModule={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/data/LegacyItemIconAliases.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:aliasModule.exports,module:aliasModule});
const parse=aliasModule.exports.parseSaveWithCurrentIcons;
for(const [old,current]of Object.entries(plan.iconAliases)){
 const value=parse(JSON.stringify({itemId:'sample',count:3,icon:old,nested:[null,{icon:old}],note:old}));
 if(value.icon!==current||value.nested[1].icon!==current||value.itemId!=='sample'||value.count!==3||value.note!==old)errors.push('Save alias failed '+old);
}
if(parse('{"icon":"custom.png"}').icon!=='custom.png')errors.push('Unrelated icon changed');
let writes=0;const stored=JSON.stringify([{itemId:'wood',name:'wood',count:7,icon:'res://ca45151a-5349-492c-b091-9105893d63b6'},null]);
const saveModule={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/data/SaveManager.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:saveModule.exports,module:saveModule,require:()=>aliasModule.exports,localStorage:{getItem:()=>stored,setItem:()=>writes++}});
const save=new saveModule.exports.SaveManager(),inventory=save.loadInventory('test'),generic=save.loadJson('test');
if(inventory[0].icon!=='res://b6be2b59-d955-48d3-b661-6121084b63da'||generic[0].icon!==inventory[0].icon||inventory[1]!==null||writes)errors.push('SaveManager migration failed');
const active=walk('assets').filter(p=>/\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(p));
const reserve=plan.moves.filter(m=>m.to.startsWith('art-library/'));
const result={errors,checks:{movedFiles:plan.moves.length,removedDuplicates:plan.duplicates.length,legacyAliases:Object.keys(plan.iconAliases).length,protectedImages:audit.images.filter(i=>i.path.startsWith('assets/spine/')||i.path.startsWith('assets/tileset/')).length},activeImages:active.length,activeBytes:active.reduce((n,p)=>n+fs.statSync(p).size,0),reserveImages:reserve.length,reserveBytes:reserve.reduce((n,m)=>n+fs.statSync(m.to).size,0)};
fs.writeFileSync('.tmp/image-cleanup-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
