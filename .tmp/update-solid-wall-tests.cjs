const fs=require('fs'),p='tools/test-wall-vision.cjs';let s=fs.readFileSync(p,'utf8');
const start=s.indexOf('layer.owner={alpha:1,visible:true};'),end=s.indexOf('\n{\n const before=',start);
if(start<0||end<0)throw Error('Missing test anchors');
s=s.slice(0,start)+`layer.owner={alpha:1,visible:true};
const houseOwner={};layer.owner.parent=houseOwner;
for(const inside of [false,true,false]){
 interior.setHouseInterior(houseOwner,inside);
 Wall.viewers.set(actor,{x:125,foot:448});
 for(const s of layer.surfaces){s.opacity=.28;s.nodes=[{alpha:.28,visible:true}];}
 layer.onLateUpdate();
 assert(layer.surfaces.every(s=>s.opacity===1&&s.nodes[0].alpha===1),'walls stay solid indoors and outdoors');
 assert.equal(layer.revealed.size,0,'no wall reveal selection');
}
Wall.viewers.clear();
console.log('PASS: wall sight blocking and permanent opaque rendering indoors/outdoors.');
`+s.slice(end);fs.writeFileSync(p,s);
