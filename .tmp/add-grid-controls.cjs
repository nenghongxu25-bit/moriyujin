const fs=require('fs');
for(const name of ['Bag/bag_list','Warehouse/warehouse_list']){
 const p='assets/prefab/prefab_interface/'+name+'.lh',obj=JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
 const panel=obj._$child[0];
 if(!panel._$child.some(n=>n.name==='gridRotateButton'))panel._$child.push({_$id:'spatialrotatebutton',_$prefab:'d0a3057e-b3be-4789-a0a6-a8dbe3ee3e0d',name:'gridRotateButton',x: name.startsWith('Bag')?215:205,y:465,_$child:[{_$override:'qwk816k0',text:'旋转 ↻',color:'#eee9d9'}]});
 fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n');
}
