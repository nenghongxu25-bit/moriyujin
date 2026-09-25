const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const backup='backups/survival-hud-v1/assets/prefab/prefab-ui';
function index(root){const map=new Map();function walk(n){if(n._$id)map.set(n._$id,n);(n._$child||[]).forEach(walk);}walk(root);return map;}
for(const f of fs.readdirSync(backup).filter(n=>n.endsWith('.lh'))){
 const before=index(JSON.parse(fs.readFileSync(path.join(backup,f)))),after=index(JSON.parse(fs.readFileSync('assets/prefab/prefab-ui/'+f)));
 for(const [id,node] of before){assert.ok(after.has(id),f+': removed node '+id);assert.deepEqual(after.get(id)._$comp,node._$comp,f+': changed component bindings '+id);}
}
const hud=index(JSON.parse(fs.readFileSync('assets/prefab/prefab-ui/play_ui.lh')));
assert.equal(hud.get('run_ui').active,false,'do not enable unused gameplay control');
for(const id of ['bag_ui','ej1msfiy','asq102c8','1g66j51m']){
 const n=hud.get(id),size=id==='1g66j51m'?100:128;
 assert.ok(n.x>=0&&n.y>=0&&n.x+size*(n.scaleX||1)<=1334&&n.y+size*(n.scaleY||1)<=750,'HUD within design viewport '+id);
}
for(const id of ['hud_profile_back','wc0jzlul'])assert.equal(hud.get(id).autoSize,false);
const joy=index(JSON.parse(fs.readFileSync('assets/prefab/prefab-ui/pre-joystick.lh')));
assert.equal(joy.get('sunnmstt').width/2,joy.get('97atdkiz').x,'joystick handle and controller centre agree');
assert.equal(joy.get('sunnmstt').height/2,joy.get('97atdkiz').y);
console.log('Survival HUD: original node IDs/components preserved, viewport bounds and joystick geometry passed.');
