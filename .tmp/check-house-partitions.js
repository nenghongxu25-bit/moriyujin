(()=>{
 const scene=Laya.Scene.root.children.find(n=>n.url==='scenes/city.ls');let actor;const walls=[],obstacles=[];
 function walk(n){for(const c of n.components||n._components||[]){if(c.surfaces&&c.pieces)walls.push(c);if(typeof c.indexStaticWall==='function')obstacles.push(c);if(c.constructor.name==='PlayerController')actor=n;}for(const child of n.children)walk(child);}walk(scene);
 if(!actor||!obstacles.length)throw Error('Missing city runtime');
 const Type=obstacles[0].constructor,Wall=walls[0].constructor,parent=actor.parent;
 const result={houses:walls.length,registeredWalls:0,queries:0,preciseChecks:0,referenceAgrees:true};
 for(const index of Type.walls.values())result.registeredWalls+=index.grid.count;
 const originals=obstacles.map(o=>o.blocks);
 try{
  obstacles.forEach((o,i)=>{o.blocks=function(...args){result.preciseChecks++;return originals[i].apply(this,args);};});
  for(let i=0;i<100;i++){
   const x=actor.x+Math.sin(i)*120,y=actor.y+Math.cos(i)*120,args=[actor,x,y,x+2,y+2,12,30,20];
   const actual=Type.blocksMove(...args);result.queries++;
   const expected=obstacles.some((o,j)=>originals[j].apply(o,args));if(actual!==expected)result.referenceAgrees=false;
  }
  Wall.canSeeGround(parent,actor.x,actor.y,actor.x+100,actor.y+100);
  const sight=Wall.sightIndexes.get(parent);
  result.sightRegistered=sight?.grid.count;
  result.sightCandidates=Array.from(sight.grid.query(actor.x-100,actor.y-100,actor.x+100,actor.y+100)).length;
  result.farHouses=walls.filter(w=>!w.surfaces.some(s=>s.nodes?.length||s.caps?.length)).length;
  return result;
 }finally{obstacles.forEach((o,i)=>o.blocks=originals[i]);}
})()
