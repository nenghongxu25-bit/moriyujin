const fs=require('fs'),path=require('path'),assert=require('assert');
const back=process.argv[2]||'backups/survival-pages-v1';
function files(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(p,e.name)):[path.join(p,e.name)]);}
let count=0;
function compare(a,b,where){
 assert(b,'Missing node '+where);
 for(const k of ['_$id','_$prefab','_$comp','active','visible'])assert.deepStrictEqual(b[k],a[k],where+' changed '+k);
 (a._$child||[]).forEach((c,i)=>{const match=(b._$child||[]).find(n=>c._$id?n._$id===c._$id:JSON.stringify(n._$override)===JSON.stringify(c._$override));compare(c,match,where+'/'+(c._$id||JSON.stringify(c._$override)||i));});
}
for(const p of files(back).filter(p=>/\.(lh|ls)$/.test(p))){const current=path.relative(back,p);compare(JSON.parse(fs.readFileSync(p)),JSON.parse(fs.readFileSync(current)),current);count++;}
console.log(`PASS: ${count} authored assets retain original node IDs, components, bindings and active/visible states.`);
