// Prepare MCP edits only. Scene writes are performed by Laya_EditAsset.
const fs=require('fs'),crypto=require('crypto');
fs.mkdirSync('.tmp/world-layers',{recursive:true});
const requests=[];
const id=s=>crypto.createHash('sha256').update('world-layers:'+s).digest('hex').slice(0,12);
const layer=(scene,name,zOrder)=>({'_$id':id(scene+name),'_$type':'Sprite',name,zOrder,'_$child':[]});
function positions(root){const out=new Map();function walk(n,x=0,y=0){x+=n.x||0;y+=n.y||0;if(n._$id)out.set(n._$id,{x,y,prefab:n._$prefab,comp:JSON.stringify(n._$comp||[])});for(const c of n._$child||[])walk(c,x,y)}walk(root);return out;}
function plainGroup(n){return n._$type==='Sprite'&&!n._$prefab&&!(n._$comp||[]).length&&!n.texture&&!n.graphics&&n.visible!==false&&n.active!==false;}
function translated(n){for(const k of ['rotation','skewX','skewY','pivotX','pivotY','anchorX','anchorY'])if(n[k])throw Error('Non-translation group: '+n.name);for(const k of ['scaleX','scaleY'])if(n[k]!==undefined&&n[k]!==1)throw Error('Scaled group: '+n.name);}
const reports=[];
for(const scene of ['city','forest']){
 const file='assets/scenes/'+scene+'.ls',original=fs.readFileSync(file,'utf8'),root=JSON.parse(original);
 const backup='.tmp/world-layers/'+scene+'-before.json';if(fs.existsSync(backup))throw Error('Backup exists; inspect before rerunning');fs.writeFileSync(backup,original);
 const before=positions(root),world=root._$child.find(n=>n.name==='Area2D');
 const get=name=>world._$child.find(n=>n.name===name);
 const ground=get('TileMapLayer'),actors=get('ActorLayer'),interact=get('InteractLayer');
 translated(actors);ground.name='GroundLayer';ground.zOrder=0;actors.zOrder=20;
 const decor=get('DecorateLayer')||layer(scene,'GroundDecorLayer',10);decor.name='GroundDecorLayer';decor.zOrder=10;
 const roof=layer(scene,'RoofLayer',30),effects=layer(scene,'EffectLayer',50),logic=layer(scene,'LogicLayer',60);
 const lighting=get('nightlayer')||layer(scene,'LightingLayer',40);lighting.name='LightingLayer';lighting.zOrder=40;
 const blocks=(ground._$child||[]).filter(n=>n.name==='BlockLayer');
 ground._$child=ground._$child.filter(n=>n.name!=='BlockLayer');
 translated(ground);for(const b of blocks){b.x=(b.x||0)+(ground.x||0);b.y=(b.y||0)+(ground.y||0);logic._$child.push(b);}
 // Flatten only empty organizational Sprite groups; prefab internals stay intact.
 let promoted=0;
 function collect(group,px,py,output,retain){
  translated(group);const gx=px+(group.x||0),gy=py+(group.y||0),old=group._$child||[];group._$child=[];
  for(const n of old){if(plainGroup(n)){collect(n,gx,gy,output,retain);group._$child.push(n);}else{
    n.x=(n.x||0)+gx-(actors.x||0);n.y=(n.y||0)+gy-(actors.y||0);output.push(n);promoted++;
  }}
 }
 const additions=[];
 if(interact){collect(interact,0,0,additions);logic._$child.push(interact);}
 const oldActors=actors._$child||[],retained=[];actors._$child=[];
 for(const n of oldActors){if(plainGroup(n)){collect(n,actors.x||0,actors.y||0,additions);n.x=(n.x||0)+(actors.x||0);n.y=(n.y||0)+(actors.y||0);retained.push(n);}else actors._$child.push(n);}
 actors._$child.push(...additions);logic._$child.push(...retained);
 const fire=get('fire'),rooms=get('roomnight');if(fire)effects._$child.push(fire);if(rooms)logic._$child.push(rooms);
 world._$child=[ground,decor,actors,roof,lighting,effects,logic];
 world.zOrder=0;
 const ui=root._$child.find(n=>n.name==='UILayer');if(ui)ui.zOrder=100;
 const weather=root._$child.find(n=>n.name==='WeatherLayer');if(weather)weather.zOrder=50;
 const after=positions(root);for(const [key,a]of before){const b=after.get(key);if(!b||a.x!==b.x||a.y!==b.y||a.prefab!==b.prefab||a.comp!==b.comp)throw Error('Preservation check failed '+scene+' '+key);}
 requests.push({name:'Laya_EditAsset',arguments:{file_path:file,ops:[{op:'replace',path:'',value:JSON.stringify(root)}]}});
 reports.push({scene,preservedNodes:before.size,promotedEntities:promoted,actorChildren:actors._$child.length,layers:world._$child.map(n=>n.name)});
}
fs.writeFileSync('.tmp/world-layers/requests.json',JSON.stringify(requests));
fs.writeFileSync('.tmp/world-layers/report.json',JSON.stringify(reports,null,2));
console.log(JSON.stringify(reports,null,2));
