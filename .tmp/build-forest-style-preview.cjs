const fs=require('fs'),crypto=require('crypto');
const dir='assets/tileset/forest-style-v2';
const meta=p=>{if(!fs.existsSync(p+'.meta'))fs.writeFileSync(p+'.meta',JSON.stringify({uuid:crypto.randomUUID()},null,2));return JSON.parse(fs.readFileSync(p+'.meta','utf8')).uuid};
const atlas=dir+'/tiles/forest-diamond-atlas.png';
const set=JSON.parse(fs.readFileSync('assets/forest-isometric-study/forest-diamond.tres','utf8'));
set.groups[0].atlas._$uuid=meta(atlas);
fs.writeFileSync(dir+'/forest-diamond.tres',JSON.stringify(set,null,2));
const uuid=meta(dir+'/forest-diamond.tres');
const scene=JSON.parse(fs.readFileSync('assets/forest-isometric-study/forest-isometric-study.ls','utf8'));
function walk(n){for(const c of n._$comp||[])if(c._$type==='TileMapLayer')c.tileSet._$uuid=uuid;for(const c of n._$child||[])walk(c)}
walk(scene);scene.name='ForestTerrainStyleV2';
fs.writeFileSync('assets/forest-style-v2-preview.ls',JSON.stringify(scene,null,2));
console.log('Style preview ready: 54 tiles, original scene layout, new atlas UUID '+set.groups[0].atlas._$uuid);
