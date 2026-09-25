// Fix explicit image sizing after the first runtime import; no gameplay changes.
const fs=require('fs');
const dir='assets/prefab/prefab-ui/';
const ids=new Set(fs.readdirSync('assets/ui/survival-hud').filter(x=>x.endsWith('.png.meta')).map(x=>'res://'+JSON.parse(fs.readFileSync('assets/ui/survival-hud/'+x)).uuid));
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.lh'))){
 const p=dir+f,d=JSON.parse(fs.readFileSync(p));let changed=false;
 function walk(n){if(ids.has(n.src)){n.autoSize=false;changed=true;}(n._$child||[]).forEach(walk);}
 walk(d);if(changed)fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
}
