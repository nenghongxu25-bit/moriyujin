const fs=require('fs'),path=require('path');
const audit=JSON.parse(fs.readFileSync('.tmp/image-audit.json','utf8'));
const byPath=new Map(audit.images.map(i=>[i.path,i]));
const plan={version:1,backup:'.tmp/image-cleanup-backup-20260919',duplicates:[],moves:[],replacements:[],iconAliases:{},notes:[]};
const selected=[
 ['assets/atlas/picture/interacts/containers/wood_box.png',null],
 ['assets/atlas/picture/items/armors/bodies/G6taociban.png','armor-plate.png'],
 ['assets/atlas/picture/items/armors/heads/G6.png','helmet.png'],
 ['assets/atlas/picture/items/foods/eats/fried_chips.png','cooked-food.png'],
 ['assets/atlas/picture/items/materials/advanced_materials/Ti.png','metal-ingot.png'],
 ['assets/atlas/picture/items/materials/basic_materials/wood.png','basic-material.png']
];
for(const [keep,shared] of selected){
 const image=byPath.get(keep), group=audit.duplicateGroups.find(g=>g.some(i=>i.path===keep));
 const dest=shared?'assets/atlas/picture/items/shared/'+shared:keep;
 if(dest!==keep)plan.moves.push({from:keep,to:dest,uuid:image.uuid,hash:image.hash,reason:'shared-placeholder'});
 for(const other of group){
   for(const old of [other.path,other.path.slice(7),'res://'+other.path.slice(7),'res://'+other.uuid]){
     if(old!=='res://'+image.uuid)plan.iconAliases[old]='res://'+image.uuid;
   }
   if(other.path===keep)continue;
   if(JSON.stringify(other.importer)!==JSON.stringify(image.importer))throw Error('Importer mismatch');
   plan.duplicates.push({from:other.path,keep:dest,oldUuid:other.uuid,newUuid:image.uuid,hash:other.hash,bytes:other.bytes});
   plan.replacements.push([other.uuid,image.uuid],[other.path.slice(7),dest.slice(7)]);
 }
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=dir+'/'+e.name;return e.isDirectory()?walk(p):[p];});}
const already=new Set([...plan.duplicates.map(i=>i.from),...plan.moves.map(i=>i.from)]);
for(const p of walk('assets/atlas/picture/draw').filter(p=>!p.endsWith('.meta'))){
 const rel=p.slice('assets/atlas/picture/draw/'.length), image=byPath.get(p);
 let to;
 if(rel.startsWith('forest-'))to='art-library/images/environment/forest/'+rel;
 else if(/^(campfire|torch)/.test(rel))to='assets/atlas/picture/effects/fire/'+rel;
 else if(rel.startsWith('snow'))to='assets/atlas/picture/effects/weather/'+rel;
 else to='art-library/images/environment/city/'+rel;
 if(to.startsWith('art-library')&&image&&(image.refs.length||image.nameRefs.length))throw Error('Unexpected referenced reserve '+p);
 plan.moves.push({from:p,to,uuid:image?.uuid,hash:image?.hash,reason:to.startsWith('art-library')?'unreferenced-reserve':'classification'});already.add(p);
}
for(const i of audit.images){
 if(already.has(i.path)||i.path.startsWith('assets/spine/')||i.path.startsWith('assets/tileset/'))continue;
 let to;
 if(i.path.startsWith('assets/picture/draw/')){
   const category=/wood_box/.test(i.path)?'containers':'environment/city';
   to=(i.refs.length?'assets/atlas/picture/':'art-library/images/')+category+'/'+path.basename(i.path);
 } else if(/^assets\/atlas\/picture\/(fire-light|night-vision|room-soft)/.test(i.path)){
   to='assets/atlas/picture/effects/lighting/'+path.basename(i.path);
 } else if(i.path.startsWith('assets/forest-preview/')){
   to='art-library/images/previews/'+path.basename(i.path);
 } else if(!i.refs.length&&!i.nameRefs.length&&!i.path.includes('/interacts/')&&!i.path.includes('/items/')&&!i.path.startsWith('assets/xuliezhen/')){
   to='art-library/images/'+i.path.replace('assets/atlas/picture/','');
 }
 if(to){plan.moves.push({from:i.path,to,uuid:i.uuid,hash:i.hash,reason:to.startsWith('art-library')?'unreferenced-reserve':'classification'});}
}
for(const m of plan.moves){if(m.from.startsWith('assets/')&&m.to.startsWith('assets/'))plan.replacements.push([m.from.slice(7),m.to.slice(7)]);}
for(const m of plan.moves){if(fs.existsSync(m.to))throw Error('Target exists '+m.to);}
if(new Set(plan.moves.map(m=>m.to)).size!==plan.moves.length)throw Error('Duplicate targets');
plan.notes.push('Spine source/export bundles and tilesets retained intact; no unreferenced inference used to delete them.','Unreferenced artwork moved to art-library, not permanently erased.','Exact duplicate item placeholders merged with old-save icon compatibility.');
fs.writeFileSync('.tmp/image-cleanup-plan.json',JSON.stringify(plan,null,2));
console.log(JSON.stringify({duplicates:plan.duplicates.length,duplicateBytes:plan.duplicates.reduce((a,b)=>a+b.bytes,0),moves:plan.moves.map(m=>({from:m.from,to:m.to})),aliasCount:Object.keys(plan.iconAliases).length},null,2));
