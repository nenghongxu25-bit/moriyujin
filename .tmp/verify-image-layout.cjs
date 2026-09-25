const fs=require('fs'),path=require('path'),crypto=require('crypto');
const p=JSON.parse(fs.readFileSync('.tmp/image-layout-plan.json','utf8'));const errors=[];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const m of p.moves){
 if(!fs.existsSync(m.to)){errors.push('Missing '+m.to);continue;}
 if(/\.(png|jpg)$/.test(m.to)&&hash(m.to)!==m.hash)errors.push('Pixels changed '+m.to);
 if(m.uuid&&JSON.parse(fs.readFileSync(m.to+'.meta','utf8').replace(/^\uFEFF/,'')).uuid!==m.uuid)errors.push('UUID changed '+m.to);
 if(fs.existsSync(m.from))errors.push('Old file remains '+m.from);
}
for(const file of ['assets/animation/fire/campfire-animation.json','assets/animation/fire/torch-animation.json']){
 const data=JSON.parse(fs.readFileSync(file,'utf8'));for(const key of ['image','body'])if(!fs.existsSync(path.resolve(path.dirname(file),data[key])))errors.push('Broken preview '+file+': '+data[key]);
}
const json=JSON.parse(fs.readFileSync('assets/animation/container/old_safe_open/animation.json','utf8').replace(/^\uFEFF/,''));for(const frame of json.frames)if(!fs.existsSync('assets/animation/container/old_safe_open/'+frame))errors.push('Missing frame '+frame);
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{if(['dist','node_modules'].includes(e.name))return [];const f=d+'/'+e.name;return e.isDirectory()?walk(f):[f];});}
for(const f of ['src','assets','tools','settings'].flatMap(walk).filter(f=>/\.(ts|js|json|ls|lh|tres|html|py|cjs)$/.test(f)&&!f.endsWith('LegacyItemIconAliases.ts')&&!f.startsWith('assets/libs/')&&!f.startsWith('assets/editorResources/'))){
 const s=fs.readFileSync(f,'utf8');for(const m of p.moves.filter(m=>m.from.startsWith('assets/')))if(s.includes(m.from.slice(7)))errors.push('Old path '+f+' => '+m.from);
}
console.log(JSON.stringify({files:p.moves.length,images:p.moves.filter(m=>/\.(png|jpg)$/.test(m.to)).length,errors},null,2));if(errors.length)process.exitCode=1;
