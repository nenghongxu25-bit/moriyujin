const fs=require('fs'),crypto=require('crypto');
const dir='assets/tileset/forest-style-v2-hd';
function uuid(p,texture=false){
 if(!fs.existsSync(p+'.meta'))fs.writeFileSync(p+'.meta',JSON.stringify({uuid:crypto.randomUUID(),...(texture?{importer:{textureType:2}}:{})},null,2));
 return JSON.parse(fs.readFileSync(p+'.meta','utf8')).uuid;
}
const set=JSON.parse(fs.readFileSync('assets/tileset/forest-style-v2/forest-diamond.tres','utf8'));
set.tileSize.x*=2;set.tileSize.y*=2;
const group=set.groups[0];group.atlas._$uuid=uuid(dir+'/tiles/forest-diamond-atlas.png',true);
for(const key of ['atlasSize','textureRegionSize','margin','separation']){group[key].x*=2;group[key].y*=2;}
fs.writeFileSync(dir+'/forest-diamond.tres',JSON.stringify(set,null,2));
const id=uuid(dir+'/forest-diamond.tres');
const scene=JSON.parse(fs.readFileSync('assets/forest-style-v2-preview.ls','utf8'));
function walk(n){for(const c of n._$comp||[])if(c._$type==='TileMapLayer'){
 c.tileSet._$uuid=id;n.scaleX=(n.scaleX??1)*.5;n.scaleY=(n.scaleY??1)*.5;
}for(const c of n._$child||[])walk(c);}
walk(scene);scene.name='ForestTerrainHighDetail';
fs.writeFileSync('assets/forest-style-hd-preview.ls',JSON.stringify(scene,null,2));
console.log('HD texture dimensions doubled; ground transform halved; all painted cell IDs preserved.');
