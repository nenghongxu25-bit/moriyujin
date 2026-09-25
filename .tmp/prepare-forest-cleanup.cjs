const fs=require('fs');
const report=JSON.parse(fs.readFileSync('.tmp/forest-cleanup-audit.json','utf8'));
const map={
 'assets/forest-isometric-study/forest-diamond.tres':'assets/tileset/forest/forest-diamond.tres',
 'assets/forest-isometric-study/tiles/forest-diamond-atlas.png':'assets/tileset/forest/forest-diamond-atlas.png',
 'assets/tileset/forest/water-flow.png':'assets/tileset/forest/water-flow.png',
 'assets/tileset/forest-kit-v3/grass-water.png':'assets/tileset/forest/rain-water.png',
 'assets/tileset/forest-kit-v3/grass-dirt.png':'assets/tileset/forest/reference/grass-dirt.png',
 'assets/tileset/forest-style-v2-hd/forest-diamond.tres':'assets/tileset/buildings/floors/terrain/terrain-diamond.tres',
 'assets/tileset/forest-style-v2-hd/tiles/forest-diamond-atlas.png':'assets/tileset/buildings/floors/terrain/terrain-diamond-atlas.png'
};
for(const entry of report.keep)if(!map[entry.path])throw Error('Unmapped used asset '+entry.path);
fs.writeFileSync('.tmp/forest-cleanup-plan.json',JSON.stringify({archive:'backups/forest-atlas-cleanup-20260921',directories:report.candidates,files:Object.entries(map).map(([from,to])=>({from,to}))},null,2));
