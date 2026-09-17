const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// Bake alpha once offline; white RGB is erased using destinationOut in the scene.
const settings = require('./night-vision-settings.json');
const size = settings.textureSize;
for (const name of ['textureSize', 'worldSize', 'coreLength', 'coreWidth', 'coreFalloffPower', 'coreGain', 'outerLength', 'outerWidth', 'ambientRadius']) {
    if (!Number.isFinite(settings[name]) || settings[name] <= 0) throw new Error(`Invalid ${name}`);
}
for (const name of ['edgeSoftness', 'ambientSoftness', 'intensity', 'outerIntensity', 'ambientIntensity', 'glowIntensity']) {
    if (!Number.isFinite(settings[name]) || settings[name] < 0 || settings[name] > 1) throw new Error(`Invalid ${name}`);
}
if (!Number.isInteger(size) || size > 2048) throw new Error('textureSize must be an integer <= 2048');
if (Math.max(settings.coreLength, settings.outerLength, settings.ambientRadius,
    settings.coreWidth / 2, settings.outerWidth / 2) >= settings.worldSize / 2) {
    throw new Error('Light must fit inside worldSize to avoid clipped edges');
}
const smooth = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
const pixels = Buffer.alloc((size * 4 + 1) * size);
const glowPixels = Buffer.alloc(pixels.length);
// Width is the full beam envelope in world pixels, not an angular cutoff.
// Elliptical distance rounds the far end; the transverse profile has no flat core.
function beamAt(x, y, length, width, softness, falloffPower = 1) {
    const forward = Math.max(0, x);
    const spread = 18 + width * 0.5 * Math.pow(Math.min(1, forward / length), 0.72);
    const side = Math.abs(y) / spread;
    const edge = Math.max(0.05, softness);
    const lateral = Math.exp(-side * side * (1.5 + edge)) * (1 - smooth(1 - edge, 1, side));
    const elliptical = Math.hypot(forward / length, y / (width * 0.5));
    const distance = Math.pow(1 - smooth(0.12, 1, elliptical), falloffPower);
    return lateral * distance * smooth(-30, 16, x);
}
for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
        const dx = (x + 0.5 - size / 2) / size * settings.worldSize;
        const dy = (y + 0.5 - size / 2) / size * settings.worldSize;
        const radius = Math.hypot(dx, dy);
        const core = Math.min(1, beamAt(dx, dy, settings.coreLength, settings.coreWidth,
            settings.edgeSoftness, settings.coreFalloffPower) * settings.intensity * settings.coreGain);
        const outer = beamAt(dx, dy, settings.outerLength, settings.outerWidth, settings.edgeSoftness) * settings.outerIntensity;
        const ambient = (1 - smooth(1 - Math.max(0.05, settings.ambientSoftness), 1,
            radius / settings.ambientRadius)) * settings.ambientIntensity;
        // Union of alpha layers: continuous, bounded, without hard max() seams.
        const alpha = 1 - (1 - core) * (1 - outer) * (1 - ambient);
        const offset = y * (size * 4 + 1) + 1 + x * 4;
        pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 255;
        pixels[offset + 3] = Math.round(alpha * 255);
        // Most illumination comes from removing darkness, not painting white.
        const glowAlpha = core * alpha * settings.glowIntensity;
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
