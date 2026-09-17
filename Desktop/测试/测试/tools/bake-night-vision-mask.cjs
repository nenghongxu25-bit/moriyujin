const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// Bake alpha once offline; white RGB is erased using destinationOut in the scene.
const size = 512;
const smooth = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
const pixels = Buffer.alloc((size * 4 + 1) * size);
const glowPixels = Buffer.alloc(pixels.length);
for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
        const dx = (x + 0.5 - size / 2) / size * 640;
        const dy = (y + 0.5 - size / 2) / size * 640;
        const radius = Math.hypot(dx, dy);
        const angle = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;
        const beam = (1 - smooth(30, 53, angle)) * (1 - smooth(205, 310, radius));
        const alpha = beam;
        const offset = y * (size * 4 + 1) + 1 + x * 4;
        pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 255;
        pixels[offset + 3] = Math.round(alpha * 255);
        // Keep the white light inside the revealed area, with no hard bright core.
        const beamGlow = Math.exp(-Math.pow(angle / 30, 2)) *
            (1 - smooth(15, 310, radius)) * 0.32;
        const glowAlpha = beamGlow * alpha;
        glowPixels[offset] = glowPixels[offset + 1] = glowPixels[offset + 2] = 255;
        glowPixels[offset + 3] = Math.round(glowAlpha * 255);
    }
}
function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
    const tag = Buffer.from(type);
    const header = Buffer.alloc(4);
    header.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([tag, data])));
    return Buffer.concat([header, tag, data, crc]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0);
header.writeUInt32BE(size, 4);
header[8] = 8;
header[9] = 6;
for (const [name, data] of [['night-vision-soft', pixels], ['night-vision-glow', glowPixels]]) {
    const output = path.resolve(__dirname, `../assets/atlas/picture/${name}.png`);
    fs.writeFileSync(output, Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(data)), chunk('IEND', Buffer.alloc(0))
    ]));
    console.log(output);
}
