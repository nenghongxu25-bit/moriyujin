// Author editable Laya prefab nodes, never create layout nodes at runtime.
const fs=require('fs');
let serial=0;
const id=()=>`tac_${++serial}`;
const node=(type,name,x,y,w,h,extra={})=>({_$id:id(),_$type:type,name,x,y,width:w,height:h,...extra});
const rect=(name,x,y,w,h,color='#191d20',stroke='#363d40')=>node('GWidget',name,x,y,w,h,{mouseEnabled:false,background:{_$type:'DrawRectCmd',fillColor:color,lineColor:stroke,lineWidth:1}});
const text=(name,value,x,y,w,h=24,size=16,color='#b7bcba')=>node('Text',name,x,y,w,h,{text:value,font:'Microsoft YaHei',fontSize:size,color,valign:'middle',overflow:'hidden',mouseEnabled:false});
const button=(name,label,x,y,w=90,h=34)=>({...rect(name,x,y,w,h,'#252b2d','#4a5150'),mouseEnabled:true,_$child:[{...text('label',label,0,0,w,h,14,'#deded2'),align:'center'}]});
// GImage stretches its texture. GLoader implements aspect-preserving Contain.
const icon=(name,x,y,w,h)=>node('GLoader',name,x,y,w,h,{src:'',fitMode:2,align:1,valign:1,mouseEnabled:false});
function grid(name,x,y,columns,capacity){
 const root=node('GList',name,x,y,columns*72+18,486,{mouseEnabled:true,layout:{type:0},scroller:{_$type:'Scroller',vScrollBarRes:{_$uuid:'eb7cd798-7a10-46c5-b85f-cdc935a78181',_$type:'Prefab'}}});
 const frame=rect('item',0,0,70,70,'#141c20','#394447');
 const image=icon('icon',4,4,60,48),label=text('name','',4,50,62,18,12),count=text('amount','',40,2,26,18,12);
 const template=node('GWidget','itemTemplate',0,0,70,70,{mouseEnabled:true,_$child:[frame,image,label,count]});
 template._$comp=[{_$type:'2847192a-1f1b-4cc0-b66a-3325ac9107f7',templateSlot:{_$ref:frame._$id},gimg:{_$ref:image._$id},nameText:{_$ref:label._$id},countText:{_$ref:count._$id}}];
 root._templateNode={_$ref:template._$id,_$tmpl:'itemTemplate'};root._initItemNum=capacity;
 root._$comp=[{_$type:'0f3d3c58-9d25-4a96-a2b5-4dcf1c5f3f71',listNode:{_$ref:root._$id},templateNode:{_$ref:template._$id},slotCount:capacity}];root._$child=[template];return root;
}
function equip(slot,label,x,y,w,h){return {...rect('equip_'+slot,x,y,w,h,'#111517'),mouseEnabled:true,_$child:[text('slotTitle',label,10,7,w-20,20,12,'#8b928f'),icon('icon',12,26,w-24,h-52),text('itemLabel','未装备',10,h-24,w-20,20,12,'#c4c9c5')]};}
function extractionLayout(children,warehouse){
 const retired=new Set(['equipmentZone','equipmentTitle','health','equip_helmet','equip_armor','equip_insertPlate','equip_weapon','quickTitle','quickHint','combatStats','carryZone','carryTitle','carryCapacity','carryGrid',...Array.from({length:4},(_,i)=>'quick_'+i)]);
 const bag=children.find(n=>n.name==='carryGrid');
 const quick=children.filter(n=>n.name.startsWith('quick_'));
 for(let i=children.length-1;i>=0;i--)if(retired.has(children[i].name))children.splice(i,1);
 children.push(text('loadoutHeading','随身装备 / LOADOUT',36,94,500,32,18,'#e0e0d5'));
 const scroll=node('GPanel','loadoutScroll',24,136,714,516,{mouseEnabled:true,clipping:true,layout:{type:0},scroller:{_$type:'Scroller',vScrollBarRes:{_$uuid:'eb7cd798-7a10-46c5-b85f-cdc935a78181',_$type:'Prefab'}},_$child:[]});
 const content=scroll._$child;
 for(const [i,slot,label] of [[0,'helmet','头盔'],[1,'armor','护甲'],[2,'headset','耳机']])content.push(equip(slot,label,i*230,0,220,144));
 content.push(equip('weapon','主武器',0,158,466,162),equip('pistol','手枪',480,158,200,162),equip('secondary','副武器',0,334,466,162),equip('melee','近战武器',480,334,200,162));
 for(const name of ['headset','secondary','pistol','melee']){
  const n=content.find(n=>n.name==='equip_'+name);n.mouseEnabled=false;n._$child.find(n=>n.name==='itemLabel').text='暂未开放';
 }
 content.push(text('pocketTitle','口袋 / POCKETS',0,678,680,30,17,'#d5d7ca'));
 quick.forEach((n,i)=>{n.x=i*170;n.y=722;n.width=158;n.height=110;const [title,img,label]=n._$child;Object.assign(img,{x:12,y:24,width:134,height:60});Object.assign(label,{x:10,y:87,width:138,height:20,fontSize:12});content.push(n);});
 content.push(text('pocketHint','快捷收纳 · 选中背包物品后点击分配',0,839,680,24,12));
 content.push(equip('rig','弹挂 / CHEST RIG',0,882,490,110));
 const rig=content[content.length-1];rig.mouseEnabled=false;rig._$child.find(n=>n.name==='itemLabel').text='暂未开放';
 content.push(equip('insertPlate','防弹插板',504,882,176,110));
 content.push(text('carryTitle','背包 / BACKPACK',0,1014,430,32,18,'#d5d7ca'),text('carryCapacity','',490,1014,190,32,14));
 Object.assign(bag,{x:0,y:1060,width:698,height:1360});delete bag.scroller;content.push(bag);
 content.push(text('loadoutEnd','— 装备与收纳 —',0,2436,680,28,12,'#64716e'));
 // The two weapon rows share their sidearm slots, freeing one full row below.
 for(const child of content)if(child.y>=678)child.y-=158;
 children.push(scroll);
 const panel=rect('playerStatusZone',756,142,554,510,'#171d20','#384144');
 panel._$child=[text('healthHeading','身体状态 / VITALS',24,14,500,34,20,'#dce1d4')];
 [['hp','健康','#b9c99c'],['stamina','体力','#c6c7ab'],['hydration','水量','#8eb7c2'],['energy','能量','#c3ad80']].forEach(([key,label,color],i)=>{
  const y=76+i*70;panel._$child.push(text(key+'Title',label,24,y,140,24,16),{...text(key+'Value','',274,y,254,24,17,'#e2e5dc'),align:'right'},rect(key+'Track',24,y+34,504,5,'#303a3d','#303a3d'),rect(key+'Fill',24,y+34,504,5,color,color));
 });
 panel._$child.push(text('conditionTitle','当前状态',24,368,504,26,17,'#dce1d4'),{...text('conditionText','',24,402,504,62,14),wordWrap:true,valign:'top'},text('combatStats','',24,474,504,22,13));children.push(panel);
 children.push(button('showStatus','玩家状态',756,98,150,34),button('showStorage',warehouse?'仓库':'搜索容器',916,98,150,34),button('scrollEquipment','装备',534,98,88,30),button('scrollBag','背包 ↓',630,98,108,30));
 const storage=children.find(n=>n.name==='storageZone');storage.y=142;storage.height=510;storage._$child.find(n=>n.name==='storageGrid').height=448;
 const inspect=children.find(n=>n.name==='inspectionZone');inspect.visible=false;
}
function build(warehouse){
 serial=0;
 const root=node('GWidget',warehouse?'warehouse_panel':'Root',0,0,1334,750,{_$ver:1,mouseEnabled:true});
 root._$id=warehouse?'warehouse_root':'r0itm6j1';root._$comp=[{_$type:warehouse?'2d7d1f64-9d2a-4b5c-a2ed-3e6a1e0f4cf0':'cccc26aa-5d81-479b-9e05-9dc1ee8b8c83'}];
 const children=[rect('background',0,0,1334,750,'#0e1215','#0e1215'),rect('header',0,0,1334,82,'#191e20','#303839'),rect('accent',24,23,4,35,'#b8ac7f','#b8ac7f'),text('title',warehouse?'整备仓库':'随身装备',44,19,260,42,29,'#e2e4da'),text('subtitle','LOADOUT  /  装备管理',320,28,350,25,13,'#7c8787'),button('close','关闭  ×',1198,24,112,34)];
 children.push(rect('equipmentZone',24,98,306,554),text('equipmentTitle','作战装备 / EQUIPMENT',40,108,280,26,16,'#d9dccf'),text('health','生命',40,143,266,24,14,'#a6b498'));
 children.push(equip('helmet','头部防护',40,176,84,102),equip('armor','身体护甲',134,176,84,102),equip('insertPlate','防弹插板',228,176,84,102));
 const weapon=equip('weapon','手持武器 / WEAPON',40,290,272,152);
 weapon.background.lineColor='#77765f';
 children.push(weapon);
 children.push(text('quickTitle','快捷装备 / QUICK ACCESS',40,451,266,22,13,'#d9dccf'));
 for(let i=0;i<4;i++){
  const q=equip('quick_'+i,String(i+1),40+(i%2)*142,481+Math.floor(i/2)*58,130,52);q.name='quick_'+i;
  const [title,image,label]=q._$child;
  Object.assign(title,{x:5,y:3,width:14,height:16,fontSize:10});
  Object.assign(image,{x:21,y:3,width:101,height:30});
  Object.assign(label,{x:6,y:34,width:118,height:16,fontSize:10});
  children.push(q);
 }
 children.push(text('quickHint','选中物品分配快捷槽 · 点击装备取回',40,594,272,20,11,'#75817f'),text('combatStats','',40,619,266,20,13));
 children.push(rect('carryZone',348,98,394,554),text('carryTitle','背包 / BACKPACK',364,108,210,26,16,'#d9dccf'),text('carryCapacity','',596,110,130,24,13),grid('carryGrid',356,150,5,50));
 const storage=rect('storageZone',756,98,554,554);storage.mouseEnabled=true;storage._$child=[text('storageTitle','仓库 / STASH',16,10,300,26,16,'#d9dccf'),text('storageCapacity','',384,12,152,24,13),grid('storageGrid',12,52,6,210),button('filterAll','全部',470,52,70,34),button('filterWeapons','武器',470,98,70,34),button('filterOther','物资',470,144,70,34),text('scrollHint','滚动\n浏览',476,218,64,54,12,'#788380')];children.push(storage);
 const inspect=rect('inspectionZone',756,98,554,554);inspect._$child=[text('inspectHeading','物品检视 / INSPECT',20,12,500,26,16,'#d9dccf'),icon('inspectionIcon',44,64,466,178),text('inspectionName','选择物品查看详情',24,265,506,34,24,'#e2e4da'),{...text('inspectionText','',24,317,506,198,15),wordWrap:true,valign:'top',leading:8}];inspect.visible=!warehouse;children.push(inspect);
 children.push(text('selectedName','选择物品查看详情',24,662,308,30,15,'#d9dccf'));
 const actions=[['transfer','快捷转移'],['equip','装备'],['rotate','旋转 R'],['split','拆分'],['inspect','详情'],['discard','丢弃']];actions.forEach(([key,label],i)=>children.push(button(key,label,348+i*96,664,88,32)));
 children.push(button('organizeBag','整理背包',940,664,116,32));if(warehouse)children.push(button('organizeWarehouse','整理仓库',1070,664,116,32));
 children.push({...button('toggleContainer','卷起',1198,664,112,32),visible:false});
 children.push(node('Input','searchInput',1035,29,146,28,{text:'',prompt:'搜索名称 / ID',fontSize:13,color:'#d9dccf',bgColor:'#101619',borderColor:'#394446',padding:'4,6,4,6'}));
 children.push(text('status','快速双击转移  ·  拖拽移动  ·  R 旋转  ·  Ctrl+点击转移  ·  Alt+点击装备',24,711,1220,23,13,'#7d8b87'));
 const menu=rect('contextMenu',600,300,184,238,'#242c2f','#818c83');menu.visible=false;menu.mouseEnabled=true;menu.zOrder=900;
 [['Transfer','快捷转移'],['Equip','装备'],['Rotate','旋转'],['Split','拆分'],['Inspect','详情'],['Discard','丢弃']].forEach(([name,label],i)=>{(menu._$child??=[]).push(button('context'+name,label,8,8+i*37,168,33));});children.push(menu);
 const shield=rect('dialogShield',0,0,1334,750,'#000000','#000000');shield.alpha=0.65;shield.mouseEnabled=true;shield.visible=false;shield.zOrder=999;children.push(shield);
 const dialog=rect('dialog',429,151,476,450,'#202729','#879185');dialog.visible=false;dialog.mouseEnabled=true;dialog.zOrder=1000;
 dialog._$child=[text('dialogTitle','物品详情',24,16,368,36,24,'#ececdf'),button('dialogClose','×',413,16,40,32),{...text('dialogText','',24,70,428,262,16,'#c6ceca'),wordWrap:true,valign:'top',leading:8},node('Input','splitInput',24,344,180,36,{type:'number',text:'1',fontSize:20,color:'#e2e4da',bgColor:'#0d1316',borderColor:'#62706c',padding:'4,8,4,8'}),button('dialogConfirm','确认',304,390,148,36)];children.push(dialog);
 extractionLayout(children,warehouse);
 // A separate authored item visual follows the pointer. Grid cells stay in the list.
 const preview=grid('previewSource',0,0,1,1)._$child[0];
 preview.name='inventoryDragPreview';preview.visible=false;preview.mouseEnabled=false;
 const bindPreview=n=>{for(const c of n._$comp||[])if(c._$type==='0f3d3c58-9d25-4a96-a2b5-4dcf1c5f3f71')c.dragPreviewNode={_$ref:preview._$id};for(const child of n._$child||[])bindPreview(child);};
 children.forEach(bindPreview);children.push(preview);
 root._$child=children;
 fs.writeFileSync(`assets/prefab/prefab_interface/${warehouse?'Warehouse/warehouse':'Bag/bag'}_panel.lh`,JSON.stringify(root,null,2)+'\n');
}
build(false);build(true);console.log('Authored backpack + warehouse prefabs');
// Remove overrides pointing into the retired prefab hierarchy; preserve instance IDs and visibility.
const path=require('path');
function migrateInstances(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){migrateInstances(file);continue;}
 if(!/\.(ls|lh)$/.test(file))continue;
 const raw=fs.readFileSync(file,'utf8'),data=JSON.parse(raw);let changed=false;
 function visit(n){if(['8ae45e30-f989-4f5e-b586-6e6c4cdbaaee','9bf2effb-3f48-4c83-8ac7-38f62f17e5a2'].includes(n._$prefab)){
   if(n._$child||n._$comp){delete n._$child;delete n._$comp;changed=true;}
 }else for(const c of n._$child||[])visit(c);}
 visit(data);if(changed){const backup=path.join('backups/tactical-inventory-20260921',file);fs.mkdirSync(path.dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.writeFileSync(backup,raw);fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');console.log('Updated instance bindings: '+file);}
}}
migrateInstances('assets/scenes');migrateInstances('assets/prefab');
