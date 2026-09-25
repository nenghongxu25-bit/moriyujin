(async()=>{
 let scene=Laya.Scene.root.children.find(n=>n.url==='scenes/city.ls');if(!scene)scene=await Laya.Scene.open('scenes/city.ls');
 await new Promise(r=>setTimeout(r,1500));
 const nodes=[];function walk(n){nodes.push(n);for(const c of n.children)walk(c);}walk(scene);
 const comps=nodes.flatMap(n=>n.components||n._components||[]),player=comps.find(c=>c.constructor.name==='PlayerController')?.owner;
 if(!player)return {error:'missing player'};
 const shade=comps.find(c=>c.renderPatches&&c.patches),walls=comps.filter(c=>c.surfaces&&c.pieces),restore=[];
 let stats;const saved={x:player.x,y:player.y};
 const refresh=shade.refreshRenderWindow;
 shade.refreshRenderWindow=function(...a){const old=this.renderWindow,t=performance.now(),r=refresh.apply(this,a);if(stats){stats.refreshMs+=performance.now()-t;if(old!==this.renderWindow)stats.rebuilds++;}return r;};restore.push(()=>shade.refreshRenderWindow=refresh);
 for(const wall of walls)for(const s of wall.surfaces)for(const name of ['buildVisual','clearVisual']){const fn=s[name];s[name]=function(...args){const t=performance.now(),r=fn.apply(this,args);if(stats){stats[name]++;stats.wallMs+=performance.now()-t;}return r;};restore.push(()=>s[name]=fn);}
 const results=[];
 try{for(const moving of [true]){
 stats={moving,rebuilds:0,refreshMs:0,buildVisual:0,clearVisual:0,wallMs:0};
 const frames=[];let previous=performance.now();
 for(let i=0;i<150;i++){await new Promise(requestAnimationFrame);const now=performance.now();frames.push(now-previous);previous=now;if(moving)player.pos(saved.x+Math.sin(i/149*Math.PI*2)*240,saved.y+Math.sin(i/149*Math.PI*4)*70);}
 frames.sort((a,b)=>a-b);results.push({...stats,meanMs:frames.reduce((a,b)=>a+b,0)/frames.length,p95Ms:frames[Math.floor(frames.length*.95)],maxMs:frames[frames.length-1],frames:frames.length});
 }}finally{player.pos(saved.x,saved.y);for(const fn of restore)fn();}
 return results;
})()
