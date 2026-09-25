// Prepare requests only; actual scene writes go through MCP.
const fs = require('fs'), crypto = require('crypto');
const dir = '.tmp/actor-groups'; fs.mkdirSync(dir, {recursive:true});
const requests = [];
for (const scene of ['city','forest']) {
 const file = `assets/scenes/${scene}.ls`, original=fs.readFileSync(file,'utf8');
 const backup=`${dir}/${scene}-before.json`;
 if(fs.existsSync(backup)) throw Error('Backup already exists: '+backup);
 fs.writeFileSync(backup,original);
 const root=JSON.parse(original), actor=root._$child.find(n=>n.name==='Area2D')._$child.find(n=>n.name==='ActorLayer');
 const old=actor._$child, groups=new Map();
 function category(n) {
  const name=(n.name||'').toLowerCase();
  if(name.includes('player')) return 'Characters';
  if(name.startsWith('citywall')) return 'Walls';
  if(name.includes('zombie')) return 'Enemies';
  if(name.includes('pine')) return 'Pines';
  if(name.includes('oak')) return 'Oaks';
  if(name.includes('stones')) return 'Rocks';
  if(name.includes('branches')) return 'Branches';
  if(name.includes('bush')) return 'Bushes';
  if(name.includes('mound')) return 'Mounds';
  if(name.includes('laeve')||name.includes('leave')) return 'Devices';
  if(n._$prefab && scene==='city') return 'Containers';
  return 'Props';
 }
 for(const n of old) {
  const name=category(n);
  if(!groups.has(name)) groups.set(name,{'_$id':crypto.createHash('sha256').update(scene+':actor-group:'+name).digest('hex').slice(0,12),'_$type':'Sprite',name,'_$child':[]});
  groups.get(name)._$child.push(n);
 }
 actor._$child=[...groups.values()];
 actor._$comp=[...(actor._$comp||[]),{'_$type':JSON.parse(fs.readFileSync('src/systems/ActorLayerGroups.ts.meta','utf8')).uuid,groupNames:[...groups.keys()].join(',')}];
 // No changes to any entity or its prefab overrides, including coordinates.
 const flattened=actor._$child.flatMap(g=>g._$child);
 for(const n of old) if(!flattened.some(x=>JSON.stringify(x)===JSON.stringify(n))) throw Error('Entity changed');
 requests.push({name:'Laya_EditAsset',arguments:{file_path:file,ops:[{op:'replace',path:'',value:JSON.stringify(root)}]}});
 console.log(scene,JSON.stringify([...groups.values()].map(g=>[g.name,g._$child.length])));
}
fs.writeFileSync(`${dir}/requests.json`,JSON.stringify(requests));
