// One-time mechanical prefab migration. Existing IDs, components and gameplay refs are preserved.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const base='assets/ui/survival-hud',backup='backups/survival-hud-v1';
fs.mkdirSync(backup,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function save(p,d){const b=path.join(backup,p);fs.mkdirSync(path.dirname(b),{recursive:true});if(!fs.existsSync(b))fs.copyFileSync(p,b);fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');}
const ids={};for(const name of ['panel','slot','circle','ring','thumb','bag','make','crosshair','hand','search','chop','dig','talk','run','mode','avatar']){
 const p=`${base}/${name}.png.meta`;if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({uuid:crypto.randomUUID(),importer:{textureType:2}},null,2));ids[name]=read(p).uuid;
}
const tex=name=>({'_$uuid':ids[name],'_$type':'Texture'});
const children=n=>n._$child??[];
function walk(n,f){f(n);children(n).forEach(c=>walk(c,f));}
const find=(n,id)=>{let r;walk(n,c=>{if(c._$id===id)r=c;});return r;};
function image(id,name,x,y,w,h,asset){return {_$id:id,_$type:'GImage',name,x,y,width:w,height:h,autoSize:false,mouseEnabled:false,src:'res://'+ids[asset]};}
function art(n,name){delete n._gcmds;n.texture=tex(name);n.alpha=1;}
const folder='assets/prefab/prefab-ui/';
for(const [file,asset] of Object.entries({bag:'bag',make:'make',get:'hand',search:'search',chop:'chop',dig:'dig',talk:'talk',run:'run'})){
 const p=folder+`pre_ui_${file}.lh`,d=read(p),img=children(d).find(n=>n.name==='img');
 img.src='res://'+ids[asset];img.autoSize=false;
 if(file==='bag'||file==='make'){
  img.height=128;
  d._$child.push({_$id:'hud_label_'+file,_$type:'Text',name:'HudCaption',x:0,y:96,width:128,height:23,text:file==='bag'?'背包':'制作',fontSize:20,color:'#eee9d9',align:'center',mouseEnabled:false});
 }
 save(p,d);
}
{
 const p=folder+'pre-joystick.lh',d=read(p),b=find(d,'sunnmstt'),h=find(d,'97atdkiz'),r=find(d,'runring0001');
 art(b,'circle');b.width=b.height=200;b.x=b.y=100;b.alpha=.8;
 art(h,'thumb');h.width=h.height=68;h.x=h.y=100;
 art(r,'ring');r.x=r.y=100;r.width=r.height=240;r.alpha=.45;
 const root=find(d,'0jvaucmc');root.width=root.height=200;root.x=root.y=0;
 save(p,d);
}
{
 const p=folder+'pre_ui_attack.lh',d=read(p);art(find(d,'t42e6rru'),'circle');art(find(d,'jcp3rvp9'),'ring');
 save(p,d);
}
{
 const p=folder+'pre-switch.lh',d=read(p),dot=children(d)[0];
 d._$child.unshift(image('hud_mode_back','ModeArtwork',0,0,100,100,'mode'));
 const c=dot._gcmds[0];c.x=.83;c.y=.17;c.radius=.055;c.lineWidth=0;
 save(p,d);
}
const p=folder+'play_ui.lh',d=read(p);
const layout={
 la1qodvj:{x:451,y:615,width:432,height:96},
 i17z1swu:{x:0,y:0,alpha:1},jwr6iiy8:{x:108,y:0,alpha:1},wz73alta:{x:216,y:0,alpha:1},q0zy0yfu:{x:324,y:0,alpha:1},
 i3rmmb8s:{x:0,y:0,width:1334,height:750,mouseThrough:true},rk8t267l:{x:0,y:0,width:1334,height:750,mouseThrough:true},
 '9xqe96ru':{x:46,y:494,width:200,height:200},run_ui:{x:252,y:474,scaleX:.7,scaleY:.7},
 bag_ui:{x:1098,y:28,scaleX:.7,scaleY:.7},ej1msfiy:{x:1204,y:28,scaleX:.7,scaleY:.7},
 asq102c8:{x:1112,y:525,scaleX:1.35,scaleY:1.35},'1g66j51m':{x:1220,y:412,scaleX:.68,scaleY:.68},
 vj1cy1vc:{x:28,y:28,width:320,height:88},
};
for(const id of ['ibud8gfq','mokveb9e','alf07qsz','tdloqyfr','g39wgkh6'])layout[id]={x:1022,y:441,scaleX:.76,scaleY:.76};
for(const [id,props]of Object.entries(layout))Object.assign(find(d,id),props);
const joy=find(d,'9xqe96ru');Object.assign(joy._$child[0],{width:200,height:200});
for(const id of ['i17z1swu','jwr6iiy8','wz73alta','q0zy0yfu']){
 const n=find(d,id);n._$child=[{_$override:'zfgejdrd',src:'res://'+ids.slot,width:100,height:100,scaleX:1,scaleY:1}];
}
const profile=find(d,'vj1cy1vc');delete profile.background;
profile._$child.unshift(image('hud_profile_back','HudBackground',0,0,320,88,'panel'));
Object.assign(find(d,'wc0jzlul'),{x:12,y:12,width:64,height:64,autoSize:false,src:'res://'+ids.avatar});
Object.assign(find(d,'n26kis57'),{x:88,y:16,width:215,height:28,fontSize:21,color:'#eee9d9',align:'left'});
Object.assign(find(d,'da4wpiau'),{x:88,y:47,width:215,height:24,fontSize:15,color:'#b4bdb0',align:'left'});
save(p,d);
// Scene prefab overrides can mask the shared HUD layout. Drop only presentation overrides we changed.
for(const file of fs.readdirSync('assets/scenes').filter(n=>n.endsWith('.ls'))){
 const p='assets/scenes/'+file,s=read(p);let changed=false;
 walk(s,n=>{const ref=n._$override;const id=Array.isArray(ref)?ref[ref.length-1]:ref;if(!layout[id])return;
  for(const k of Object.keys(layout[id]))if(k in n){delete n[k];changed=true;}
 });if(changed)save(p,s);
}
console.log('HUD art/layout migrated; backups at '+backup);
