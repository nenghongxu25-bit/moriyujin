const fs=require('fs'),path=require('path');
const root='backups/survival-controls-v1';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function backup(p){const q=path.join(root,p);fs.mkdirSync(path.dirname(q),{recursive:true});if(!fs.existsSync(q))fs.copyFileSync(p,q);}
function files(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(p,e.name)):[path.join(p,e.name)]);}
const art=k=>read('assets/ui/survival-pages/'+k+'.png.meta').uuid;
const hudSlot=read('assets/ui/survival-hud/slot.png.meta').uuid;
function walk(n){
 const override=Array.isArray(n._$override)?n._$override.at(-1):n._$override;
 if((n._$id==='3oei1uz6'||override==='3oei1uz6')&&n._gcmds){delete n._gcmds;n.texture={_$uuid:art('button'),_$type:'Texture'};}
 if(n.src==='res://'+hudSlot){n.src='res://'+art('slot');n.autoSize=false;}
 const cs=n._$child||[];
 const frame=cs.find(c=>c.name==='item'&&c._$type==='GImage');
 const label=cs.find(c=>c.name==='name'&&c._$type==='Text');
 const count=cs.find(c=>c.name==='amount'&&c._$type==='Text');
 if(frame&&label&&count&&n.name!=='bt_nojs'){
   const w=n.width||100,h=n.height||100;
   Object.assign(frame,{x:w/2,y:h/2,width:w,height:h,scaleX:1,scaleY:1,autoSize:false});
   Object.assign(label,{x:6,y:h-29,width:w-12,height:23,fontSize:w>=120?16:13,color:'#d4ddce',align:'center'});
   Object.assign(count,{x:w-54,y:5,width:46,height:22,fontSize:w>=120?16:13,color:'#eee9d9',align:'right'});
 }
 if(n._$id==='n392fqkh')Object.assign(n,{x:4,y:8,width:92,height:84,alpha:.48});
 cs.forEach(walk);
}
for(const dir of ['assets/prefab/prefab_interface','assets/prefab/prefab-ui'])for(const p of files(dir).filter(p=>p.endsWith('.lh'))){const d=read(p),before=JSON.stringify(d);walk(d);if(before!==JSON.stringify(d)){backup(p);fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');}}
for(const p of ['src/PlayUI/CommonUI/listTemplate.ts'])backup(p);
console.log('Authored buttons / inventory slots / HUD quick slots refined; backup: '+root);
