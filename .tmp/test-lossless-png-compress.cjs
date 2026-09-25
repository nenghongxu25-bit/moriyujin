const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index++) {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  crcTable[index] = value >>> 0;
}

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type);
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  name.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, chunk.length - 4)), chunk.length - 4);
  return chunk;
}

function recompressPng(file) {
  const input = fs.readFileSync(file);
  const chunks = [];
  const imageData = [];
  let offset = 8;
  let wroteImageData = false;
  while (offset < input.length) {
    const length = input.readUInt32BE(offset);
    const type = input.toString("ascii", offset + 4, offset + 8);
    const end = offset + length + 12;
    if (type === "IDAT") {
      imageData.push(input.subarray(offset + 8, end - 4));
      if (!wroteImageData) {
        chunks.push(null);
        wroteImageData = true;
      }
    } else {
      chunks.push(input.subarray(offset, end));
    }
    offset = end;
    if (type === "IEND") break;
  }
  const packed = zlib.deflateSync(zlib.inflateSync(Buffer.concat(imageData)), { level: 9 });
  return Buffer.concat([input.subarray(0, 8), ...chunks.map((chunk) => chunk || pngChunk("IDAT", packed))]);
}

async function main() {
  const root = process.cwd();
  const release = path.join(root, "release/web");
  const outRoot = path.join(root, ".tmp/asset-compress-check");
  fs.mkdirSync(outRoot, { recursive: true });
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.toLowerCase().endsWith(".png")) files.push(file);
    }
  };
  walk(release);
  let sourceBytes = 0;
  let optimizedBytes = 0;
  let exact = 0;
  let missing = 0;
  let failed = 0;
  const results = [];
  for (const file of files) {
    const relative = path.relative(release, file);
    const asset = path.join(root, "assets", relative);
    const output = path.join(outRoot, relative);
    if (!fs.existsSync(asset)) {
      missing++;
      continue;
    }
    try {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      const optimized = recompressPng(asset);
      fs.writeFileSync(output, optimized);
      const before = fs.statSync(asset).size;
      const after = fs.statSync(output).size;
      sourceBytes += before;
      optimizedBytes += after;
      exact++;
      results.push({ file: relative, before, after, saved: before - after });
    } catch (error) {
      failed++;
      console.log(`FAIL ${relative} ${error.message}`);
    }
  }
  results.sort((a, b) => b.saved - a.saved);
  console.log(JSON.stringify({
    publishedPngs: files.length,
    exact,
    missing,
    failed,
    sourceBytes,
    optimizedBytes,
    savedBytes: sourceBytes - optimizedBytes,
    savedPercent: sourceBytes ? ((sourceBytes - optimizedBytes) * 100 / sourceBytes).toFixed(2) : "0",
    best: results.slice(0, 20),
    output: outRoot
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
