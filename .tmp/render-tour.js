(async()=>{
 const scene=Laya.Scene.root.children.find(n=>n.url==='scenes/city.ls'),nodes=[];
 function walk(n){nodes.push(n);for(const c of n.children)walk(c);}walk(scene);
 const player=nodes.find(n=>(n.components||n._components||[]).some(c=>c.constructor.name==='PlayerController'));
 if(!player)return {error:'PlayerController not found'};
 const controller=(player.components||player._components).find(c=>c.constructor.name==='PlayerController');
 const houses=nodes.filter(n=>n.getChildByName('RoomRegions')&&n.getChildByName('RoofLayer'));
 const world=nodes.find(n=>n.name==='ActorLayer');const saved={x:player.x,y:player.y,wx:world.x,wy:world.y},results=[];
 let lost=false;const canvas=document.querySelector('canvas');const onLost=()=>lost=true;canvas.addEventListener('webglcontextlost',onLost);
 try{for(const house of [houses[0],houses[3],houses[5],houses[0]]){
 const region=house.getChildByName('RoomRegions').children[0],map=region.getComponent(Laya.TileMapLayer),points=[];
 for(const row of Object.values(map._chunkDatas))for(const chunk of Object.values(row))for(const indices of Object.values(chunk.compressData))if(Array.isArray(indices))for(const i of indices){const p=new Laya.Vector2();map.gridToPixel(chunk.chunkX*map.renderTileSize+i%map.renderTileSize,chunk.chunkY*map.renderTileSize+Math.floor(i/map.renderTileSize),p);points.push(p);}
 const cx=points.reduce((a,p)=>a+p.x,0)/points.length,cy=points.reduce((a,p)=>a+p.y,0)/points.length;
 points.sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy));
 const foot=player.parent.globalToLocal(region.localToGlobal(new Laya.Point(points[0].x,points[0].y),false),false);
 player.pos(foot.x,foot.y-controller.tileBlockFootOffsetY);
 await new Promise(r=>setTimeout(r,1200));
 let visual=0;function count(n){if(n.name==='BrickWallVisual'||n.name==='BrickWallCap')visual++;for(const c of n.children)count(c);}count(scene);
 const shade=nodes.flatMap(n=>n.components||n._components||[]).find(c=>c.renderWindow&&c.renderPatches);
 results.push({house:house.name,roofAlpha:house.getChildByName('RoofLayer').alpha,visual,window:shade?.renderWindow,visiblePatches:shade?.renderPatches.length,fps:Laya.Stat.FPS,lost});
 }}finally{player.pos(saved.x,saved.y);world.pos(saved.wx,saved.wy);canvas.removeEventListener('webglcontextlost',onLost);}
 return results;
})()
