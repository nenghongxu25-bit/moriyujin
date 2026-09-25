(async()=>{
 let scene=Laya.Scene.root.children.find(n=>n.url==='scenes/city.ls');if(!scene)scene=await Laya.Scene.open('scenes/city.ls');
 await new Promise(r=>setTimeout(r,1200));
 const counts={},rooms=[],walls=[];let total=0;
 function walk(n){total++;counts[n.name]=(counts[n.name]||0)+1;
 for(const c of n.components||n._components||[]){
 if(c.renderPatches&&c.patches)rooms.push({name:n.name,all:c.patches.length,rendered:c.renderPatches.length,window:c.renderWindow,bounds:n.getBounds(),blackBounds:c.black.getBounds()});
 if(c.surfaces&&c.pieces)walls.push({name:n.parent.name,cells:c.surfaces.length,visible:c.surfaces.filter(s=>s.nodes?.length||s.caps?.length).length,collision:c.pieces.length});
 }for(const c of n.children)walk(c);}walk(scene);
 return {fps:Laya.Stat.FPS,total,wallVisuals:counts.BrickWallVisual||0,wallCaps:counts.BrickWallCap||0,footprints:counts.BrickWallFootprint||0,rooms,walls};
})()
