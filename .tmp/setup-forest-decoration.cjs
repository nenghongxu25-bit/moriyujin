const fs = require('fs'), crypto = require('crypto'), assert = require('node:assert/strict');
const path = 'assets/scenes/forest.ls';
const before = fs.readFileSync(path, 'utf8'), scene = JSON.parse(before);
const backup = `backups/forest-decoration-layers-${Date.now()}`;
fs.mkdirSync(backup, {recursive:true}); fs.writeFileSync(`${backup}/forest.ls`, before);
const area = scene._$child.find(n => n.name === 'Area2D');
const actor = area._$child.find(n => n.name === 'ActorLayer');
const ground = area._$child.find(n => n.name === 'GroundDecorLayer');
const roof = area._$child.find(n => n.name === 'RoofLayer');
function folder(parent, name, zOrder=0) {
  parent._$child ||= [];
  if (!parent._$child.some(n => n.name === name)) parent._$child.push({_$id:crypto.randomBytes(6).toString('hex'), _$type:'Sprite', name, x:0,y:0,zOrder});
}
folder(ground, '地表装饰_落叶苔藓碎石', -20);
folder(ground, '地表痕迹_车辙血迹', -10);
folder(actor, '可穿过装饰_草丛芦苇');
folder(actor, '阻挡装饰_树木岩壁路障');
folder(actor, '交互装饰_箱子设备');
folder(roof, '前景装饰_始终遮住人物');
const groups = actor._$comp.find(c => c._$type === 'b12949e1-407e-4c07-8171-35559e231554');
groups.groupNames = [...new Set([...groups.groupNames.split(','),'可穿过装饰_草丛芦苇','阻挡装饰_树木岩壁路障','交互装饰_箱子设备'])].join(',');
// Assert every pre-existing node and its data remains intact except the augmented containers.
function index(n,m=new Map()){if(n._$id)m.set(n._$id,n);for(const c of n._$child||[])index(c,m);return m;}
const oldIndex=index(JSON.parse(before)), newIndex=index(scene);
for(const [id,n] of oldIndex){const now=newIndex.get(id);assert.ok(now);const a={...n},b={...now};delete a._$child;delete b._$child;if(id===actor._$id){delete a._$comp;delete b._$comp;}assert.deepEqual(a,b);}
fs.writeFileSync(path, JSON.stringify(scene,null,2)+'\n');
const dir='assets/prefab/forest-decoration';fs.mkdirSync(dir,{recursive:true});
function prefab(name,asset,w,h,groundY,block){
 const id=crypto.randomBytes(6).toString('hex'), imageId=crypto.randomBytes(6).toString('hex');
 const uuid=JSON.parse(fs.readFileSync(`assets/decorate/forest/expansion-v1/${asset}.png.meta`,'utf8')).uuid;
 const node={_$ver:1,_$id:id,_$type:'Sprite',name,width:w,height:h,pivotX:w/2,pivotY:groundY};
 if(groundY){node._$comp=[{_$type:'1806c38c-ebc3-45d1-a8a0-322ed94be4cb',scriptPath:'../../../src/systems/DepthSortable.ts',groundY},{_$type:'ad602582-0a8d-4d34-8573-3cab8b47a2b0',scriptPath:'../../../src/systems/ImageDepthOccluder.ts',imageNode:{_$ref:imageId}}];}
 if(block)node._$comp.push({_$type:'20c26d35-af30-488e-9ed0-20b58656a0cb',scriptPath:'../../../src/systems/DepthObstacle.ts',blockX:block[0],blockY:block[1],blockWidth:block[2],blockHeight:block[3]});
 node._$child=[{_$id:imageId,_$type:'Sprite',name:'图片_可替换',width:w,height:h,texture:{_$uuid:uuid,_$type:'Texture'}}];
 fs.writeFileSync(`${dir}/${name}.lh`,JSON.stringify(node,null,2)+'\n');
 if(!fs.existsSync(`${dir}/${name}.lh.meta`))fs.writeFileSync(`${dir}/${name}.lh.meta`,JSON.stringify({uuid:crypto.randomUUID()},null,2));
}
prefab('阻挡_松树','forest-crooked-pine-v1',192,288,266,[77,254,38,20]);
prefab('阻挡_岩壁','forest-rock-cliff-v1',360,180,148,[30,124,300,32]);
prefab('可穿过_灌木','forest-sparse-shrub-v1',192,192,174);
prefab('地表_落叶','forest-needle-leaf-litter-v1',192,128,0);
console.log(`Added decoration folders and 4 prefabs; preserved ${oldIndex.size} existing node records. Backup: ${backup}`);
