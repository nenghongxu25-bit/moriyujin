// Use the native diamond TileSet and a captured 8x8 forest region. MCP writes scene.
const fs=require('fs');
const region=JSON.parse(fs.readFileSync('.tmp/forest-iso/region.json','utf8'));
const compressData={'_$type':'Record'},transFlags={'_$type':'Record'};
for(const c of region.cells){const i=c.x-region.x,j=c.y-region.y;const local=(i+j)*32+4+Math.floor((i-j)/2);(compressData[c.gid]??=[]).push(local);transFlags[local]=c.flag;}
const tileLayer={'_$id':'forestIsoTiles','_$type':'Sprite',name:'ForestDiamondTiles_8x8',rotation:0,scaleX:1,scaleY:1,'_$comp':[{'_$type':'TileMapLayer',layer:0,tileSet:{'_$uuid':JSON.parse(fs.readFileSync('assets/forest-isometric-study/forest-diamond.tres.meta','utf8')).uuid,'_$type':'TileSet'},chunkDatas:{'_$type':'Record','0':{'_$type':'Record','0':{'_$type':'TileMapChunkData',chunkX:0,chunkY:0,compressData,transFlags}}}}]};
const scene={'_$ver':1,'_$id':'forestIsoStudy','_$type':'Scene',name:'CurrentForestIsometricStudy',width:1334,height:750,left:0,right:0,top:0,bottom:0,'_$comp':[{'_$type':'86fb35d4-bffe-4012-bc9f-85f003b0b723'}],'_$child':[{'_$id':'forestIsoView','_$type':'Sprite',name:'NativeIsometricGround',x:91,y:95,scaleX:1,scaleY:1,'_$child':[tileLayer]}]};
const crypto=require('crypto');
const id=s=>crypto.createHash('sha256').update('forest-depth:'+s).digest('hex').slice(0,12);
function image(name,path,x,y,width,height,alpha=1){return {'_$id':id(name),'_$type':'Sprite',name,x,y,width,height,alpha,texture:{'_$uuid':JSON.parse(fs.readFileSync(path+'.meta','utf8')).uuid,'_$type':'Texture'}};}
const foundation=image('SoilFoundation','assets/forest-isometric-study/soil-foundation.png',155,95,1024,562);
const props=[],shadows=[];
const assets={pine:'assets/decorate/forest/current/forest-pine-tree-v1.png',shrub:'assets/decorate/forest/current/forest-shrub-v1.png',rocks:'assets/decorate/forest-elements-v2/rocks-round.png',log:'assets/decorate/forest/current/forest-fallen-log-v1.png'};
function prop(kind,i,j,w,h){
 const x=667+(i-j)*64,y=95+(i+j)*32+32;
 const p=image(kind+props.length,assets[kind],x-w/2,y-h,w,h);p.zIndex=Math.round(y);props.push(p);
 shadows.push(image('ContactShadow'+props.length,'assets/spine/Zombies/zombie_type_1/images/1/shadow.png',x-w*.32,y-6,w*.75,kind==='pine'?22:14,.24));
}
prop('pine',.4,1.6,112,177);prop('pine',.35,3.35,125,195);prop('pine',6.7,.3,110,174);prop('pine',5,7,88,139);
prop('shrub',.1,2.5,69,59);prop('shrub',4.25,.2,63,54);prop('shrub',4.4,6.8,58,50);
prop('rocks',4.6,2.2,66,66);prop('rocks',4.75,3.8,51,51);prop('rocks',4.8,5.6,59,59);
prop('rocks',2.1,3.2,62,62);prop('log',1.4,5.4,102,54);
props.sort((a,b)=>a.zIndex-b.zIndex);
scene._$child.unshift(foundation);
scene._$child.push({'_$id':id('shadows'),'_$type':'Sprite',name:'ContactShadows','_$child':shadows},{'_$id':id('props'),'_$type':'Sprite',name:'ForestProps','_$child':props});
fs.writeFileSync('.tmp/forest-iso/edit.json',JSON.stringify({name:'Laya_EditAsset',arguments:{file_path:'assets/forest-isometric-study/forest-isometric-study.ls',ops:[{op:'replace',path:'',value:JSON.stringify(scene)}]}}));
console.log('64 original forest cells; soil foundation; '+props.length+' upright props with contact shadows');
