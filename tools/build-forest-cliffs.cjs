// Configure the generated PNG as real TileMapLayer tiles; never modifies source pixels.
const fs = require('fs');
const crypto = require('crypto');
const dir = 'assets/tileset/forest-cliffs-v1';
const write = (p, value) => fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
const meta = (p, importer) => {
  if (!fs.existsSync(p + '.meta')) write(p + '.meta', {uuid: crypto.randomUUID(), ...(importer ? {importer} : {})});
  return JSON.parse(fs.readFileSync(p + '.meta', 'utf8')).uuid;
};
const png = fs.readFileSync(dir + '/forest-cliff-wall.png');
const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
if (width !== height || width % 3) throw Error('Atlas must have an exact 3x3 layout');
const cell = width / 3;
const textureID = meta(dir + '/forest-cliff-wall.png', {textureType: 2});
const source = JSON.parse(fs.readFileSync('assets/tileset/forest/forest.tres', 'utf8'));
const tileset = structuredClone(source);
tileset.tileSize = {_$type:'Vector2', x:cell, y:cell};
const g = tileset.groups[0];
g.atlas._$uuid = textureID;
g.atlasSize = {_$type:'Vector2', x:width, y:height};
g.textureRegionSize = {_$type:'Vector2', x:cell, y:cell};
g._maxCellCount = {_$type:'Vector2', x:3, y:3};
g._maxAlternativesCount = 9;
g.tiles = {_$type:'Record'};
for (let y=0; y<3; y++) {
  g.tiles[y] = {_$type:'Record'};
  for (let x=0; x<3; x++) {
    const t = structuredClone(source.groups[0].tiles[0][0]);
    t.localPos = {_$type:'Vector2', x, y};
    g.tiles[y][x] = t;
  }
}
write(dir + '/forest-cliff-wall.tres', tileset);
const wallID = meta(dir + '/forest-cliff-wall.tres');
const groundID = JSON.parse(fs.readFileSync('assets/tileset/forest/forest.tres.meta', 'utf8')).uuid;
const id = s => crypto.createHash('sha256').update('forest-cliff-v1:'+s).digest('hex').slice(0,12);
function layer(name, x, y, nativeCell, displayCell, tileID, cells) {
  const compressData = {_$type:'Record'}, transFlags = {_$type:'Record'};
  for (const c of cells) {
    const index = c.y*32+c.x;
    (compressData[c.gid] ||= []).push(index);
    transFlags[index] = c.flag || 0;
  }
  return {_$id:id(name), _$type:'Sprite', name, x,y, scaleX:displayCell/nativeCell, scaleY:displayCell/nativeCell,
    _$comp:[{_$type:'TileMapLayer', layer:0, tileSet:{_$uuid:tileID, _$type:'TileSet'},
      chunkDatas:{_$type:'Record', 0:{_$type:'Record',0:{_$type:'TileMapChunkData',chunkX:0,chunkY:0,compressData,transFlags}}}}]};
}
function wall(name,x,y,w,h,displayCell) {
  if(w%2!==1 || h%2!==1) throw Error('Mirrored extension requires odd dimensions');
  const cells=[];
  for(let j=0;j<h;j++) for(let i=0;i<w;i++) {
    const sx=i===0?0:i===w-1?2:1, sy=j===0?0:j===h-1?2:1;
    // Alternate middle pieces to join identical texel edges without editing the PNG.
    const flag=(sx===1 && i%2===0?8:0)|(sy===1 && j%2===0?16:0);
    cells.push({x:i,y:j,gid:sy*3+sx,flag});
  }
  return layer(name,x,y,cell,displayCell,wallID,cells);
}
const ground=[];
for(let x=0;x<7;x++)ground.push({x,y:0,gid:10});
const scene={_$ver:1,_$id:id('scene'),_$type:'Scene',name:'ForestCliffTilesPreview',width:1334,height:750,left:0,right:0,top:0,bottom:0,
  _$comp:[{_$type:'86fb35d4-bffe-4012-bc9f-85f003b0b723'}],
  _$child:[
    layer('ExistingForestGrass',275,90,128,112,groundID,ground),
    wall('WideWall_7x3',275,190,7,3,112),
    wall('TallWall_3x5',48,205,3,5,60),
    ...Array.from({length:9},(_,i)=>layer('Tile_'+i,145+i*116,588,cell,92,wallID,[{x:0,y:0,gid:i}]))
  ]};
write(dir+'/forest-cliff-demo.ls',scene);
meta(dir+'/forest-cliff-demo.ls');
write(dir+'/layout.json',{atlas:'forest-cliff-wall.png',width,height,cellSize:cell,columns:3,rows:3,worldCellSize:128,layerScale:128/cell,
  tiles:['top-left','grass-top','top-right','left-edge','earth-fill','right-edge','bottom-left','rubble-bottom','bottom-right'],
  notes:'Manual nine-slice wall facade. Middle spans alternate horizontal/vertical flips. No automatic terrain rules or collision.'});
console.log(JSON.stringify({width,height,cell,wallID,textureID,scene:dir+'/forest-cliff-demo.ls'}));
