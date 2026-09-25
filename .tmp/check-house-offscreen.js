(()=>{
 const scene=Laya.Scene.root.children.find(n=>n.url==='scenes/city.ls');
 const walls=[],obstacles=[];let actor;
 function walk(n){for(const c of n.components||n._components||[]){if(c.surfaces&&c.pieces)walls.push(c);if(typeof c.blocks==='function'&&'blockWidth' in c)obstacles.push(c);if(c.constructor.name==='PlayerController')actor=n;}for(const child of n.children)walk(child);}walk(scene);
 if(!actor)throw Error('No runtime player');
 const result={houses:walls.length,obstacles:obstacles.length,farHouses:walls.filter(w=>!w.surfaces.some(s=>s.nodes?.length||s.caps?.length)).length,capSurfaceScans:0,collisionCoordinateTransforms:0};
 const restore=[];
 try{
  for(const w of walls)w.updateCaps();
  for(const w of walls){const value=w.surfaces;Object.defineProperty(w,'surfaces',{configurable:true,get(){result.capSurfaceScans++;return value;}});restore.push(()=>Object.defineProperty(w,'surfaces',{configurable:true,writable:true,value}));}
  for(let i=0;i<100;i++)for(const w of walls)w.updateCaps();
  for(const o of obstacles){const node=o.owner,original=node.globalToLocal;node.globalToLocal=function(...args){result.collisionCoordinateTransforms++;return original.apply(this,args);};restore.push(()=>{node.globalToLocal=original;});}
  for(const o of obstacles)o.blocks(actor,-100000,-100000,-99999,-99999,12,30,20);
  result.optimizationLoaded=obstacles[0]?.blocks.toString().includes('support');
  return result;
 }finally{for(const r of restore.reverse())r();}
})()
