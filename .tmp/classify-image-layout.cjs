const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=process.cwd();
const backup='.tmp/image-layout-backup-20260919';
const moves=[];
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=dir+'/'+e.name;return e.isDirectory()?walk(p):[p];});}
function add(from,to){if(!fs.existsSync(from))return;if(fs.existsSync(to))throw Error('Destination exists '+to);let uuid;try{uuid=JSON.parse(fs.readFileSync(from+'.meta','utf8').replace(/^\uFEFF/,'')).uuid;}catch{}moves.push({from,to,hash:hash(from),uuid});}
function group(from,to){for(const p of walk(from).filter(p=>!p.endsWith('.meta')))add(p,to+p.slice(from.length));}
group('assets/atlas/picture/interacts/containers/old_safe_open','assets/animation/container/old_safe_open');
for(const p of walk('assets/atlas/picture/interacts/containers').filter(p=>!p.endsWith('.meta')&&!p.includes('/old_safe_open/')))add(p,p.replace('assets/atlas/picture/interacts/containers','assets/container'));
group('assets/atlas/picture/interacts/harvestables','assets/decorate/harvestables');
group('assets/atlas/picture/decorate','assets/decorate/ground');
group('assets/atlas/picture/environment','assets/decorate');
group('assets/atlas/picture/effects/weather','assets/animation/weather');
group('assets/xuliezhen','assets/animation/ui');
for(const p of walk('assets/atlas/picture/effects/fire').filter(p=>!p.endsWith('.meta'))){
 const relative=p.slice('assets/atlas/picture/effects/fire/'.length);
 const target=['campfire-base.png','torch-body.png','torch-concept.png'].includes(relative)?'assets/decorate/fire/':'assets/animation/fire/';
 add(p,target+relative);
}
group('art-library/images/environment','art-library/images/decorate');
group('art-library/images/containers','art-library/images/container');
const preview='art-library/images/previews/forest-tileset-preview-v1.png';add(preview,'art-library/images/tileset/previews/forest-tileset-preview-v1.png');
if(new Set(moves.map(m=>m.to)).size!==moves.length)throw Error('Duplicate target');
fs.mkdirSync(backup,{recursive:true});
function preserve(p){const to=backup+'/before/'+p;fs.mkdirSync(path.dirname(to),{recursive:true});if(!fs.existsSync(to))fs.copyFileSync(p,to);}
for(const m of moves){preserve(m.from);if(fs.existsSync(m.from+'.meta'))preserve(m.from+'.meta');}
const moved=new Map(moves.map(m=>[m.from,m.to]));
const replacements=moves.flatMap(m=>[[m.from,m.to],...(m.from.startsWith('assets/')?[[m.from.slice(7),m.to.slice(7)]]:[])]).sort((a,b)=>b[0].length-a[0].length);
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const replacementMap=new Map(replacements);
const pattern=new RegExp(replacements.map(([p])=>escaped(p)).join('|'),'g');
const changed=[];
for(const p of ['assets','src','tools','settings','art-library'].flatMap(walk)){
 if(!/\.(ts|js|cjs|json|ls|lh|tres|lmat|html|md|py|ps1)$/.test(p)||p.includes('/LegacyItemIconAliases.ts')||p.startsWith('assets/libs/')||p.startsWith('assets/editorResources/')||p.startsWith('assets/spine/'))continue;
 const original=fs.readFileSync(p,'utf8');let next=original.replace(pattern,s=>replacementMap.get(s));
 // Adjust literal relative resource links when the referring preview/config moves.
 if(moved.has(p))next=next.replace(/(["'])([^"'\r\n]+\.(?:png|jpg|json|html))\1/g,(match,quote,value)=>{
   if(value.includes('://')||path.isAbsolute(value))return match;
   const source=path.posix.normalize(path.posix.join(path.posix.dirname(p),value));
   if(!moved.has(source))return match;
   return quote+path.posix.relative(path.posix.dirname(moved.get(p)),moved.get(source))+quote;
 });
 if(next!==original){preserve(p);fs.writeFileSync(p,next);changed.push(p);}
}
const plan={backup,moves,changed};fs.writeFileSync('.tmp/image-layout-plan.json',JSON.stringify(plan,null,2));
console.log(JSON.stringify({files:moves.length,images:moves.filter(m=>/\.(png|jpg)$/.test(m.from)).length,changed,moves:moves.map(m=>[m.from,m.to])},null,2));
