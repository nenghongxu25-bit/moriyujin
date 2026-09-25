const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

const inputDir = path.join(__dirname, "..", "assets", "tileset", "aseprite files");
const outputDir = path.join(__dirname, "..", "assets", "tileset", "exported");

function readString(buffer, offset) {
    const len = buffer.readUInt16LE(offset);
    return {
        value: buffer.toString("utf8", offset + 2, offset + 2 + len),
        offset: offset + 2 + len,
    };
}

function parseAseprite(filePath) {
    const buffer = fs.readFileSync(filePath);
    const size = buffer.readUInt32LE(0);
    const magic = buffer.readUInt16LE(4);
    const frameCount = buffer.readUInt16LE(6);
    const width = buffer.readUInt16LE(8);
    const height = buffer.readUInt16LE(10);
    const depth = buffer.readUInt16LE(12);

    if (size !== buffer.length || magic !== 0xa5e0) {
        throw new Error(`${path.basename(filePath)} is not a valid Aseprite file`);
    }
    if (depth !== 32) {
        throw new Error(`${path.basename(filePath)} uses ${depth}-bit color; this exporter supports 32-bit RGBA`);
    }

    const layers = [];
    const frames = [];
    let offset = 128;

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        const frameSize = buffer.readUInt32LE(offset);
        const frameMagic = buffer.readUInt16LE(offset + 4);
        const oldChunkCount = buffer.readUInt16LE(offset + 6);
        const duration = buffer.readUInt16LE(offset + 8);
        const newChunkCount = buffer.readUInt32LE(offset + 12);
        const chunkCount = newChunkCount || oldChunkCount;

        if (frameMagic !== 0xf1fa) {
            throw new Error(`${path.basename(filePath)} frame ${frameIndex} has an invalid frame header`);
        }

        const frame = {
            duration,
            cels: [],
        };
        let chunkOffset = offset + 16;

        for (let i = 0; i < chunkCount; i++) {
            const chunkSize = buffer.readUInt32LE(chunkOffset);
            const chunkType = buffer.readUInt16LE(chunkOffset + 4);
            const bodyOffset = chunkOffset + 6;

            if (chunkType === 0x2004) {
                const name = readString(buffer, bodyOffset + 18).value;
                layers.push({
                    name,
                    flags: buffer.readUInt16LE(bodyOffset),
                    type: buffer.readUInt16LE(bodyOffset + 2),
                    blendMode: buffer.readUInt16LE(bodyOffset + 10),
                    opacity: buffer.readUInt8(bodyOffset + 12),
                });
            } else if (chunkType === 0x2005) {
                const layerIndex = buffer.readUInt16LE(bodyOffset);
                const x = buffer.readInt16LE(bodyOffset + 2);
                const y = buffer.readInt16LE(bodyOffset + 4);
                const opacity = buffer.readUInt8(bodyOffset + 6);
                const celType = buffer.readUInt16LE(bodyOffset + 7);
                const zIndex = buffer.readInt16LE(bodyOffset + 9);

                if (celType === 0 || celType === 2) {
                    const celWidth = buffer.readUInt16LE(bodyOffset + 16);
                    const celHeight = buffer.readUInt16LE(bodyOffset + 18);
                    const pixelsOffset = bodyOffset + 20;
                    const pixelBytes = celWidth * celHeight * 4;
                    const pixels = celType === 0
                        ? Buffer.from(buffer.subarray(pixelsOffset, pixelsOffset + pixelBytes))
                        : zlib.inflateSync(buffer.subarray(pixelsOffset, chunkOffset + chunkSize));

                    if (pixels.length !== pixelBytes) {
                        throw new Error(`${path.basename(filePath)} frame ${frameIndex} has unexpected cel pixel data`);
                    }

                    frame.cels.push({
                        layerIndex,
                        x,
                        y,
                        opacity,
                        zIndex,
                        width: celWidth,
                        height: celHeight,
                        pixels,
                    });
                } else if (celType === 1) {
                    const linkedFrame = buffer.readUInt16LE(bodyOffset + 16);
                    frame.cels.push({
                        layerIndex,
                        x,
                        y,
                        opacity,
                        zIndex,
                        linkedFrame,
                    });
                }
            }

            chunkOffset += chunkSize;
        }

        frames.push(frame);
        offset += frameSize;
    }

    return {
        name: path.basename(filePath, path.extname(filePath)),
        width,
        height,
        layers,
        frames,
    };
}

function alphaComposite(dst, dstIndex, srcR, srcG, srcB, srcA) {
    if (srcA <= 0) return;

    const dstA = dst[dstIndex + 3] / 255;
    const srcAlpha = srcA / 255;
    const outA = srcAlpha + dstA * (1 - srcAlpha);

    if (outA <= 0) {
        dst[dstIndex] = 0;
        dst[dstIndex + 1] = 0;
        dst[dstIndex + 2] = 0;
        dst[dstIndex + 3] = 0;
        return;
    }

    dst[dstIndex] = Math.round((srcR * srcAlpha + dst[dstIndex] * dstA * (1 - srcAlpha)) / outA);
    dst[dstIndex + 1] = Math.round((srcG * srcAlpha + dst[dstIndex + 1] * dstA * (1 - srcAlpha)) / outA);
    dst[dstIndex + 2] = Math.round((srcB * srcAlpha + dst[dstIndex + 2] * dstA * (1 - srcAlpha)) / outA);
    dst[dstIndex + 3] = Math.round(outA * 255);
}

function renderFrame(ase, frameIndex, seen = new Set()) {
    if (seen.has(frameIndex)) {
        throw new Error(`${ase.name} has a linked-cel loop at frame ${frameIndex}`);
    }
    seen.add(frameIndex);

    const frame = ase.frames[frameIndex];
    const canvas = Buffer.alloc(ase.width * ase.height * 4);
    const cels = frame.cels.slice().sort((a, b) => {
        const layerDiff = a.layerIndex - b.layerIndex;
        return layerDiff || a.zIndex - b.zIndex;
    });

    for (const cel of cels) {
        const layer = ase.layers[cel.layerIndex];
        if (!layer || layer.type !== 0 || (layer.flags & 1) === 0) continue;

        const source = cel.linkedFrame === undefined
            ? cel
            : ase.frames[cel.linkedFrame].cels.find((candidate) => candidate.layerIndex === cel.layerIndex);
        if (!source || !source.pixels) continue;

        const opacity = (cel.opacity / 255) * (layer.opacity / 255);
        for (let py = 0; py < source.height; py++) {
            const y = cel.y + py;
            if (y < 0 || y >= ase.height) continue;

            for (let px = 0; px < source.width; px++) {
                const x = cel.x + px;
                if (x < 0 || x >= ase.width) continue;

                const srcIndex = (py * source.width + px) * 4;
                const srcA = Math.round(source.pixels[srcIndex + 3] * opacity);
                const dstIndex = (y * ase.width + x) * 4;
                alphaComposite(
                    canvas,
                    dstIndex,
                    source.pixels[srcIndex],
                    source.pixels[srcIndex + 1],
                    source.pixels[srcIndex + 2],
                    srcA
                );
            }
        }
    }

    seen.delete(frameIndex);
    return canvas;
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

function makeSheet(frames, frameWidth, frameHeight) {
    const columns = Math.ceil(Math.sqrt(frames.length));
    const rows = Math.ceil(frames.length / columns);
    const sheetWidth = columns * frameWidth;
    const sheetHeight = rows * frameHeight;
    const sheet = Buffer.alloc(sheetWidth * sheetHeight * 4);

    frames.forEach((frame, index) => {
        const sx = (index % columns) * frameWidth;
        const sy = Math.floor(index / columns) * frameHeight;
        for (let y = 0; y < frameHeight; y++) {
            frame.copy(
                sheet,
                ((sy + y) * sheetWidth + sx) * 4,
                y * frameWidth * 4,
                (y + 1) * frameWidth * 4
            );
        }
    });

    return { sheet, sheetWidth, sheetHeight, columns, rows };
}

function writeMeta(filePath) {
    const metaPath = `${filePath}.meta`;
    if (fs.existsSync(metaPath)) return;

    fs.writeFileSync(metaPath, JSON.stringify({
        uuid: crypto.randomUUID(),
        importer: {
            textureType: 2,
        },
    }, null, 2));
}

function exportFile(filePath) {
    const ase = parseAseprite(filePath);
    const frames = ase.frames.map((_, index) => renderFrame(ase, index));
    const sheet = makeSheet(frames, ase.width, ase.height);
    const pngPath = path.join(outputDir, `${ase.name}.png`);
    const jsonPath = path.join(outputDir, `${ase.name}.json`);

    fs.writeFileSync(pngPath, encodePng(sheet.sheetWidth, sheet.sheetHeight, sheet.sheet));
    fs.writeFileSync(jsonPath, JSON.stringify({
        image: path.basename(pngPath),
        source: path.relative(outputDir, filePath).replace(/\\/g, "/"),
        frameWidth: ase.width,
        frameHeight: ase.height,
        columns: sheet.columns,
        rows: sheet.rows,
        frames: ase.frames.map((frame, index) => ({
            index,
            x: (index % sheet.columns) * ase.width,
            y: Math.floor(index / sheet.columns) * ase.height,
            w: ase.width,
            h: ase.height,
            duration: frame.duration,
        })),
    }, null, 2));
    writeMeta(pngPath);

    return `${ase.name}: ${ase.frames.length} frames, ${ase.width}x${ase.height} -> ${path.relative(path.join(__dirname, ".."), pngPath)}`;
}

function main() {
    fs.mkdirSync(outputDir, { recursive: true });
    const files = fs.readdirSync(inputDir)
        .filter((name) => name.toLowerCase().endsWith(".aseprite"))
        .sort();

    for (const file of files) {
        console.log(exportFile(path.join(inputDir, file)));
    }
}

main();
