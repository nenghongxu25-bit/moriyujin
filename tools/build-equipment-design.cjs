const fs=require('fs');
const items=[];
const add=(id,name,category,w,h,data)=>items.push({id,name,category,enabled:false,gridWidth:w,gridHeight:h,pixelWidth:w*256,pixelHeight:h*256,stackMax:1,...data});
const armorNames=['轻型软质护甲','加固软质护甲','轻型插板护甲','标准战术护甲','重型突击护甲','重型堡垒护甲'];
const helmetNames=['基础防护盔','轻型防弹盔','标准作战盔','加强战术盔','重型突击盔','复合重装盔'];
for(let i=0;i<6;i++){
 add(`armor_l${i+1}`,armorNames[i],'armor',i<4?3:4,3,{protectionLevel:i+1,maxDurability:[40,50,60,70,80,90][i],weightKg:[2.5,3.5,5,6.5,8,10][i],movementSpeedMultiplier:[1,.99,.97,.95,.92,.88][i],coverage:['torso'],artBrief:['灰褐色薄型尼龙软甲，轮廓轻便','深蓝灰软甲，加厚肩带与前胸护片','橄榄绿轻型插板背心，简洁前胸板仓','军绿色标准战术插板甲，耐磨织带和侧护板','沙色重型突击护甲，厚实胸腹护片与护领','黑灰色重装护甲，多层复合板、护领和腹部延伸护片'][i]});
 add(`helmet_l${i+1}`,helmetNames[i],'helmet',2,2,{protectionLevel:i+1,maxDurability:[25,30,40,50,60,70][i],weightKg:[.8,1,1.3,1.6,2,2.5][i],coverage:['head'],artBrief:['磨损浅灰基础盔，布质下颌带','沙色轻量圆顶盔，简洁外壳','橄榄绿作战盔，织物盔罩','暗绿战术盔，侧导轨与前安装座','深灰厚壁突击盔，加强护耳轮廓','黑色复合重装盔，厚重分层外壳与加固边缘'][i]});
}
const hearing=[['basic','基础拾音耳机',1.15,.85,.9,'基础：小幅扩大细微声响可听范围','棕色轻便耳罩，细头梁与裸露连接线'],['balanced','战术降噪耳机',1.35,.65,.75,'均衡：增强脚步与操作声，降低环境噪声','军绿电子耳罩，软垫头梁和单侧麦克风'],['advanced','高灵敏侦察耳机',1.55,.45,.6,'侦察：扩大细微声响可听范围，强化环境降噪','黑灰低轮廓电子耳罩，厚耳垫和双侧拾音模块']];
for(const [id,name,range,ambient,loud,description,artBrief]of hearing)add(`headset_${id}`,name,'headset',2,2,{weightKg:.4,hearing:{quietSoundRangeMultiplier:range,ambientGain:ambient,loudImpulseGain:loud,preservesOcclusion:true},description,artBrief});
const part=(id,x,y,width,height)=>({id,x,y,width,height});
const container=(id,name,category,w,h,columns,rows,compartments,weightKg,artBrief)=>add(id,name,category,w,h,{weightKg,container:{columns,capacity:columns*rows,usableCells:compartments.reduce((n,p)=>n+p.width*p.height,0),compartments},artBrief});
container('rig_light','轻便四联弹挂','rig',2,2,4,2,Array.from({length:4},(_,i)=>part('p'+(i+1),i,0,1,2)),.7,'沙色窄胸挂，四个独立竖向弹匣袋');
container('rig_patrol','巡逻多袋弹挂','rig',3,3,4,3,[...Array.from({length:4},(_,i)=>part('p'+(i+1),i,0,1,2)),part('p5',0,2,2,1),part('p6',2,2,2,1)],1.1,'橄榄绿胸挂，四个竖袋和两个横向工具袋');
container('rig_assault','突击通用弹挂','rig',3,3,4,4,[part('p1',0,0,2,2),part('p2',2,0,2,2),...Array.from({length:4},(_,i)=>part('p'+(i+3),i,2,1,2))],1.5,'深绿胸挂，上方两个方形杂物袋，下方四个细长袋');
container('rig_heavy','重型支援弹挂','rig',3,3,4,5,[part('p1',0,0,2,3),part('p2',2,0,2,3),part('p3',0,3,2,2),part('p4',2,3,2,2)],2,'灰黑宽胸挂，两个大号纵向袋与两个方形袋');
container('backpack_compact','轻便搜集背包','backpack',2,3,3,4,[part('main',0,0,3,4)],.8,'灰褐色小型帆布包，单一主仓');
container('backpack_patrol','巡逻分仓背包','backpack',3,3,5,4,[part('main',0,0,4,4),part('side1',4,0,1,2),part('side2',4,2,1,2)],1.3,'橄榄绿中型巡逻包，主仓和两个窄侧袋');
container('backpack_expedition','远征搜刮背包','backpack',4,3,6,5,[part('main',0,0,4,5),part('side1',4,0,2,2),part('side2',4,2,2,2)],2,'沙色宽体远征包，大主仓、两个独立方形外挂袋');
container('backpack_cargo','重型运输背包','backpack',4,4,6,6,[part('main',0,0,4,6),part('side1',4,0,2,3),part('side2',4,3,2,3)],3,'深灰大容量运输包，长主仓、两侧独立长袋与加宽肩带');
const qualityColors=[['gray','#727a80','#30363b'],['green','#5f9d65','#233c2a'],['blue','#538fcb','#213950'],['purple','#a274ca','#3b294d'],['gold','#d2ab4f','#493b20'],['red','#c85b5b','#492628']];
const rigNames={rig_light:'雨燕轻型弹挂',rig_patrol:'游骑兵巡逻弹挂',rig_assault:'红隼突击弹挂',rig_heavy:'磐石支援弹挂'};
// Expanded footprint, folded footprint, and value uplift for useful spare capacity.
const packing={rig_light:[3,3,2,1,0],rig_patrol:[3,4,2,1,0],rig_assault:[4,4,2,2,0],rig_heavy:[4,4,2,2,.2],backpack_compact:[3,4,2,1,0],backpack_patrol:[4,5,2,2,0],backpack_expedition:[5,5,3,2,.15],backpack_cargo:[5,6,3,2,.3]};
for(const i of items){
 const shared=['helmet','armor','headset'].includes(i.category);
 let artId=shared?i.category:i.id;
 if(i.category==='armor'&&i.gridWidth===4)artId='armor_wide';
 i.icon=`atlas/picture/items/equipment-v1/${artId}.png`;
 if(i.container){
  const [w,h,fw,fh,premium]=packing[i.id];
  const state=(suffix,width,height)=>({gridWidth:width,gridHeight:height,pixelWidth:width*256,pixelHeight:height*256,icon:`atlas/picture/items/equipment-v1/states/${i.id}_${suffix}.png`});
  i.storageStates={expanded:state('expanded',w,h),folded:state('folded',fw,fh),defaultState:'expanded',foldRequiresEmpty:true,foldedStorageAllowed:false};
  i.spaceBenefit=i.container.usableCells-w*h;
  i.nestingValuePremium=premium;
  Object.assign(i,i.storageStates.expanded);
 }
 if(i.category==='armor'||i.category==='helmet'){
  i.name=`制式${i.category==='armor'?'护甲':'头盔'} · ${i.protectionLevel}级`;
  i.artBrief=`六级共用同一${i.category==='armor'?'护甲':'头盔'}立绘，保持原色，由 UI 底色区分等级`;
 }
 if(rigNames[i.id])i.name=rigNames[i.id];
 const level=i.protectionLevel||(i.category==='headset'?['headset_basic','headset_balanced','headset_advanced'].indexOf(i.id)+3:0);
 const [quality,border,background]=qualityColors[Math.max(0,level-1)];
 i.presentation={quality,backgroundColor:background,borderColor:border,sharedArtwork:shared,backgroundInTexture:false};
}
const catalog={version:1,status:'art assets configured; gameplay equipment integration pending',pixelsPerCell:256,qualityColors:qualityColors.map(([id,border,background])=>({id,border,background})),notes:['防护等级为游戏设计值；六级护甲与头盔分别共用立绘，灰绿蓝紫金红底色区分等级。耳机用蓝紫金。','护甲耐久、重量和听力参数为首版调参基线，尚未接入伤害、负重或音频系统。','外部占格是空装备在仓库里的体积；内部格数只统计独立分区，不统计空白。','物品必须完整落在一个分区内；旋转后也不能跨区。','分区内装不下时拒绝放入；更换容器必须先验证全部物品可容纳，失败保留原容器与物资。','耳机沿用声源遮挡与衰减，不让玩家听到原本被完全阻隔的声音。'],items};
fs.writeFileSync('assets/config/equipment-design-v1.json',JSON.stringify(catalog,null,2)+'\n');
const rows=items.map(i=>`| ${i.name} | ${i.protectionLevel?i.protectionLevel+'级':i.category==='headset'?i.description:i.container.usableCells+'格'} | ${i.gridWidth}×${i.gridHeight} | ${i.container?i.container.compartments.map(p=>p.width+'×'+p.height).join(' + '):i.pixelWidth+'×'+i.pixelHeight+' PNG'} |`).join('\n');
fs.writeFileSync('docs/equipment-design-v1.md',`# 装备物资设计 V1\n\n共 ${items.length} 件：护甲 6、头盔 6、耳机 3、弹挂 4、背包 4。当前是设计配置，尚未绘图或启用新装备。\n\n| 名称 | 等级／功能／内部容量 | 外部占格 | 内部分区／图片尺寸 |\n| --- | --- | --- | --- |\n${rows}\n\n## 分区规则\n\n每个分区是独立容器。相邻的两个 1×1 不能放一件 2×1；相邻的两个 1×2 不能放一件 2×2。移动、旋转、自动放入均不得跨越分隔线。格子总数相同，能放下的物资也可能不同。\n\n${catalog.notes.map(n=>'- '+n).join('\n')}\n\n配置在 assets/config/equipment-design-v1.json。InventoryGrid 已支持可选 compartments 限制；现有背包仍沿用原连续网格，尚未改存档或接入新装备。后续绘图按 artBrief、gridWidth、gridHeight 和像素尺寸执行。\n`);
const palette=['#b69b64','#7899a8','#94a276','#ac839b','#bc8f76','#79a799'];
const diagrams=items.filter(i=>i.container).map(i=>{const c=i.container;return `<article><h2>${i.name} <small>${c.usableCells} 格</small></h2><p>外部占格 ${i.gridWidth}×${i.gridHeight}</p><div class="board" style="width:${c.columns*44}px;height:${c.capacity/c.columns*44}px">${c.compartments.map((p,n)=>`<div class="part" style="left:${p.x*44}px;top:${p.y*44}px;width:${p.width*44}px;height:${p.height*44}px;--color:${palette[n%palette.length]}"><span>${p.width}×${p.height}</span></div>`).join('')}</div></article>`;}).join('');
fs.writeFileSync('docs/equipment-compartments.html',`<!doctype html><html lang="zh"><meta charset="utf-8"><title>装备分区设计</title><style>body{background:#11181c;color:#dde2db;font:16px system-ui;padding:30px}h1{font-size:28px}p{color:#9aa9a8}main{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}article{background:#1a2328;padding:20px;border:1px solid #39484c}h2{font-size:18px}small{color:#bca675}.board{position:relative;margin-top:24px}.part{position:absolute;box-sizing:border-box;border:3px solid var(--color);background:repeating-linear-gradient(90deg,transparent 0 41px,#6c777733 41px 44px),repeating-linear-gradient(transparent 0 41px,#6c777733 41px 44px);display:grid;place-items:center}.part span{background:#1a2328bb;padding:4px;color:var(--color)}@media(max-width:1000px){main{grid-template-columns:repeat(2,1fr)}}</style><h1>弹挂与背包 · 独立分区</h1><p>彩色粗边框表示独立袋仓，内部细线表示格子。相邻袋仓不能合并放置物品；空白区域不能使用。</p><main>${diagrams}</main></html>`);
console.log(`Saved ${items.length} equipment designs and 8 compartment diagrams.`);
