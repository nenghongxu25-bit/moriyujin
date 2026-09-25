module.exports=async(evaluate,call)=>{
 await evaluate(`globalThis.__sidebarCalls=0;globalThis.tt={navigateToScene:()=>{globalThis.__sidebarCalls++;}}`);
 for(const name of ['buttonmodule','CloseSprite']){
  const p=await evaluate(`(()=>{const n=welfare.getChildByName('${name}'),p=n.localToGlobal(new Laya.Point(n.width/2,n.height/2)),r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+p.x*r.width/Laya.stage.width,y:r.y+p.y*r.height/Laya.stage.height};})()`);
  for(const type of ['mousePressed','mouseReleased'])await call('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});
 }
 const result=await evaluate(`({sidebarCalls:__sidebarCalls,closed:!welfare.visible})`);
 if(result.sidebarCalls!==1||!result.closed)throw Error(JSON.stringify(result));
 console.log('PASS: sidebar button center clicks once; close button center closes panel');
};
