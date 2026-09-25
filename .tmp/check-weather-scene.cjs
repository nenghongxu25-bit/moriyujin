const fs=require('fs');
const scene=JSON.parse(fs.readFileSync('assets/forest-isometric-study/forest-isometric-study.ls','utf8'));
const forest=JSON.parse(fs.readFileSync('assets/scenes/forest.ls','utf8'));
const find=(n,id)=>n._$id===id?n:(n._$child||[]).map(c=>find(c,id)).find(Boolean);
const ground=find(scene,'forestIsoTiles');
const rain=process.argv[2]==='rain';
for(const id of [rain?'groundrainpreview':'groundsnowpreview']) {
 const n=structuredClone(find(forest,id)), c=n._$comp[0];
 n.active=true; n.alpha=0;
 c.groundNode={_$ref:ground._$id}; c.autoAccumulate=false; c.edgeFeather=1;
 if(id==='groundsnowpreview') c.coverage=0.7;
 else {c.wetness=1; c.playerNode=null; c.footRipples=false;}
 scene._$child.splice(2,0,n);
}
const weather=structuredClone(forest._$child.find(n=>n.name==='ScreenWeatherArea'));
const particles=weather._$child[0]._$child;
particles[0].active=rain; particles[1].active=!rain;
scene._$child.push(weather);
scene.name=rain?'ForestRainPreview':'ForestSnowPreview';
fs.writeFileSync('assets/forest-isometric-study/'+(rain?'rain':'snow')+'-preview.ls',JSON.stringify(scene,null,2));
