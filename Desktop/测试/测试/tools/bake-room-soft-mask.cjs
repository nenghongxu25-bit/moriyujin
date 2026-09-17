// Offline rectangular alpha masks. No runtime blur or texture generation.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const feather = 120; // World pixels at the scene's authored room sizes.
const rooms = [
    ['lower', 2179, 891, 'c5cba251-ae46-4487-98b5-1d2282647d45'],
    ['upper', 2179, 1029, '4876f987-dbc9-4b18-b9a6-9d4e938d33ed']
];
function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
    const tag = Buffer.from(type), header = Buffer.alloc(4), crc = Buffer.alloc(4);
    header.writeUInt32BE(data.length);
    crc.writeUInt32BE(crc32(Buffer.concat([tag, data])));
    return Buffer.concat([header, tag, data, crc]);
}
const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
for (const [name, worldWidth, worldHeight, uuid] of rooms) {
    const width = 512, height = 256;
    const pixels = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = Math.min(x, width - 1 - x) / (width - 1) * worldWidth;
            const dy = Math.min(y, height - 1 - y) / (height - 1) * worldHeight;
            // Multiplication smoothly rounds the corners, without diagonal min() seams.
            const alpha = smooth(dx / feather) * smooth(dy / feather);
            pixels[y * (width * 4 + 1) + 1 + x * 4 + 3] = Math.round(alpha * 255);
        }
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4);
    header[8] = 8; header[9] = 6;
    const output = path.resolve(__dirname, `../assets/atlas/picture/room-soft-${name}.png`);
    fs.writeFileSync(output, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]));
    if (!fs.existsSync(output + '.meta')) fs.writeFileSync(output + '.meta', JSON.stringify({uuid, importer:{textureType:2}}, null, 2));
    console.log(output);
}
