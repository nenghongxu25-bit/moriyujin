const fs=require('fs');
(async()=>{
 const tabs=await(await fetch('http://localhost:9234/json')).json();
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
 let id=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const mode=process.argv[2];
 if(mode==='open'){
  await call('Page.enable');await call('Page.navigate',{url:'http://localhost:18090/'});
  for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,250));if(await evaluate('!!globalThis.Laya?.stage'))break;}
  console.log(await evaluate("Laya.Scene.open('spatial-inventory-study/spatial-inventory-preview.ls',true).then(()=> 'opened')"));
 }else if(mode==='eval')console.log(JSON.stringify(await evaluate(fs.readFileSync(process.argv[3],'utf8'))));
 else if(mode==='shot'){const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(process.argv[3],Buffer.from(shot.data,'base64'));console.log(process.argv[3]);}
 else if(mode==='mouse'){const [x,y]=process.argv.slice(4).map(Number);await call('Input.dispatchMouseEvent',{type:process.argv[3],x,y,button:process.argv[3]==='mouseMoved'?'none':'left',buttons:process.argv[3]==='mouseReleased'?0:1,clickCount:1});}
 else if(mode==='key'){await call('Input.dispatchKeyEvent',{type:'keyDown',key:process.argv[3],code:'Key'+process.argv[3].toUpperCase(),windowsVirtualKeyCode:process.argv[3].toUpperCase().charCodeAt(0)});await call('Input.dispatchKeyEvent',{type:'keyUp',key:process.argv[3],windowsVirtualKeyCode:process.argv[3].toUpperCase().charCodeAt(0)});}
 else if(mode==='test')await require('./spatial-ui-tests.cjs')(evaluate,call);
 else if(mode==='welfare-test')await require('./welfare-ui-test.cjs')(evaluate,call);
 else if(mode==='close')await call('Browser.close');
 ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
