const fs=require('fs');
const file='assets/prefab/prefab_interface/panel/SidePanel.lh';
const before=fs.readFileSync(file,'utf8');
fs.mkdirSync('backups/welfare-layout-20260921',{recursive:true});
const backup='backups/welfare-layout-20260921/SidePanel.lh';
if(!fs.existsSync(backup))fs.writeFileSync(backup,before);
const root=JSON.parse(before),nodes=root._$child;
const set=(id,props)=>Object.assign(nodes.find(n=>n._$id===id),props);
set('qkfq61bq',{x:20,y:-112,width:360,height:38,fontSize:26,align:'center',valign:'middle',text:'首页侧边栏入口奖励'});
set('37hq7obz',{x:40,y:-68,width:320,height:28,fontSize:20});
set('on89m0yr',{x:40,y:-36,width:320,height:28,fontSize:18,text:'a.点击下方“去首页侧边栏”按钮',underline:false});
set('qcsyzhae',{x:40,y:0,width:320,height:100});
set('zo0hgrsy',{x:40,y:110,width:320,height:28,fontSize:18});
set('xo1di5um',{x:85,y:144,width:230,height:121,autoSize:false});
set('ee3lghq4',{x:180,y:189});
set('m905eu41',{x:180,y:184});
set('aave2ifl',{x:40,y:272,width:320,height:28,fontSize:18});
set('6qgyelqo',{x:145,y:306});
set('ivo0tnec',{x:215,y:306});
function button(id,x,y,width,height,imageId,textId){
 const n=nodes.find(n=>n._$id===id);Object.assign(n,{x,y,width,height});
 Object.assign(n._$child.find(c=>c._$override===imageId),{x:0,y:0,width,height,anchorX:0,anchorY:0});
 Object.assign(n._$child.find(c=>c._$override===textId),{x:0,y:0,width,height,anchorX:0,anchorY:0,fontSize:20,align:'center',valign:'middle'});
}
button('e1lqs98g',40,356,320,42,'8ku2edy8','fqr4xd66');
button('pszuu8wd',140,408,120,36,'rfkfthtc','feo6uqqp');
fs.writeFileSync(file,JSON.stringify(root,null,2)+'\n');
