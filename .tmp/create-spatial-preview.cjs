const fs=require('fs'),crypto=require('crypto');
const write=(p,o)=>fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n');
const script='src/debug/SpatialInventoryPreview.ts';if(!fs.existsSync(script+'.meta'))write(script+'.meta',{uuid:crypto.randomUUID()});
const uuid=JSON.parse(fs.readFileSync(script+'.meta')).uuid;
fs.mkdirSync('assets/spatial-inventory-study',{recursive:true});
const scene={_$ver:1,_$id:'spatialinventorypreview',_$type:'Scene',name:'SpatialInventoryPreview',width:1334,height:750,left:0,right:0,top:0,bottom:0,
 _$comp:[{_$type:uuid}],_$child:[{_$id:'warehousepreview',_$prefab:'9bf2effb-3f48-4c83-8ac7-38f62f17e5a2',name:'WarehousePreview'}]};
write('assets/spatial-inventory-study/spatial-inventory-preview.ls',scene);
const p='assets/config/items/weapons.json',weapons=JSON.parse(fs.readFileSync(p));const pistol=weapons.items.find(i=>i.id==='geluoke');pistol.gridWidth=2;pistol.gridHeight=1;write(p,weapons);
