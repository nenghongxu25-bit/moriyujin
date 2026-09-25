const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) { crc ^= byte; for (let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0); }
    return (crc^0xffffffff)>>>0;
}
function chunk(type,data) {
    const tag=Buffer.from(type), head=Buffer.alloc(4), crc=Buffer.alloc(4);
    head.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));
    return Buffer.concat([head,tag,data,crc]);
}
// Smooth radial falloff baked once offline, shared by all stationary lights.
for(const [name,rgb,uuid] of [
    ['fire-light-soft',[255,255,255],'a0df9fa1-674f-439b-a3d0-2e741d39f8ae'],
    ['fire-light-warm',[255,157,62],'2ef73fda-f151-4f4b-8eb2-4c9bcb188a23']
]) {
    const size=256, data=Buffer.alloc((size*4+1)*size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
        const radius=Math.hypot((x-127.5)/127.5,(y-127.5)/127.5);
        const t=Math.max(0,Math.min(1,(radius-0.08)/0.92));
        const alpha=Math.pow(1-t*t*(3-2*t),1.3), at=y*(size*4+1)+1+x*4;
        data[at]=rgb[0]; data[at+1]=rgb[1]; data[at+2]=rgb[2]; data[at+3]=Math.round(alpha*255);
    }
    const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
    const out=path.resolve(__dirname,`../assets/atlas/picture/effects/lighting/${name}.png`);
    fs.writeFileSync(out,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(data)),chunk('IEND',Buffer.alloc(0))]));
    if(!fs.existsSync(out+'.meta'))fs.writeFileSync(out+'.meta',JSON.stringify({uuid,importer:{textureType:2}},null,2));
    console.log(out);
}
