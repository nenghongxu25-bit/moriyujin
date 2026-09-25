const fs=require('fs'),crypto=require('crypto');
function meta(file){if(!fs.existsSync(file+'.meta'))fs.writeFileSync(file+'.meta',JSON.stringify({uuid:crypto.randomUUID()},null,2));return JSON.parse(fs.readFileSync(file+'.meta','utf8')).uuid;}
const script=meta('src/container/LootPointGallery.ts'),children=[];let count=0;
for(let batch=1;batch<=3;batch++){
 const config=JSON.parse(fs.readFileSync(`assets/config/loot-points-v${batch}.json`,'utf8'));
 for(const [col,r] of config.items.entries()){
  for(const f of r.frames)if(!fs.existsSync('assets/'+f))throw Error('Missing '+f);
  const p=JSON.parse(fs.readFileSync(r.prefab,'utf8')),scale=.55;
  p.x=24+col*218+(190-r.displaySize*scale)/2;p.y=90+(batch-1)*218+172-r.displaySize*476/512*scale;
  p.scaleX=p.scaleY=scale;p.name=r.name;p._$comp[1].instanceId='gallery_'+r.id;
  children.push(p,{_$id:'label_'+r.id,_$type:'Text',name:'名称_'+r.id,x:24+col*218,y:90+(batch-1)*218+180,width:195,height:28,text:r.name,fontSize:17,color:'#eeeeee',align:'center'});count++;
 }
}
const scene={_$ver:1,_$id:'loot_gallery_20260922',_$type:'Scene',name:'今日物资点总览_18种',width:1334,height:750,_$comp:[{_$type:script,scriptPath:'../src/container/LootPointGallery.ts'}],_$child:[{_$id:'title',_$type:'Text',name:'说明',x:24,y:20,width:1280,height:45,text:'今日物资点 · 18种 / 72帧    点击物件播放开启动画',fontSize:25,color:'#ffffff'},...children]};
const file='assets/scenes/loot-points-all.ls';fs.writeFileSync(file,JSON.stringify(scene,null,2));meta(file);
console.log(`Verified ${count} prefabs and ${count*4} frame files; built ${file}`);
