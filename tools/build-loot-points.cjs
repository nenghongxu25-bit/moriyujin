const fs=require('fs'),path=require('path'),crypto=require('crypto');
const batch=Number((process.argv.find(a=>/^--batch[1-9]\d*$/.test(a))||'--batch1').slice(7));
const pack=`loot-points-v${batch}`,previewName=batch===1?'loot-points-preview':`loot-points-batch${batch}-preview`;
const records=JSON.parse(fs.readFileSync(batch===1?'docs/loot-points-art-manifest.json':`docs/loot-points-batch${batch}-art-manifest.json`,'utf8')).items;
function write(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');}
function meta(file,texture=false){const name=file+'.meta';if(!fs.existsSync(name))write(name,{uuid:crypto.randomUUID(),...(texture?{importer:{textureType:2}}:{})});return JSON.parse(fs.readFileSync(name,'utf8').replace(/^\uFEFF/,'' )).uuid;}
const script=meta('src/container/LootPoint.ts');
const previewScript=meta('src/container/LootPointPreview.ts');
const base=JSON.parse(fs.readFileSync('assets/prefab/prefab-interact/prefab-container/ironbox.lh','utf8'));
const preview={_$ver:1,_$id:'loot_point_preview',_$type:'Scene',name:'loot-points-preview',width:1334,height:750,_$comp:[],_$child:[]};
const output=[];
for(const [i,r] of records.entries()){
 const dir=`assets/animation/container/${pack}/${r.id}`,frames=[0,1,2,3].map(n=>`${dir}/frame_0${n}.png`);frames.forEach(f=>meta(f,true));
 write(dir+'/animation.json',{name:r.id,fps:8,loop:false,width:512,height:512,groundAnchor:{x:256,y:476},frames:frames.map(f=>path.basename(f))});meta(dir+'/animation.json');
 const p=JSON.parse(JSON.stringify(base)),size=r.displaySize,ground=size*476/512;
 p._$id='loot_'+r.id;p.name=r.name;p.width=size;p.height=size;
 p._$child[0]._$id=r.id+'_image';
 p._$comp.forEach((c,j)=>{if(c._$id)c._$id=r.id+'_component_'+j;});
 p._$comp[3].imageNode._$ref=p._$child[0]._$id;
 const container=p._$comp[1];
 Object.assign(container,{_$type:script,scriptPath:'../src/container/LootPoint.ts',containerId:'loot_'+r.id,displayName:r.name,visualId:r.id,visualFolder:pack});
 p._$comp[0].shapes[0]={...p._$comp[0].shapes[0],x:size*.1,y:size*.4,width:size*.8,height:size*.6};
 p._$comp[2].groundY=ground;
 const img=p._$child[0];img.width=size;img.height=size;img.scaleX=img.scaleY=1;img.src='res://'+meta(frames[0],true);img.autoSize=false;
 const file=`assets/prefab/prefab-interact/${pack}/${r.id}.lh`;write(file,p);meta(file);
 // Save the gameplay prefab first, then create an independent art-preview copy.
 const sample=JSON.parse(JSON.stringify(p));
 sample._$comp=sample._$comp.filter(c=>c.scriptPath!=='../src/container/LootPoint.ts');
 sample._$comp.push({_$type:previewScript,scriptPath:'../src/container/LootPointPreview.ts',visualId:r.id,visualFolder:pack});
 sample.x=50+(i%3)*420;sample.y=335+Math.floor(i/3)*350-ground;preview._$child.push(sample);
 output.push({...r,source:`art/${pack}/source/${r.id}.png`,frames:frames.map(f=>f.replace(/^assets\//,'')),prefab:file});
}
write(`assets/loot-points-study/${previewName}.ls`,preview);meta(`assets/loot-points-study/${previewName}.ls`);
write(`assets/config/${pack}.json`,{version:1,frameSize:512,fps:8,loop:false,items:output.map(({prompt,...r})=>r)});meta(`assets/config/${pack}.json`);
const cards=output.map(r=>`<article><h2>${r.name}</h2><div class="stage"><img data-id="${r.id}" src="../assets/${r.frames[0]}" style="width:${r.displaySize}px"></div><p>显示画布 ${r.displaySize} × ${r.displaySize} · 4 帧 / 8 FPS</p><button onclick="play('${r.id}')">播放开启动画</button></article>`).join('');
fs.writeFileSync(`docs/${previewName}.html`,`<!doctype html><meta charset="utf-8"><title>物资点开启动画</title><style>body{background:#1b2525;color:#dedacb;font:16px sans-serif;margin:24px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}article{background:#293735;padding:16px}h2{font-size:20px}.stage{height:380px;display:flex;align-items:flex-end;justify-content:center;background:repeating-conic-gradient(#344541 0% 25%,#30403c 0% 50%) 0/24px 24px}button{padding:10px;background:#b5ac85;border:0;cursor:pointer}</style><h1>物资点 · 关闭 → 打开</h1><p>点击逐个播放。各组固定 512×512 透明帧，统一缩放并按固定柜体参照对齐。</p><main>${cards}</main><script>const timers={};function play(id){clearInterval(timers[id]);let n=0;const img=document.querySelector('[data-id="'+id+'"]');img.src='../assets/animation/container/${pack}/'+id+'/frame_00.png';timers[id]=setInterval(()=>{img.src='../assets/animation/container/${pack}/'+id+'/frame_0'+(++n)+'.png';if(n===3)clearInterval(timers[id]);},125);}</script>`);
console.log(`Built ${records.length} loot prefabs, manifest and animation preview scene/page`);
