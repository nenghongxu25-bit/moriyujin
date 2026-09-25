const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

const projectRoot = path.join(__dirname, "..");
const prefabPath = path.join(projectRoot, "assets", "prefab", "ceshi.lh");
const waterPath = path.join(projectRoot, "assets", "tileset", "water.png");
const grassPath = path.join(projectRoot, "assets", "tileset", "grass.png");
const outDir = path.join(projectRoot, "assets", "tileset", "baked");
const outPath = path.join(outDir, "ceshi_water_grass_baked.png");
const indexedOutPath = path.join(outDir, "ceshi_water_grass_baked_256.png");
const valueMapPath = path.join(outDir, "ceshi_mask_values.png");
const smallValueMapPath = path.join(outDir, "ceshi_mask_values_750x575.png");

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findByName(node, name) {
    if (!node || typeof node !== "object") return null;
    if (node.name === name) return node;
    for (const child of node._$child || []) {
        const found = findByName(child, name);
        if (found) return found;
    }
    return null;
}

function findAssetByUuid(uuid) {
    const stack = [path.join(projectRoot, "assets")];
    while (stack.length) {
        const dir = stack.pop();
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                stack.push(full);
            } else if (entry.name.endsWith(".meta")) {
                try {
                    const meta = readJson(full);
                    if (meta.uuid === uuid) return full.slice(0, -5);
                } catch {
                    // Ignore non-JSON meta files.
                }
            }
        }
    }
    return null;
}

function parsePng(filePath) {
    const buffer = fs.readFileSync(filePath);
    if (buffer.slice(1, 4).toString("ascii") !== "PNG") {
        throw new Error(`${filePath} is not a PNG`);
    }

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    const bitDepth = buffer[24];
    const colorType = buffer[25];
    const chunks = [];
    let palette = null;
    let transparency = null;
    let idat = [];
    let offset = 8;

    while (offset < buffer.length) {
        const length = buffer.readUInt32BE(offset);
        const type = buffer.slice(offset + 4, offset + 8).toString("ascii");
        const data = buffer.subarray(offset + 8, offset + 8 + length);
        chunks.push({ type, data });
        if (type === "PLTE") palette = data;
        if (type === "tRNS") transparency = data;
        if (type === "IDAT") idat.push(data);
        offset += length + 12;
    }

    if ((colorType === 6 || colorType === 2) && bitDepth !== 8) {
        throw new Error(`${filePath} uses unsupported PNG bit depth ${bitDepth}`);
    }
    if (colorType === 3 && ![1, 2, 4, 8].includes(bitDepth)) {
        throw new Error(`${filePath} uses unsupported indexed PNG bit depth ${bitDepth}`);
    }

    const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 3 ? 1 : 0;
    if (!channels) {
        throw new Error(`${filePath} uses unsupported PNG color type ${colorType}`);
    }

    const stride = colorType === 3 ? Math.ceil(width * bitDepth / 8) : width * channels;
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const scanlines = Buffer.alloc(stride * height);
    let rawOffset = 0;
    let outOffset = 0;
    let prev = Buffer.alloc(stride);

    for (let y = 0; y < height; y++) {
        const filter = raw[rawOffset++];
        const row = Buffer.from(raw.subarray(rawOffset, rawOffset + stride));
        rawOffset += stride;

        for (let x = 0; x < stride; x++) {
            const filterBpp = colorType === 3 ? 1 : channels;
            const left = x >= filterBpp ? row[x - filterBpp] : 0;
            const up = prev[x] || 0;
            const upLeft = x >= channels ? prev[x - channels] || 0 : 0;
            if (filter === 1) row[x] = (row[x] + left) & 255;
            else if (filter === 2) row[x] = (row[x] + up) & 255;
            else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
            else if (filter === 4) {
                const p = left + up - upLeft;
                const pa = Math.abs(p - left);
                const pb = Math.abs(p - up);
                const pc = Math.abs(p - upLeft);
                row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255;
            } else if (filter !== 0) {
                throw new Error(`Unsupported PNG filter ${filter} in ${filePath}`);
            }
        }

        row.copy(scanlines, outOffset);
        outOffset += stride;
        prev = row;
    }

    const pixels = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
        if (colorType === 6) {
            pixels[i * 4] = scanlines[i * 4];
            pixels[i * 4 + 1] = scanlines[i * 4 + 1];
            pixels[i * 4 + 2] = scanlines[i * 4 + 2];
            pixels[i * 4 + 3] = scanlines[i * 4 + 3];
        } else if (colorType === 2) {
            pixels[i * 4] = scanlines[i * 3];
            pixels[i * 4 + 1] = scanlines[i * 3 + 1];
            pixels[i * 4 + 2] = scanlines[i * 3 + 2];
            pixels[i * 4 + 3] = 255;
        } else {
            const rowOffset = Math.floor(i / width) * stride;
            const x = i % width;
            const packed = scanlines[rowOffset + Math.floor(x * bitDepth / 8)];
            const shift = 8 - bitDepth - ((x * bitDepth) % 8);
            const index = (packed >> shift) & ((1 << bitDepth) - 1);
            pixels[i * 4] = palette[index * 3] || 0;
            pixels[i * 4 + 1] = palette[index * 3 + 1] || 0;
            pixels[i * 4 + 2] = palette[index * 3 + 2] || 0;
            pixels[i * 4 + 3] = transparency && index < transparency.length ? transparency[index] : 255;
        }
    }

    return { width, height, pixels };
}

function crc32(buffer) {
    let crc = ~0;
    for (const byte of buffer) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) {
            crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
        }
    }
    return ~crc >>> 0;
}

function pngChunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const chunk = Buffer.alloc(12 + data.length);
    chunk.writeUInt32BE(data.length, 0);
    typeBuffer.copy(chunk, 4);
    data.copy(chunk, 8);
    chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
    return chunk;
}

function encodePng(width, height, pixels) {
    const stride = width * 4;
    const scanlines = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y++) {
        scanlines[y * (stride + 1)] = 0;
        pixels.copy(scanlines, y * (stride + 1) + 1, y * stride, y * stride + stride);
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8;
    header[9] = 6;
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk("IHDR", header),
        pngChunk("IDAT", zlib.deflateSync(scanlines)),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);
}

function encodeIndexedPng332(width, height, pixels) {
    const palette = Buffer.alloc(256 * 3);
    for (let r = 0; r < 8; r++) {
        for (let g = 0; g < 8; g++) {
            for (let b = 0; b < 4; b++) {
                const index = (r << 5) | (g << 2) | b;
                palette[index * 3] = Math.round((r / 7) * 255);
                palette[index * 3 + 1] = Math.round((g / 7) * 255);
                palette[index * 3 + 2] = Math.round((b / 3) * 255);
            }
        }
    }

    const scanlines = Buffer.alloc((width + 1) * height);
    for (let y = 0; y < height; y++) {
        const row = y * (width + 1);
        scanlines[row] = 0;
        for (let x = 0; x < width; x++) {
            const src = (y * width + x) * 4;
            const r = pixels[src] >> 5;
            const g = pixels[src + 1] >> 5;
            const b = pixels[src + 2] >> 6;
            scanlines[row + 1 + x] = (r << 5) | (g << 2) | b;
        }
    }

    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8;
    header[9] = 3;
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk("IHDR", header),
        pngChunk("PLTE", palette),
        pngChunk("IDAT", zlib.deflateSync(scanlines, { level: 9 })),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);
}

function downsampleNearest(src, srcWidth, srcHeight, dstWidth, dstHeight) {
    const dst = Buffer.alloc(dstWidth * dstHeight * 4);
    for (let y = 0; y < dstHeight; y++) {
        const sy = Math.min(srcHeight - 1, Math.floor((y + 0.5) * srcHeight / dstHeight));
        for (let x = 0; x < dstWidth; x++) {
            const sx = Math.min(srcWidth - 1, Math.floor((x + 0.5) * srcWidth / dstWidth));
            const srcIndex = (sy * srcWidth + sx) * 4;
            const dstIndex = (y * dstWidth + x) * 4;
            dst[dstIndex] = src[srcIndex];
            dst[dstIndex + 1] = src[srcIndex + 1];
            dst[dstIndex + 2] = src[srcIndex + 2];
            dst[dstIndex + 3] = src[srcIndex + 3];
        }
    }
    return dst;
}

function edt1d(f, n) {
    const d = new Float64Array(n);
    const v = new Int32Array(n);
    const z = new Float64Array(n + 1);
    let k = 0;
    v[0] = 0;
    z[0] = -Infinity;
    z[1] = Infinity;

    for (let q = 1; q < n; q++) {
        let s;
        do {
            const vk = v[k];
            s = ((f[q] + q * q) - (f[vk] + vk * vk)) / (2 * q - 2 * vk);
            if (s <= z[k]) k--;
        } while (s <= z[k]);
        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = Infinity;
    }

    k = 0;
    for (let q = 0; q < n; q++) {
        while (z[k + 1] < q) k++;
        const diff = q - v[k];
        d[q] = diff * diff + f[v[k]];
    }
    return d;
}

function distanceTransform(mask, width, height, sourceValue) {
    const inf = 1e12;
    const tmp = new Float64Array(width * height);
    const f = new Float64Array(Math.max(width, height));

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            f[y] = mask[y * width + x] === sourceValue ? 0 : inf;
        }
        const d = edt1d(f, height);
        for (let y = 0; y < height; y++) {
            tmp[y * width + x] = d[y];
        }
    }

    const out = new Float64Array(width * height);
    for (let y = 0; y < height; y++) {
        const row = y * width;
        for (let x = 0; x < width; x++) {
            f[x] = tmp[row + x];
        }
        const d = edt1d(f, width);
        for (let x = 0; x < width; x++) {
            out[row + x] = d[x];
        }
    }
    return out;
}

function sampleAlpha(image, u, v) {
    const x = Math.max(0, Math.min(image.width - 1, Math.floor(u * image.width)));
    const y = Math.max(0, Math.min(image.height - 1, Math.floor(v * image.height)));
    return image.pixels[(y * image.width + x) * 4 + 3];
}

function sampleTile(image, x, y) {
    const sx = ((x % image.width) + image.width) % image.width;
    const sy = ((y % image.height) + image.height) % image.height;
    const index = (sy * image.width + sx) * 4;
    return [
        image.pixels[index],
        image.pixels[index + 1],
        image.pixels[index + 2],
        image.pixels[index + 3] / 255,
    ];
}

function hash2(x, y) {
    const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return v - Math.floor(v);
}

function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

function valueNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = smoothstep(x - ix);
    const fy = smoothstep(y - iy);
    const a = hash2(ix, iy);
    const b = hash2(ix + 1, iy);
    const c = hash2(ix, iy + 1);
    const d = hash2(ix + 1, iy + 1);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

function fbm(x, y) {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let freq = 1;
    for (let i = 0; i < 4; i++) {
        sum += valueNoise(x * freq, y * freq) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2.03;
    }
    return sum / norm;
}

function blendValue(signedDistance, x, y) {
    const broad = fbm(x * 0.006, y * 0.006) - 0.5;
    const detail = fbm(x * 0.025 + 19.7, y * 0.025 - 8.3) - 0.5;
    const noisyDistance = signedDistance + broad * 54 + detail * 18;

    if (noisyDistance <= -64) return 0;
    if (noisyDistance < -32) return 0.2;
    if (noisyDistance <= 32) return 0.5;
    if (noisyDistance < 64) return 0.8;
    return 1;
}

function warpedSampleTile(image, x, y, scale, seedX, seedY) {
    const cell = Math.max(32, Math.min(image.width, image.height));
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    const jitterX = Math.floor((hash2(cx + seedX, cy + seedY) - 0.5) * cell);
    const jitterY = Math.floor((hash2(cx - seedY, cy + seedX) - 0.5) * cell);
    const warpX = (fbm(x * scale + seedX, y * scale + seedY) - 0.5) * cell * 0.45;
    const warpY = (fbm(x * scale - seedY, y * scale + seedX) - 0.5) * cell * 0.45;
    return sampleTile(image, Math.floor(x + jitterX + warpX), Math.floor(y + jitterY + warpY));
}

function colorVariation(x, y) {
    const large = fbm(x * 0.004 - 5.1, y * 0.004 + 12.4);
    const fine = fbm(x * 0.04 + 2.3, y * 0.04 - 3.8);
    return 0.9 + large * 0.14 + fine * 0.06;
}

function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function writeTextureMeta(filePath) {
    const metaPath = `${filePath}.meta`;
    if (fs.existsSync(metaPath)) return;
    fs.writeFileSync(metaPath, JSON.stringify({
        uuid: crypto.randomUUID(),
        importer: {
            textureType: 2,
        },
    }, null, 2));
}

function main() {
    const prefab = readJson(prefabPath);
    const maskNode = findByName(prefab, "mask");
    if (!maskNode || !maskNode.texture?._$uuid) {
        throw new Error("ceshi.lh must contain a mask node with a texture uuid");
    }

    const maskPath = findAssetByUuid(maskNode.texture._$uuid);
    if (!maskPath) {
        throw new Error(`Cannot find mask texture uuid ${maskNode.texture._$uuid}`);
    }

    const width = Math.floor(prefab.width);
    const height = Math.floor(prefab.height);
    const maskX = Math.floor(maskNode.x || 0);
    const maskY = Math.floor(maskNode.y || 0);
    const maskW = Math.floor(maskNode.width);
    const maskH = Math.floor(maskNode.height);

    const maskImage = parsePng(maskPath);
    const water = parsePng(waterPath);
    const grass = parsePng(grassPath);
    const mask = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
        const localY = y - maskY;
        if (localY < 0 || localY >= maskH) continue;
        for (let x = 0; x < width; x++) {
            const localX = x - maskX;
            if (localX < 0 || localX >= maskW) continue;
            const alpha = sampleAlpha(maskImage, localX / maskW, localY / maskH);
            if (alpha >= 128) mask[y * width + x] = 1;
        }
    }

    const distToWater = distanceTransform(mask, width, height, 1);
    const distToGrass = distanceTransform(mask, width, height, 0);
    const pixels = Buffer.alloc(width * height * 4);
    const valuePixels = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const signedDistance = mask[i] ? -Math.sqrt(distToGrass[i]) : Math.sqrt(distToWater[i]);
            const value = blendValue(signedDistance, x, y);
            const w = warpedSampleTile(water, x, y, 0.02, 11.3, 41.9);
            const g = warpedSampleTile(grass, x, y, 0.013, 71.7, 5.6);
            const variation = colorVariation(x, y);
            const out = i * 4;

            pixels[out] = clampByte((w[0] * (1 - value) + g[0] * value) * variation);
            pixels[out + 1] = clampByte((w[1] * (1 - value) + g[1] * value) * variation);
            pixels[out + 2] = clampByte((w[2] * (1 - value) + g[2] * value) * variation);
            pixels[out + 3] = Math.round((w[3] * (1 - value) + g[3] * value) * 255);

            const gray = Math.round(value * 255);
            valuePixels[out] = gray;
            valuePixels[out + 1] = gray;
            valuePixels[out + 2] = gray;
            valuePixels[out + 3] = 255;
        }
    }

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, encodePng(width, height, pixels));
    fs.writeFileSync(indexedOutPath, encodeIndexedPng332(width, height, pixels));
    fs.writeFileSync(valueMapPath, encodePng(width, height, valuePixels));
    fs.writeFileSync(smallValueMapPath, encodePng(750, 575, downsampleNearest(valuePixels, width, height, 750, 575)));
    writeTextureMeta(outPath);
    writeTextureMeta(indexedOutPath);
    writeTextureMeta(valueMapPath);
    writeTextureMeta(smallValueMapPath);

    console.log(`mask: ${path.relative(projectRoot, maskPath)} scaled to ${maskW}x${maskH} at ${maskX},${maskY}`);
    console.log(`baked: ${path.relative(projectRoot, outPath)} ${width}x${height}`);
    console.log(`baked 256: ${path.relative(projectRoot, indexedOutPath)} ${width}x${height}`);
    console.log(`value map: ${path.relative(projectRoot, valueMapPath)} ${width}x${height}`);
    console.log(`small value map: ${path.relative(projectRoot, smallValueMapPath)} 750x575`);
}

main();
