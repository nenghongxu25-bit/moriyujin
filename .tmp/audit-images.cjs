const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = process.cwd();
const imageExt = /\.(png|jpe?g|webp|gif|bmp|svg)$/i;
const textExt = /\.(ts|js|cjs|json|meta|ls|lh|tres|atlas|lmat|md|html|ps1|py|widget|laya)$/i;
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    if (['node_modules','.git','dist'].includes(e.name)) return [];
    const p = path.join(dir,e.name);
    return e.isDirectory() ? walk(p) : [p.replaceAll('\\','/')];
  });
}
const files = ['assets','src','settings','tools','docs','draw'].flatMap(walk);
const images = files.filter(p=>p.startsWith('assets/') && imageExt.test(p)).map(p=>{
  const data = fs.readFileSync(p);
  let meta={};try {meta=JSON.parse(fs.readFileSync(p+'.meta','utf8').replace(/^\uFEFF/,''));}catch{}
  return {path:p,bytes:data.length,hash:crypto.createHash('sha256').update(data).digest('hex'),uuid:meta.uuid,importer:meta.importer||{},refs:[],nameRefs:[]};
});
const texts=[];const bom=[];
for (const p of files.filter(p=>textExt.test(p))) {
  const text=fs.readFileSync(p,'utf8');
  if (text.charCodeAt(0)===0xfeff) bom.push(p);
  texts.push({path:p,text});
}
for (const img of images) {
  const rel=img.path.slice(7), base=path.basename(img.path);
  for (const item of texts) {
    if(item.path===img.path+'.meta') continue;
    if((img.uuid && item.text.includes(img.uuid)) || item.text.includes(rel)) img.refs.push(item.path);
    else if(item.text.includes(base)) img.nameRefs.push(item.path);
  }
}
const groups=new Map();for(const img of images){if(!groups.has(img.hash))groups.set(img.hash,[]);groups.get(img.hash).push(img);}
const duplicateGroups=[...groups.values()].filter(g=>g.length>1);
const report={images,duplicateGroups,bom,summary:{images:images.length,bytes:images.reduce((a,b)=>a+b.bytes,0),duplicateGroups:duplicateGroups.length,extraCopies:duplicateGroups.reduce((a,b)=>a+b.length-1,0)}};
fs.writeFileSync('.tmp/image-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({summary:report.summary,bom,nonSpineDuplicates:duplicateGroups.filter(g=>g.some(i=>!i.path.startsWith('assets/spine/'))).map(g=>g.map(i=>({path:i.path,uuid:i.uuid,importer:i.importer,refs:i.refs,nameRefs:i.nameRefs}))),unreferencedNonSpine:images.filter(i=>!i.path.startsWith('assets/spine/')&&!i.refs.length).map(i=>({path:i.path,bytes:i.bytes,nameRefs:i.nameRefs}))},null,2));
