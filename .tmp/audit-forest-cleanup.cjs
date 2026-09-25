const fs=require('fs'),path=require('path');
const candidates=['assets/forest-isometric-study',...fs.readdirSync('assets/tileset').filter(n=>n.includes('forest')).map(n=>'assets/tileset/'+n)];
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const files=walk('assets'),sources=walk('src');const inside=p=>candidates.find(d=>p===d||p.startsWith(d+'/'));
const uuidMap=new Map();for(const p of files.filter(p=>p.endsWith('.meta'))){try{const m=JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));if(m.uuid)uuidMap.set(m.uuid,p.slice(0,-5));}catch{}}
const texts=new Map();for(const p of [...files,...sources])if(/\.(ls|lh|tres|json|ts|atlas|material|lmat|shader|glsl|meta)$/.test(p))texts.set(p,fs.readFileSync(p,'utf8'));
const incoming=new Map();for(const [p,s]of texts)for(const id of s.match(/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/gi)||[]){const q=uuidMap.get(id);if(q&&inside(q)&&p!==q+'.meta'){if(!incoming.has(q))incoming.set(q,new Set());incoming.get(q).add(p);}}
const keep=new Set(),queue=[];for(const [q,refs]of incoming)if([...refs].some(p=>!inside(p))){keep.add(q);queue.push(q);}
// Explicitly preserve the user-approved shape reference even if no scene loads it.
const reference='assets/tileset/forest-kit-v3/grass-dirt.png';if(fs.existsSync(reference)){keep.add(reference);queue.push(reference);}
while(queue.length){const p=queue.shift(),s=texts.get(p)||'';for(const id of s.match(/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/gi)||[]){const q=uuidMap.get(id);if(q&&inside(q)&&!keep.has(q)){keep.add(q);queue.push(q);}}}
const report={candidates,keep:[...keep].sort().map(p=>({path:p,refs:[...(incoming.get(p)||[])].filter(r=>!inside(r))})),counts:candidates.map(d=>({dir:d,files:files.filter(p=>p.startsWith(d+'/')&&!p.endsWith('.meta')).length,retained:[...keep].filter(p=>p.startsWith(d+'/')).length}))};
fs.writeFileSync('.tmp/forest-cleanup-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
