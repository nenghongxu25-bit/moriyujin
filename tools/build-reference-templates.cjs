// Offline authoring utility: outputs editable Laya scene/prefab nodes.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const scenePath='assets/scenes/cunzhuang.ls';
const scene=JSON.parse(fs.readFileSync(scenePath,'utf8').replace(/^\uFEFF/,''));
fs.mkdirSync('archives',{recursive:true});
const backup='archives/cunzhuang-before-page-templates.ls';
if(!fs.existsSync(backup))fs.copyFileSync(scenePath,backup);
let seq=0;const uid=()=> 'rt_'+(++seq).toString(36);
const C={bg:'#111619',panel:'#1b2226',line:'#394247',muted:'#8f999e',white:'#e2e6e8',accent:'#d76532'};
function node(type,name,x,y,w,h,extra={}){return {_$id:uid(),_$type:type,name,x,y,width:w,height:h,...extra};}
function group(name,x=0,y=0,w=1334,h=750,children=[]){return node('Sprite',name,x,y,w,h,{mouseThrough:name.startsWith('view:'),_$child:children});}
function rect(name,x,y,w,h,fill=C.panel,line=C.line){return node('GWidget',name,x,y,w,h,{background:{_$type:'DrawRectCmd',fillColor:fill,lineColor:line,lineWidth:1}});}
function text(name,value,x,y,w,h=30,size=18,color=C.white){return node('Text',name,x,y,w,h,{text:value,font:'Microsoft YaHei',fontSize:size,color,mouseEnabled:false,valign:'middle',wordWrap:true,leading:5});}
function image(name,file,x,y,w,h,alpha=1){const m=JSON.parse(fs.readFileSync(file+'.meta','utf8'));if(file.endsWith('.png')){const b=fs.readFileSync(file),iw=b.readUInt32BE(16),ih=b.readUInt32BE(20),scale=Math.min(w/iw,h/ih);x+=(w-iw*scale)/2;y+=(h-ih*scale)/2;w=iw*scale;h=ih*scale;}return node('Sprite',name,x,y,w,h,{texture:{_$uuid:m.uuid,_$type:'Texture'},alpha,mouseEnabled:false});}
function button(label,x,y,w=150,h=44,action='',selected=false){const b=group(action||'Button',x,y,w,h,[rect('ButtonBackground',0,0,w,h),rect('Selected',0,0,w,h,'#34241d',C.accent),text('Label',label,10,0,w-20,h,18)]);b.mouseEnabled=true;b._$child[1].visible=selected;b._$child[2].align='center';return b;}
const avatar='assets/ui/survival-hud/avatar.png',land='assets/atlas/picture/module/menu_bg.jpg';
const weapons=['ak47','m16','fal','geluoke'].map(n=>'assets/atlas/picture/items/weapons/rangeds/'+n+'.png');
const loot=['helmet','armor-plate','metal-ingot','basic-material','cooked-food'].map(n=>'assets/atlas/picture/items/shared/'+n+'.png');
function art(name,file,x,y,w,h){const g=group(name,x,y,w,h,[rect('ArtBackground',0,0,w,h,'#232c31')]);if(file===avatar){g._$child.push(image('ReplaceablePortrait',file,0,0,Math.min(w,h),h,.26));}else g._$child.push(image('Artwork',file,12,12,w-24,h-24,.9));return g;}
const pages=[];
function page(key,title){const p=group('page:'+key);p.visible=false;p.mouseEnabled=true;p.zOrder=1000;p._$child=[rect('Background',0,0,1334,750,C.bg,C.bg),rect('Header',0,0,1334,76,'#1e2529'),text('Title',title,40,14,210,46,28),button('‹  返回',1178,15,120,44,'go:lobby'),text('TemplateNote','界面模板 · 展示数据',40,716,350,22,12,C.muted)];pages.push(p);return p;}
const add=(p,...nodes)=>p._$child.push(...nodes);
function tabs(p,labels,keys,start=260,width=178){labels.forEach((s,i)=>add(p,button(s,start+i*width,18,width-8,40,'go:'+keys[i],p.name==='page:'+keys[i])));}
function side(p,labels,groupName,y=110,w=190){labels.forEach((s,i)=>add(p,button(s,40,y+i*74,w,64,'pick:'+groupName+':'+i,i===0)));}
function selectionCard(name,x,y,w,h,children,selected=false){let g=group(name,x,y,w,h,[rect('Background',0,0,w,h),...children,rect('Selected',0,h-3,w,3,C.accent,C.accent)]);g.mouseEnabled=true;g._$child[g._$child.length-1].visible=selected;return g;}

// Contacts: 3 columns x 4 rows, ten portrait cards and two empty slots.
const contacts=page('contacts','联络人');
add(contacts,button('我的收藏',995,15,160,44,'pick:favorite:0'));
const people=[['老周','军械师 · 枪械 / 弹药 / 维修','军械'],['林医生','急救医生 · 药品 / 治疗','医疗'],['燕子','森林信使 · 探索 / 情报 / 寻人','情报'],['铁叔','维修工 · 防具 / 背包 / 工具','工坊'],['阿拾','拾荒者 · 回收 / 换物 / 材料','回收'],['白先生','流动商人 · 稀缺物资 / 金券','商队']];
for(let i=0;i<people.length;i++){const x=140+(i%3)*354,y=180+Math.floor(i/3)*186,w=346,h=138;
 if(i>=people.length){add(contacts,rect('EmptyContactSlot',x,y,w,h,'#171d21'),text('Empty','—',x,y,w,h,26,C.line));continue;}
 const [name,role,icon]=people[i];add(contacts,selectionCard('pick:contact:'+i,x,y,w,h,[art('PortraitSlot',avatar,1,1,344,136),text('FunctionIcon',icon,278,10,55,30,16,C.muted),text('Name',name,114,77,220,28,21),text('Role',role,114,108,220,24,14,C.muted)],i===0));
}
// Market uses true image slots, search input, categories and tabs.
const market=page('market','市场');
['购买','出售','我的交易'].forEach((s,i)=>add(market,button(s,240+i*156,18,148,40,'pick:marketTab:'+i,i===0)));
add(market,text('Balance','信用点 —   金券 —',870,18,292,38,18,C.muted),rect('SearchBackground',40,94,1088,46,'#0d1215'),node('Input','SearchInput',56,99,1050,36,{font:'Microsoft YaHei',fontSize:18,color:C.white,prompt:'输入物品名称搜索',promptColor:C.muted}),button('搜索',1140,94,158,46,'pick:search:0'));
['我的收藏','装备','武器','武器配件','弹药','物资'].forEach((s,i)=>add(market,button(s,40,156+i*78,190,68,'pick:category:'+i,i===0)));
['全新','准新','磨损'].forEach((s,i)=>add(market,button(s,1182,160+i*64,116,50,'pick:condition:'+i,i===0)));
const products=[['战术头盔',loot[0],'18,447'],['装甲板',loot[1],'18,700'],['AK 系列步枪',weapons[0],'27,000'],['金属锭',loot[2],'2,186'],['基础材料',loot[3],'680'],['FAL 步枪',weapons[2],'32,500']];
for(let tab=0;tab<3;tab++){const view=group('view:marketTab:'+tab);view.visible=tab===0;
 if(tab===0)products.forEach(([n,img,price],i)=>{const x=250+i%3*304,y=166+Math.floor(i/3)*246;add(view,selectionCard('pick:product:'+i,x,y,292,230,[image('ItemIcon',img,62,14,168,136),text('ItemName',n,16,153,260,30,18),text('Price','信用点  '+price,16,190,260,28,21)],i===0));});
 else add(view,rect('EmptyPanel',250,166,904,490),text('EmptyTitle',tab===1?'选择仓库中的物品出售':'暂无交易记录',290,290,810,60,26),text('EmptyHint',tab===1?'出售流程将在接入交易功能后启用。':'成交和上架记录将在这里显示。',290,354,810,50,18,C.muted),button('打开仓库',290,430,180,48,'go:warehouse'));
 add(market,view);
}
// Personalization mosaic.
const custom=page('customization','个性化');
const blocks=[['枪械',weapons[0],90,140,500,240],['个性资源',loot[3],604,140,248,240],['装备涂装',loot[1],90,394,340,260],['近战武器','assets/atlas/picture/items/weapons/melees/knife.png',444,394,408,260],['角色与外观',avatar,866,140,376,514]];
blocks.forEach(([n,img,x,y,w,h],i)=>add(custom,selectionCard('pick:appearance:'+i,x,y,w,h,[art('ReplaceableArtwork',img,1,1,w-2,h-2),rect('CaptionShade',1,h-64,w-2,62,'#151b20','#151b20'),text('Category',n,20,h-58,w-40,48,25)],i===0)));
// Mail: category / list / reading pane.
const mail=page('mail','邮件');side(mail,['系统邮件','市场邮件','物资归还','派遣邮件'],'mailCategory',106,172);
const subjects=['仓库已满物品找回','行动补给已送达','市场交易通知','赛季奖励','派遣任务完成'];
subjects.forEach((s,i)=>add(mail,button(s+'\n'+(29-i)+' 日后过期',230,106+i*94,292,84,'pick:mail:'+i,i===0)));
add(mail,text('Unread','5 / 200    未读邮件  5',234,602,288,30,16,C.muted),button('一键领取',230,654,140,48,'pick:mailAction:0'),button('删除已读',382,654,140,48,'pick:mailAction:1'));
subjects.forEach((s,i)=>{const v=group('view:mail:'+i);v.visible=i===0;add(v,rect('ReadingPane',544,106,754,596,'#151b1f'),image('SenderAvatar',avatar,564,123,58,58,.55),text('Subject',s,644,118,610,38,23),text('Sender','发件人：系统通知',644,158,600,26,15,C.muted),text('Body',i===0?'由于您的仓库已满，以下物品通过邮件发送。请及时领取。':'本次行动的通知和奖励将在这里展示。',570,240,688,130,21),rect('AttachmentSlot',568,508,100,120),image('Attachment',loot[i%loot.length],578,515,80,80),text('Count','×1',622,601,40,22,14),button('领取物品',1094,642,180,46,'pick:claim:'+i));add(mail,v);});
// Profile consists of four real navigable pages.
const profileKeys=['profile','combat','history','evaluation'];
const profileTitles=['基本信息','战斗信息','历史战绩','评价历史'];
const profile=page('profile','个人信息');tabs(profile,profileTitles,profileKeys,238,180);
add(profile,rect('IdentityCard',56,112,410,138),image('Avatar',avatar,76,126,84,84,.6),text('PlayerName','幸存者档案',178,130,260,40,25),text('Identity','等级 —     段位 —\n战队：未加入',178,178,260,60,17,C.muted),text('ID','编号：—',56,262,410,32,16,C.muted),text('GoalTitle','赛季目标',56,338,410,42,23),art('PlayerPortraitSlot',avatar,490,112,352,540),text('PortraitHint','角色展示',558,610,220,32,17,C.muted));
['最高段位','赛季挑战','档案收集'].forEach((s,i)=>add(profile,rect('Goal',56+i*138,394,128,140),text('GoalName',s,68+i*138,412,110,30,17),text('GoalValue','—',68+i*138,455,110,50,32,C.accent)));
add(profile,text('Stats','仓库价值       游戏时长       战局数\n     —                  —                 —',56,560,410,90,19),rect('AbilityPanel',870,112,404,300),text('AbilityTitle','生存能力',894,128,350,40,23));
['搜索','战斗','生存','撤离','财富'].forEach((n,i)=>add(profile,text('AbilityLabel',n,894,178+i*40,75,28,17,C.muted),rect('AbilityTrack',978,188+i*40,200,6,'#354047','#354047'),text('AbilityValue','—',1200,178+i*40,50,28,18)));
for(let i=0;i<8;i++)add(profile,rect('BadgeSlot',870+i%4*103,444+Math.floor(i/4)*106,94,94),text('BadgePlaceholder','◇',895+i%4*103,464+Math.floor(i/4)*106,50,50,32,C.line));
const combat=page('combat','个人信息');tabs(combat,profileTitles,profileKeys,238,180);
['撤离率','战局数','累计淘汰数','战损比','累计净赚价值'].forEach((n,i)=>add(combat,text('Metric',n,54+i*163,125,160,35,18,C.muted),text('MetricValue','—',54+i*163,170,160,48,34,C.accent)));
add(combat,text('BattleTitle','战斗数据',54,266,350,42,25),text('BaseTitle','基础数据',490,266,350,42,25),art('PlayerPortraitSlot',avatar,920,112,360,566));
const metricA=['杰出行动次数','平均行动时长','场均伤害','特遣队员淘汰数','游荡者淘汰数','精准淘汰率','场均治疗量'],metricB=['最长连胜场次','行走公里数','搜索战利品数','地点收集数','物品发现数','带出物资价值','累计生存时长'];
[metricA,metricB].forEach((a,col)=>a.forEach((n,i)=>add(combat,text('MetricLabel',n,54+col*436,334+i*46,300,30,18,C.muted),text('MetricValue','—',386+col*436,334+i*46,55,30,21))));
const history=page('history','个人信息');tabs(history,profileTitles,profileKeys,238,180);side(history,['全部模式','战术行动','禁区模式','势力对抗','活动模式'],'history');
const cols=[['结果',260,150],['模式',418,160],['地图',586,180],['生存时间',774,145],['淘汰数',925,105],['时间',1040,230]];
add(history,rect('TableHeader',252,106,1046,48));cols.forEach(([n,x,w])=>add(history,text('Column',n,x,112,w,36,18)));
for(let i=0;i<5;i++){add(history,rect('HistoryRow',252,164+i*96,1046,86,i%2?'#191f23':'#151b1f'));const vals=[i%2?'撤离失败':'成功撤离','战术行动',i%2?'城市':'森林','—','—','—'];cols.forEach(([n,x,w],j)=>add(history,text('Value',vals[j],x,179+i*96,w,50,18,j===0?(i%2?'#d95362':'#77aa89'):C.muted)));}
const evaluation=page('evaluation','个人信息');tabs(evaluation,profileTitles,profileKeys,238,180);
['总览','战斗','搜索','合作','探索'].forEach((n,i)=>add(evaluation,button(n,54+i*148,102,140,40,'pick:badgeCategory:'+i,i===0)));
const badges=['传奇战神','精准射手','手枪战神','突击步枪战神','轻机枪战神','火力倾泻'];
badges.forEach((n,i)=>add(evaluation,selectionCard('pick:badge:'+i,54+i%3*242,160+Math.floor(i/3)*248,230,230,[text('BadgeSymbol','◇',55,20,120,116,86,C.accent),text('Count','× —',70,135,100,30,19,C.muted),text('BadgeName',n,16,179,198,38,21)],i===0)));
badges.forEach((n,i)=>{const v=group('view:badge:'+i);v.visible=i===0;add(v,text('BadgeLarge','◇',936,158,230,220,170,C.accent),text('BadgeTitle',n,862,395,410,65,30),text('Progression','普通   ›   精良   ›   稀有   ›   传奇',850,506,430,60,18,C.muted),text('Requirement','完成对应行动目标后解锁',870,610,390,40,19));add(evaluation,v);});
// Weapon browser.
const weapon=page('weapons','选择枪械');
add(weapon,button('此枪方案',46,98,168,46,'pick:scheme:0'),text('WeaponName','AK 系列步枪',52,207,330,40,27),text('WeaponInfo','射速：—\n开火模式：半自动 / 全自动',52,253,340,76,18,C.muted));
['垂直后坐控制','水平后坐控制','人机工效','精准度','腰射稳定度','有效射程'].forEach((n,i)=>add(weapon,text('Attribute',n+'  —',52+i%2*192,364+Math.floor(i/2)*42,185,36,17,C.muted)));
['突击步枪','冲锋枪','狙击步枪','霰弹枪','手枪'].forEach((n,i)=>add(weapon,button(n,48+i*199,550,189,44,'pick:weaponClass:'+i,i===0)));
weapons.forEach((img,i)=>{add(weapon,selectionCard('pick:weapon:'+i,48+i*308,610,294,92,[image('Thumbnail',img,10,9,130,70),text('Weapon', ['AK 系列','M16','FAL','手枪'][i],150,14,132,32,19),text('Caliber',['7.62 × 39','5.56 × 45','7.62 × 51','9 × 19'][i],150,52,136,28,15,C.muted)],i===0));const v=group('view:weapon:'+i);v.visible=i===0;add(v,image('WeaponPreview',img,464,168,788,320));add(weapon,v);});
add(weapon,button('选定枪械',1090,546,204,48,'pick:confirmWeapon:0',true));
// Mode selection with a large scene image and four entry cards.
const mode=page('mode','模式选择');
const background=image('ModeArtwork',land,0,77,1334,630,.38);mode._$child.splice(2,0,background);
['特遣队员','伪装潜入','休闲行动','限时活动'].forEach((n,i)=>{const v=group('view:mode:'+i);v.visible=i===0;add(v,text('ModeTitle',n,78,150,700,100,66),text('ModeDescription',['进入战区搜集物资，并携带战利品成功撤离。','以临时身份进入战区，寻找新的生存机会。','熟悉武器、地图与撤离路线。','参与特殊行动，挑战不同的任务目标。'][i],82,267,630,86,21));add(mode,v);add(mode,selectionCard('pick:mode:'+i,76+i*235,556,221,126,[image('ModeThumbnail',land,1,1,219,124,.4),text('ModeName',n,15,74,196,40,22)],i===0));});
add(mode,button('下一步  ›',1044,582,252,98,'go:map',true));

// Author reusable prefab files; scene instances use stable resource UUIDs.
const folder='assets/prefab/prefab_interface/ReferenceTemplates';fs.mkdirSync(folder,{recursive:true});
for(const p of pages){const key=p.name.slice(5),f=folder+'/'+key+'.lh';let uuid=fs.existsSync(f+'.meta')?JSON.parse(fs.readFileSync(f+'.meta')).uuid:crypto.randomUUID();fs.writeFileSync(f,JSON.stringify({_$ver:1,...p,visible:true},null,2));fs.writeFileSync(f+'.meta',JSON.stringify({uuid},null,2));p.resourceUuid=uuid;}
const ui=scene._$child.find(n=>n.name==='UILayer');if(!ui)throw Error('UILayer missing');
const panel=ui._$child.find(n=>n.name==='panel');if(!panel)throw Error('panel missing');
panel._$child=panel._$child.filter(n=>['warehouse_panel','mapchoose'].includes(n.name));
for(const p of pages)panel._$child.push({_$id:p._$id,_$prefab:p.resourceUuid,name:p.name,visible:false,zOrder:1000});
// Replace lobby buttons with scene-authored buttons, preserving role->warehouse.
const buttons=ui._$child.find(n=>n.name==='button');buttons._$child=[];
[['角色','warehouse'],['联络人','contacts'],['改枪','weapons'],['市场','market'],['装扮','customization']].forEach(([label,key],i)=>buttons._$child.push(button(label,42,170+i*80,185,55,'go:'+key)));
buttons._$child.push(button('邮件',1054,410,110,68,'go:mail'),button('市场',1054,300,110,68,'go:market'),button('进入暗区',1068,594,222,66,'go:mode',true),button('幸存者档案',28,22,300,78,'go:profile'));
const chrome=ui._$child.find(n=>n.name==='LobbyChrome');
chrome._$child=chrome._$child.filter(n=>!['ProfileHitArea','ProfileName','ProfileLevel','ProfilePanel'].includes(n.name));
function restyle(n){if(n.background){n.background.fillColor=C.panel;n.background.lineColor=C.line;}if(n.color)n.color=C.white;for(const c of n._$child||[])restyle(c);}restyle(chrome);
ui._$comp=(ui._$comp||[]).filter(c=>c._$type!=='86caec40-e001-46c8-936a-23e0e175eb55');
ui._$comp.push({_$type:'86caec40-e001-46c8-936a-23e0e175eb55',scriptPath:'../src/PlayUI/ReferenceTemplates.ts'});
fs.writeFileSync(scenePath,JSON.stringify(scene,null,2));
fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/reference-page-templates.md','# 暗区参考页面模板\n\n入口场景：assets/scenes/cunzhuang.ls\n\n模板位于 assets/prefab/prefab_interface/ReferenceTemplates/，共10个 .lh。模板内容为编辑器节点；ReferenceTemplates.ts 仅绑定导航和选择，不生成 UI。\n\n角色入口仍打开原仓库；模式下一步打开原地图选择。个人信息有4个可切换页面。市场/邮件为展示模板，不执行交易或发放奖励。所有示例数值、战绩和联系人名称仅供布局展示。\n\n人物卡片的 PortraitSlot/ReplaceablePortrait 和装扮 ReplaceableArtwork 是美术替换位置，当前使用已有占位图；商品/武器图片使用项目现有素材。\n\n选中切换使用 pick:组:编号，相关内容命名 view:组:编号；跨页导航使用 go:页面名。Selected 节点是可编辑选中条。返回 go:lobby。\n\n备份：archives/cunzhuang-before-page-templates.ls。\n');
console.log('Authored '+pages.length+' prefab templates and connected lobby.');
