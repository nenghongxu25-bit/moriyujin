// Idempotent visual-only migration. Never edits scripts, bindings, inventory or reward data.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const BACK='backups/survival-pages-v1',BASE='assets/prefab/prefab_interface/';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function backup(p){const q=path.join(BACK,p);fs.mkdirSync(path.dirname(q),{recursive:true});if(!fs.existsSync(q))fs.copyFileSync(p,q);}
function save(p,d){backup(p);fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');}
const ids={};for(const k of ['page','pane','button','accent','slot','close','tab']){const p=`assets/ui/survival-pages/${k}.png.meta`;if(!fs.existsSync(p))fs.writeFileSync(p,JSON.stringify({uuid:crypto.randomUUID(),importer:{textureType:2}},null,2));ids[k]=read(p).uuid;}
function walk(n,f){f(n);(n._$child||[]).forEach(c=>walk(c,f));}
function find(d,id){let v;walk(d,n=>{if(n._$id===id)v=n;});if(!v)throw Error('Missing '+id);return v;}
const set=(d,id,p)=>Object.assign(find(d,id),p);
function image(n,k){if(n._$type==='Sprite'){delete n._gcmds;n.texture={_$uuid:ids[k],_$type:'Texture'};}else{n.src='res://'+ids[k];n.autoSize=false;n.color='#ffffff';}}
const dark='#1d2a27',pane='#293832',edge='#647565',ink='#eee9d9',muted='#b6c2b3',accent='#cab781';
function command(c){if(!c)return;if(c.fillColor)c.fillColor=pane;if(c.lineColor)c.lineColor=edge;if(c.lineWidth)c.lineWidth=1;if(c._$type==='DrawRoundRectCmd')for(const k of ['lt','rt','lb','rb'])c[k]=6;}
const oldImages=new Map();
for(const [f,k] of [['card_bg.png','pane'],['box.png','slot'],['button.png','button'],['bt.png','tab'],['close.png','close'],['menu_bg.jpg','page']]){
 const p='assets/atlas/picture/module/'+f;if(fs.existsSync(p+'.meta'))oldImages.set('res://'+read(p+'.meta').uuid,k);oldImages.set('atlas/picture/module/'+f,k);
}
oldImages.set('res://6a66a5a6-7388-4f5c-831d-d4b5c9964f2c','pane');
function theme(d){walk(d,n=>{
 if(n.scroller)n.scroller.vScrollBarRes={_$uuid:'eb7cd798-7a10-46c5-b85f-cdc935a78181',_$type:'Prefab'};
 if(oldImages.has(n.src))image(n,oldImages.get(n.src));
 if(n.texture&&oldImages.has('res://'+n.texture._$uuid))image(n,oldImages.get('res://'+n.texture._$uuid));
 if(n._$type==='Text'||typeof n.text==='string'){
  n.color=ink;if(n.fontSize>36)n.fontSize=32;
  if(n.stroke)n.stroke=0;
 }
 if(n.background)command(n.background);
 for(const c of n._gcmds||[])command(c);
 if(n.name==='mask_0'||n.name==='mask_1'||n.name==='mask')for(const c of n._gcmds||[])if(c.fillColor)c.fillColor=n.name==='mask_1'?'#344a3f':'#14201c';
 });}
function fullbg(d,id){const n=find(d,id);Object.assign(n,{x:0,y:0,width:1334,height:750,anchorX:0,anchorY:0,rotation:0,scaleX:1,scaleY:1});image(n,'page');}
function title(d,id,text){set(d,id,{x:52,y:31,width:850,height:48,fontSize:32,bold:true,align:'left',color:ink,...(text?{text}:{})});}
function close(d,id){set(d,id,{x:567,y:646,scaleX:1,scaleY:1,width:200,height:80});}
function rect(d,id,x,y,w,h){set(d,id,{x,y,width:w,height:h});}
function edit(file,fn){const p=BASE+file,d=read(p);theme(d);fn?.(d);save(p,d);}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const p of files(BASE).filter(p=>p.endsWith('.lh')&&!/Common[\\/](1|ad|HpBar|TlBar_1)\.lh$/.test(p))){const d=read(p);theme(d);save(p,d);}
// Shared buttons and inventory tiles: retain root dimensions and template IDs.
for(const f of ['Common/CloseSprite.lh','Common/JumpToScene.lh','Common/OpenSprite.lh'])edit(f,d=>{for(const n of d._$child||[]){if(n._$type==='GImage'){Object.assign(n,{x:4,y:18,width:192,height:62,autoSize:false});image(n,'button');}if(n._$type==='Text')Object.assign(n,{x:4,y:18,width:192,height:62,fontSize:23,align:'center',valign:'middle'});}});
for(const f of ['Common/bt.lh','BattlePass/bt.lh'])edit(f,d=>{set(d,'qwk816k0',{fontSize:20,color:ink});});
edit('Common/buttonmodule.lh',d=>{set(d,'fqr4xd66',{fontSize:18,color:ink});image(find(d,'8ku2edy8'),'accent');});
edit('Common/buttonmodule_2.lh',d=>{rect(d,'krgsvuwv',2,6,96,88);set(d,'tz6yo96j',{fontSize:18,color:ink});});
edit('Common/boxmodule.lh',d=>{Object.assign(find(d,'zfgejdrd'),{width:100,height:100,scaleX:1,scaleY:1,autoSize:false});set(d,'5zg64bdz',{x:4,y:72,width:92,height:24,fontSize:12,color:muted});set(d,'gj3qvj55',{x:72,y:5,width:23,height:20,fontSize:13,color:ink});});
// Sign-in: seven readable columns, scroll retained, state masks still driven by SignInDayItem.
edit('Common/bt_nojs.lh',d=>{
 Object.assign(d,{width:120,height:126,scaleX:1,scaleY:1});
 set(d,'zfgejdrd',{x:60,y:62,width:116,height:122,scaleX:1,scaleY:1,autoSize:false});
 set(d,'jdhjlgub',{x:60,y:57,width:62,height:62,autoSize:false});
 set(d,'5zg64bdz',{x:5,y:91,width:110,height:24,fontSize:13,color:muted});set(d,'gj3qvj55',{x:91,y:32,width:23,height:20,fontSize:13});
 for(const id of ['v2tjsckl','me62y2qp'])set(d,id,{x:4,y:30,width:112,height:90,alpha:.75});
 for(const id of ['2lcn2e3v','fskturo6'])set(d,id,{width:112,height:90,fontSize:17});
 set(d,'e5bji9mh',{x:10,y:4,scaleX:1,scaleY:.5});
});
edit('panel/sign_in_panel.lh',d=>{fullbg(d,'xj93j7g4');title(d,'ale854qg');close(d,'lgf653rx');const l=find(d,'k8v6t44v');Object.assign(l,{x:180,y:126,width:974,height:504});Object.assign(l.layout,{columns:7,columnGap:18,rowGap:14});delete l.background;});
edit('BattlePass/battlepass_panel.lh',d=>{fullbg(d,'o1eqhd6s');title(d,'bp_title');close(d,'h3r2x1ju');rect(d,'seasonTitle',52,119,380,32);rect(d,'evbx2bo5',534,119,245,32);set(d,'evbx2bo5',{fontSize:18,color:muted});rect(d,'4809b8q6',778,119,140,32);set(d,'4809b8q6',{fontSize:21,color:accent});rect(d,'hac81pls',36,165,790,465);rect(d,'nlzz5pbb',16,8,758,50);rect(d,'a7oaawzk',16,74,758,375);Object.assign(find(d,'nlzz5pbb').layout,{columnGap:8});Object.assign(find(d,'a7oaawzk').layout,{rowGap:10});set(d,'qxy28zlk',{height:92,width:750});set(d,'bx9kyfsn',{x:20,width:515,height:92,fontSize:21});set(d,'taskprogress1',{x:570,width:155,height:92,fontSize:21,color:accent});set(d,'fgsw9pw1',{height:92,fontSize:22});rect(d,'d1lrl5p2',842,122,440,515);rect(d,'datwihsf',40,91,335,402);});
// Full screen inventory panels, keeping their existing data bindings and pane relationships.
edit('Bag/bag_panel.lh',d=>{fullbg(d,'ewajfvzu');title(d,'tvsia4hz');close(d,'vzkfe927');set(d,'eavb30xg',{y:282});
 set(d,'p0801usn',{x:102,y:12,width:100,fontSize:18,color:muted});
 for(const id of ['0ck9hb6c','u0372oph','521tgjlg','kp2i20id','r8nhr5f8','euyzw1cj','75utzik9'])set(d,id,{fontSize:20});
});
edit('Warehouse/warehouse_panel.lh',d=>{fullbg(d,'4xlta50g');title(d,'wh_title');close(d,'4xfu3qll');});
// Workbench: aligned station tabs and a clear recipe/material/result hierarchy.
edit('Crafting/CraftingPanel.lh',d=>{
 fullbg(d,'oq4zruwo');title(d,'craft_title');rect(d,'joiii0ex',1230,28,52,52);rect(d,'rfkfthtc',0,0,52,52);
 rect(d,'wn2b0lcp',46,116,1240,94);find(d,'wn2b0lcp').mouseThrough=true;
 ['5dkdmbeh','d1llbzpk','okl86u3m','w9imh9rs','deyul414','2ifxqi9q','ddn3jo0t'].forEach((id,i)=>{set(d,id,{x:i*174,y:0,width:162,height:76});const n=find(d,id);for(const c of n._$child||[]){if(c.name==='img')Object.assign(c,{x:0,y:0,width:162,height:76,autoSize:false});if(c._$type==='Text')Object.assign(c,{x:0,y:0,width:162,height:76,fontSize:21});if(c.name==='mask')Object.assign(c,{x:4,y:4,width:154,height:68});}});
 rect(d,'craft_detail',46,226,1240,410);rect(d,'57r39bvn',0,0,210,410);find(d,'57r39bvn').layout.rowGap=10;
 const t=find(d,'vit4s7np');t.width=192;t.height=76;for(const n of t._$child||[]){if(n.name==='img')Object.assign(n,{x:0,y:0,width:192,height:76});if(n._$type==='Text')Object.assign(n,{width:192,height:76,fontSize:20});}
 rect(d,'recipe_name',250,12,560,40);set(d,'recipe_name',{fontSize:28,color:ink});
 rect(d,'recipe_inputs',250,78,300,28);rect(d,'4onm4ehh',250,119,525,112);
 rect(d,'recipe_output',250,250,110,28);rect(d,'xkxigm18',375,248,100,100);
 rect(d,'pq3lac4l',845,16,350,255);set(d,'pq3lac4l',{fontSize:20,color:muted});
 rect(d,'4kp5m8dv',938,329,100,50);set(d,'4kp5m8dv',{scaleX:1.8,scaleY:1.15});
});
edit('Make/MakePanel.lh',d=>{const bg=find(d,'izxx1wz2');Object.assign(bg,{x:368,y:58,width:598,height:630});image(bg,'pane');rect(d,'egkww6ze',402,78,410,50);set(d,'egkww6ze',{fontSize:29,align:'left'});rect(d,'noekgw19',896,76,48,48);rect(d,'c5jqkljb',394,145,546,325);rect(d,'g83gat7p',390,140,554,335);find(d,'g83gat7p').mouseEnabled=false;rect(d,'make_message_text',399,480,533,34);set(d,'make_message_text',{fontSize:18,color:accent});rect(d,'1xd2h4dv',402,549,358,100);rect(d,'9woufc8g',396,535,370,123);find(d,'9woufc8g').mouseEnabled=false;rect(d,'lk88rhmq',802,549,100,100);});
edit('Mail/MailPanel.lh',d=>{rect(d,'01ljwcs9',115,84,1104,559);rect(d,'talk_title',28,20,900,44);set(d,'talk_title',{fontSize:30,align:'left'});rect(d,'dialog_entry_list',26,94,296,412);rect(d,'w4mi2r5a',375,160,680,400);rect(d,'dialog_detail_panel',-24,-66,720,412);rect(d,'dialog_detail_title',24,20,672,220);set(d,'dialog_detail_title',{fontSize:20,wordWrap:true});rect(d,'nttnubrl',24,253,120,28);rect(d,'9bryjchh',24,296,480,98);rect(d,'jf6o4une',560,329,100,50);close(d,'sw3c07cs');});
edit('Mail/mailbox.lh',d=>{Object.assign(d,{width:278,height:78});rect(d,'25l412rc',0,0,278,78);rect(d,'chrtrl42',12,10,250,30);set(d,'chrtrl42',{fontSize:19});rect(d,'18vbvc5c',12,43,250,23);set(d,'18vbvc5c',{fontSize:14,color:muted,align:'left'});rect(d,'6ns76496',0,0,278,78);rect(d,'kxs24l6z',0,0,278,78);});
edit('Mail/rewardmodule.lh',d=>{d.scaleX=d.scaleY=.7;});
edit('Crafting/CraftingPanel.lh',d=>{rect(d,'c091yt8m',4,4,184,68);});
edit('BattlePass/battlepass_panel.lh',d=>{find(d,'datwihsf').layout.rowGap=10;set(d,'t5mwj9w0',{width:300,height:108});rect(d,'j4m59zoo',0,0,750,92);});
edit('MapChoose/mapchoose.lh',d=>{fullbg(d,'5p6li2ob');close(d,'01nu257i');set(d,'rakvbas9',{x:320,y:273,scaleX:1.5,scaleY:1.5});set(d,'xs2cv5mf',{x:730,y:273,scaleX:1.5,scaleY:1.5});});
edit('panel/shop_panel.lh',d=>{fullbg(d,'shop_bg');title(d,'shop_title');for(const id of ['tab_featured_bg','tab_materials_bg','tab_consumables_bg'])image(find(d,id),'tab');image(find(d,'buyButton_bg'),'accent');for(const id of ['tab_featured','tab_materials','tab_consumables'])find(d,id).y=118;find(d,'slotsPanel').y=174;find(d,'slotsPanel').height=452;find(d,'detailPanel').y=174;find(d,'detailPanel').height=452;find(d,'buyButton').y=380;find(d,'detailPanel').background={_$type:'DrawRectCmd',fillColor:dark,lineColor:edge,lineWidth:1};});
// Presentation-only overrides inside scene UI branches must not reintroduce black text / parchment.
const uiPrefabIds=new Set(files(BASE).filter(p=>p.endsWith('.lh.meta')).map(p=>read(p).uuid));
for(const file of fs.readdirSync('assets/scenes').filter(n=>n.endsWith('.ls'))){const p='assets/scenes/'+file,d=read(p);let touched=false;function visit(n,inUI=false){const active=inUI||n.name==='UILayer'||uiPrefabIds.has(n._$prefab);if(active){theme(n);touched=true;return;}(n._$child||[]).forEach(c=>visit(c,active));}visit(d);if(touched)save(p,d);}
fs.mkdirSync('art-library/ui-concepts/pages-v1',{recursive:true});
// Final authored geometry corrections (after common palette normalization).
edit('Common/SurvivalVScrollBar.lh',d=>{find(d,'scroll_track').background.fillColor='#17221e';find(d,'scroll_grip').background.fillColor='#8c9b81';});
edit('Crafting/CraftingPanel.lh',d=>set(d,'c091yt8m',{scaleX:1,scaleY:1}));
edit('Bag/bag_panel.lh',d=>set(d,'eavb30xg',{y:342}));
edit('Warehouse/warehouse_list.lh',d=>{set(d,'nol5d9im',{y:74});['19vswdcg','7aeyxkeh','p7584gbj','76wdggq5','kr0mximb','g928awhb','0o5kwgjx'].forEach((id,i)=>set(d,id,{x:-234+i*82,y:-113,scaleX:.75,scaleY:.48}));});
edit('panel/shop_panel.lh',d=>{rect(d,'currencyText',910,35,290,32);rect(d,'closeButton',1230,28,52,52);rect(d,'shop_close_bg',0,0,52,52);image(find(d,'shop_close_bg'),'close');find(d,'shop_close_text').text='';});
edit('MapChoose/mapchoose.lh',d=>{if(!d._$child.some(n=>n._$id==='map_visual_title'))d._$child.push({_$id:'map_visual_title',_$type:'Text',name:'title',x:52,y:31,width:850,height:48,fontSize:32,bold:true,color:ink,text:'外出探索'});});
{const p='assets/scenes/cunzhuang.ls',d=read(p);['lk32kav8','ck42nxn7','5d3fujtq','3dmjv2yk'].forEach((id,i)=>set(d,id,{x:80+i*155,y:10,scaleX:.72,scaleY:.8}));set(d,'at5wnocg',{x:785,y:120});save(p,d);}
console.log('Unified page theme written. Original files: '+BACK);
