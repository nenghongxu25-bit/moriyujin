const fs=require('fs'),crypto=require('crypto');
const dir='assets/decorate/forest/expansion-v1';
const names=['forest-crooked-pine-v1','forest-dead-tree-v1','forest-young-pine-v1','forest-sparse-shrub-v1','forest-needle-leaf-litter-v1','forest-broken-branches-v1','forest-bank-reeds-v1','forest-muddy-bank-v1'];
const children=names.map((name,i)=>{
 const p=dir+'/'+name+'.png',b=fs.readFileSync(p),w=b.readUInt32BE(16),h=b.readUInt32BE(20);
 if(!fs.existsSync(p+'.meta'))fs.writeFileSync(p+'.meta',JSON.stringify({uuid:crypto.randomUUID(),importer:{textureType:2}},null,2));
 const id=JSON.parse(fs.readFileSync(p+'.meta','utf8')).uuid,scale=Math.min(280/w,(i<4?330:260)/h),dw=w*scale,dh=h*scale;
 return {_$id:'expansion'+i,_$type:'Sprite',name,x:35+(i%4)*325+(280-dw)/2,y:(i<4?370:710)-dh,width:dw,height:dh,texture:{_$uuid:id,_$type:'Texture'}};
});
const scene={_$ver:1,_$id:'expansionScene',_$type:'Scene',name:'ForestExpansionPreview',width:1334,height:750,left:0,right:0,top:0,bottom:0,_$comp:[{_$type:'86fb35d4-bffe-4012-bc9f-85f003b0b723',scriptPath:'../src/systems/IsometricStudyBackdrop.ts'}],_$child:children};
fs.writeFileSync('assets/forest-expansion-preview.ls',JSON.stringify(scene,null,2));
console.log('Eight assets saved and arranged.');
