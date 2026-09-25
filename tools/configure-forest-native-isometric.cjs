// Build MCP requests only. No direct writes to Laya scene/TileSet resources.
const fs=require('fs');
const folder='assets/forest-isometric-study';
const uuid=p=>JSON.parse(fs.readFileSync(p+'.meta','utf8')).uuid;
const tileset=JSON.parse(fs.readFileSync('assets/tileset/forest/forest.tres','utf8'));
tileset.tileShape=1;tileset.tileSize.x=128;tileset.tileSize.y=64;
const group=tileset.groups[0];
group.atlas._$uuid=uuid(`${folder}/tiles/forest-diamond-atlas.png`);
group.atlasSize={...group.atlasSize,x:792,y:612};
group.textureRegionSize.x=128;group.textureRegionSize.y=64;
group.margin={_$type:'Vector2',x:2,y:2};group.separation={_$type:'Vector2',x:4,y:4};
const finalPath=`${folder}/forest-diamond.tres`;
const draft=fs.existsSync(finalPath)?finalPath:`${folder}/forest-diamond-import.json`;
const calls=[{name:'Laya_EditAsset',arguments:{file_path:draft,ops:[{op:'replace',path:'',value:JSON.stringify(tileset)}]}}];
if(draft!==finalPath)calls.push({name:'AssetManagement',arguments:{action:'renameAsset',source:draft,newName:'forest-diamond.tres'}});
const region=JSON.parse(fs.readFileSync('.tmp/forest-iso/region.json','utf8'));
const scene=JSON.parse(fs.readFileSync(`${folder}/forest-isometric-study.ls`,'utf8'));
const view=scene._$child.find(n=>n._$id==='forestIsoView');
view.name='NativeIsometricGround';view.x=91;view.y=95;view.scaleX=1;view.scaleY=1;
const ground=view._$child[0];ground.name='ForestDiamondTiles_8x8';ground.rotation=0;ground.scaleX=1;ground.scaleY=1;
const component=ground._$comp.find(c=>c._$type==='TileMapLayer');
component.tileSet._$uuid=uuid(draft);
const compressData={_$type:'Record'},transFlags={_$type:'Record'};
for(const c of region.cells){
 const i=c.x-region.x,j=c.y-region.y;
 const nativeX=4+Math.floor((i-j)/2),nativeY=i+j,local=nativeY*32+nativeX;
 // Laya's isometric coordinates use staggered rows, not rotated square indices.
 if(c.flag!==0)throw Error('Handle transformed source cells explicitly before baking');
 (compressData[c.gid]??=[]).push(local);transFlags[local]=0;
}
component.chunkDatas={_$type:'Record','0':{_$type:'Record','0':{_$type:'TileMapChunkData',chunkX:0,chunkY:0,compressData,transFlags}}};
calls.push({name:'Laya_EditAsset',arguments:{file_path:`${folder}/forest-isometric-study.ls`,ops:[{op:'replace',path:'',value:JSON.stringify(scene)}]}});
fs.mkdirSync('.tmp/forest-native-iso',{recursive:true});fs.writeFileSync('.tmp/forest-native-iso/requests.json',JSON.stringify(calls));
console.log('Native diamond TileSet, 54 tiles, 64 mapped cells, no layer rotation or squash');
