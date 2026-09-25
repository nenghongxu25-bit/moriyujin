const fs=require('fs');
const path=require('path');
const assert=require('assert');
const crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let c=0xffffffff;for(const x of b)c=table[(c^x)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length,0);t.copy(b,4);data.copy(b,8);b.writeUInt32BE(crc(Buffer.concat([t,data])),8+data.length);return b;}
function parse(b){assert(b.subarray(0,8).equals(signature));const a=[];for(let p=8;p<b.length;){const n=b.readUInt32BE(p),t=b.toString('ascii',p+4,p+8),d=b.subarray(p+8,p+8+n);assert.equal(b.readUInt32BE(p+8+n),crc(b.subarray(p+4,p+8+n)));a.push({t,d});p+=n+12;}return a;}
const jobs=JSON.parse(fs.readFileSync(path.join(__dirname,'animal-animation-jobs.json'),'utf8'));
const outDir=path.join(root,'art-library/previews/animals-animation');fs.mkdirSync(outDir,{recursive:true});
for(const job of jobs){
 const dir=path.join(root,'assets/animation/animals-preview',job.animal,job.action);
 const frames=Array.from({length:job.count},(_,i)=>fs.readFileSync(path.join(dir,`frame_${String(i).padStart(2,'0')}.png`)));
 assert.equal(new Set(frames.map(f=>crypto.createHash('sha256').update(f).digest('hex'))).size,job.count,'Duplicate frames');
 const parsed=frames.map(parse),headers=parsed.map(p=>p.find(c=>c.t==='IHDR').d);for(const h of headers)assert(h.equals(headers[0]),'Frame format mismatch');
 assert.equal(headers[0][9],6,'RGBA required');
 const animation=Buffer.alloc(8);animation.writeUInt32BE(job.count,0);animation.writeUInt32BE(0,4);
 const output=[signature,chunk('IHDR',headers[0]),chunk('acTL',animation)];let seq=0;
 for(let i=0;i<job.count;i++){
  const control=Buffer.alloc(26);control.writeUInt32BE(seq++,0);headers[0].copy(control,4,0,8);
  // Attack holds ready pose briefly before repeating for inspection; manifest remains non-looping.
  control.writeUInt16BE(job.action==='attack'&&i===job.count-1?6:1,20);control.writeUInt16BE(job.fps,22);control[24]=0;control[25]=0;
  output.push(chunk('fcTL',control));
  const data=Buffer.concat(parsed[i].filter(c=>c.t==='IDAT').map(c=>c.d));
  if(i===0)output.push(chunk('IDAT',data));else{const d=Buffer.alloc(data.length+4);d.writeUInt32BE(seq++,0);data.copy(d,4);output.push(chunk('fdAT',d));}
 }
 output.push(chunk('IEND',Buffer.alloc(0)));const image=Buffer.concat(output);const decoded=parse(image);
 assert.equal(decoded.filter(c=>c.t==='fcTL').length,job.count);
 const actualData=decoded.filter(c=>c.t==='IDAT'||c.t==='fdAT');assert.equal(actualData.length,job.count);
 actualData.forEach((c,i)=>assert((c.t==='fdAT'?c.d.subarray(4):c.d).equals(Buffer.concat(parsed[i].filter(v=>v.t==='IDAT').map(v=>v.d)))));
 const dest=path.join(outDir,`${job.animal}-${job.action}.apng.png`);if(fs.existsSync(dest))throw Error('Preview exists: '+dest);fs.writeFileSync(dest,image);
 console.log(`${job.animal}/${job.action}: ${job.count} unique RGBA frames, ${headers[0].readUInt32BE(0)}x${headers[0].readUInt32BE(4)}, APNG CRC/payload verified`);
}
