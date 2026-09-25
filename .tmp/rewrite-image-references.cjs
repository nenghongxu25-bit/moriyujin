const fs=require('fs'),path=require('path'),crypto=require('crypto');
const plan=JSON.parse(fs.readFileSync('.tmp/image-cleanup-plan.json','utf8'));
const backup=path.resolve(plan.backup,'before');
function preserve(p){const to=path.join(backup,p);fs.mkdirSync(path.dirname(to),{recursive:true});if(!fs.existsSync(to))fs.copyFileSync(p,to);}
for(const entry of [...plan.moves,...plan.duplicates]){
 if(entry.hash&&crypto.createHash('sha256').update(fs.readFileSync(entry.from)).digest('hex')!==entry.hash)throw Error('Source changed '+entry.from);
 preserve(entry.from);if(fs.existsSync(entry.from+'.meta'))preserve(entry.from+'.meta');
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(['node_modules','dist'].includes(e.name))return [];const p=dir+'/'+e.name;return e.isDirectory()?walk(p):[p];});}
const replacements=[...plan.replacements].sort((a,b)=>b[0].length-a[0].length);
const changed=[];
for(const p of ['src','assets','settings','tools','docs'].flatMap(walk)){
 if(!/\.(ts|js|cjs|json|ls|lh|tres|lmat|md|html|py|ps1)$/.test(p)||p.includes('/LegacyItemIconAliases.ts')||p.startsWith('assets/spine/')||p.startsWith('assets/libs/'))continue;
 const original=fs.readFileSync(p,'utf8');let next=original;
 for(const [from,to] of replacements)next=next.split(from).join(to);
 if(p==='settings/BuildSettings.json'){
  const json=JSON.parse(next.replace(/^\uFEFF/,''));json.alwaysIncluded=[...new Set(json.alwaysIncluded)];next=JSON.stringify(json,null,2)+'\n';
 }
 if(next!==original){preserve(p);fs.writeFileSync(p,next);changed.push(p);}
}
fs.writeFileSync('.tmp/image-cleanup-changed.json',JSON.stringify(changed,null,2));
console.log(JSON.stringify({changed},null,2));
