const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const project = path.resolve(__dirname, '..');
const forestRoot = path.join(project, 'assets/decorate/forest');
const elementsRoot = path.join(project, 'assets/decorate/forest-elements-v2');
const outRoot = path.join(project, 'assets/prefab/forest-decoration');
const existing = new Set(['阻挡_松树', '阻挡_岩壁', '可穿过_灌木', '地表_落叶']);
const existingByStem = new Map([
  ['forest-pine-tree-v1', '阻挡_松树'], ['forest-rock-cliff-v1', '阻挡_岩壁'],
  ['forest-sparse-shrub-v1', '可穿过_灌木'], ['forest-needle-leaf-litter-v1', '地表_落叶'],
]);

const groundOnly = new Set([
  'forest-broken-branches-v1', 'forest-broken-planks-v1', 'forest-needle-leaf-litter-v1',
  'forest-muddy-bank-v1', 'gravel-scatter', 'leaves-dry',
  'pebbles-three',
]);
const passable = new Set([
  'forest-military-tent-v1', 'forest-abandoned-backpack-v1', 'forest-campfire-v1',
  'forest-extinguished-campfire-v1', 'forest-rusty-toolbox-v1', 'forest-shrub-v1',
  'forest-sparse-shrub-v1', 'forest-young-pine-v1', 'forest-bank-reeds-v1', 'forest-wood-bridge-v1',
  'grass-short', 'grass-tall', 'fern', 'bush-round', 'bush-berries', 'broadleaf',
  'flowers-white', 'mushrooms', 'branch-fallen', 'roots', 'reeds', 'sapling-pine', 'sapling-dead',
]);
const actorOnly = new Set(['forest-wolf-v1', 'forest-young-boar-v1']);
const groundFx = new Set(['lily-pads']);
const windFx = new Map([
  ['grass-short', [0, 1.5]], ['grass-tall', [0, 2.2]], ['fern', [0, 1.8]],
  ['flowers-white', [0, 1.4]], ['reeds', [0, 2.1]], ['forest-bank-reeds-v1', [0, 2.0]],
]);
const blocking = new Set([
  'boulder-moss', 'rock-moss-small', 'rocks-flat', 'rocks-round', 'stump', 'tree-small', 'log-moss',
]);

function filesRecursive(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesRecursive(full) : entry.name.toLowerCase().endsWith('.png') ? [full] : [];
  });
}
function stableHex(value, length = 12) { return crypto.createHash('sha1').update(value).digest('hex').slice(0, length); }
function stableUuid(value) {
  const hex = stableHex(value, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 3) | 8).toString(16);
  const raw = hex.join('');
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}
function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 1, 4) !== 'PNG') throw new Error(`Not a PNG: ${file}`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}
function pngAlphaBounds(file) {
  const b = fs.readFileSync(file);
  const width = b.readUInt32BE(16), height = b.readUInt32BE(20), colorType = b[25], bitDepth = b[24];
  if (bitDepth !== 8 || colorType !== 6) throw new Error(`Expected 8-bit RGBA PNG: ${file}`);
  const chunks = [];
  for (let p = 8; p < b.length;) {
    const length = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8);
    if (type === 'IDAT') chunks.push(b.subarray(p + 8, p + 8 + length));
    p += length + 12;
    if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * 4, previous = Buffer.alloc(stride), current = Buffer.alloc(stride);
  let minX = width, minY = height, maxX = -1, maxY = -1, offset = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++];
    raw.copy(current, 0, offset, offset + stride); offset += stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= 4 ? current[i - 4] : 0, up = previous[i], upperLeft = i >= 4 ? previous[i - 4] : 0;
      if (filter === 1) current[i] = (current[i] + left) & 255;
      else if (filter === 2) current[i] = (current[i] + up) & 255;
      else if (filter === 3) current[i] = (current[i] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const p = left + up - upperLeft, pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upperLeft);
        current[i] = (current[i] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft)) & 255;
      } else if (filter !== 0) throw new Error(`Unsupported PNG filter ${filter}: ${file}`);
    }
    for (let x = 0; x < width; x++) if (current[x * 4 + 3] > 8) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    current.copy(previous);
  }
  if (maxX < minX) throw new Error(`Image is fully transparent: ${file}`);
  return { minX, minY, maxX, maxY };
}
function displaySize(size) {
  const longest = Math.max(size.width, size.height);
  const scale = longest >= 1000 ? 0.25 : longest >= 500 ? 0.5 : longest > 256 ? 0.75 : longest === 256 ? 0.75 : 1;
  return { width: Math.max(1, Math.round(size.width * scale)), height: Math.max(1, Math.round(size.height * scale)) };
}
function classify(stem, relative) {
  if (actorOnly.has(stem)) return 'actor';
  if (groundFx.has(stem)) return 'groundFx';
  if (groundOnly.has(stem)) return 'ground';
  if (blocking.has(stem)) return 'blocking';
  if (passable.has(stem)) return 'passable';
  return 'blocking';
}
function prefabName(role, stem) {
  const prefix = role === 'blocking' ? '阻挡_' : role === 'groundFx' ? '地表_' : '可穿过_';
  return prefix + stem;
}
function createPrefab(file, role) {
  const rel = path.relative(project, file).replaceAll('\\', '/');
  const stem = path.basename(file, '.png');
  const metaFile = `${file}.meta`;
  if (!fs.existsSync(metaFile)) throw new Error(`Missing texture meta: ${rel}`);
  const textureUuid = JSON.parse(fs.readFileSync(metaFile, 'utf8')).uuid;
  if (!textureUuid) throw new Error(`Missing texture UUID: ${rel}`);
  const sourceSize = pngSize(file);
  const alpha = pngAlphaBounds(file);
  const size = displaySize(sourceSize);
  const scaleX = size.width / sourceSize.width, scaleY = size.height / sourceSize.height;
  const name = prefabName(role, stem);
  if (existing.has(name)) return null;
  const fileStem = stableHex(rel);
  const rootId = fileStem;
  const imageId = stableHex(`${rel}:image`);
  const pivotX = Math.round(((alpha.minX + alpha.maxX + 1) / 2) * scaleX);
  const pivotY = Math.round((alpha.maxY + 1) * scaleY);
  const comps = [];
  if (role !== 'groundFx') comps.push({
    '_$type': '1806c38c-ebc3-45d1-a8a0-322ed94be4cb',
    scriptPath: '../../../src/systems/DepthSortable.ts',
    groundY: pivotY,
  }, {
    '_$type': 'ad602582-0a8d-4d34-8573-3cab8b47a2b0',
    scriptPath: '../../../src/systems/ImageDepthOccluder.ts',
    imageNode: { '_$ref': imageId },
  });
  if (role === 'blocking') {
    const relative = path.relative(project, file).replaceAll('\\', '/');
    const isWall = relative.includes('/buildings/') || /fence|cliff|lookout|pickup|bridge|bunker|checkpoint|sawmill/i.test(stem);
    const solidSpan = alpha.maxX - alpha.minX + 1;
    const blockWidth = Math.max(12, Math.round(solidSpan * (isWall ? 0.72 : /tree|pine|stump|sapling/i.test(stem) ? 0.28 : 0.55) * scaleX));
    const blockHeight = Math.max(12, Math.round(Math.min((alpha.maxY - alpha.minY + 1) * 0.13 * scaleY, 30)));
    comps.push({
      '_$type': '20c26d35-af30-488e-9ed0-20b58656a0cb',
      scriptPath: '../../../src/systems/DepthObstacle.ts',
      blockX: Math.max(0, Math.round(alpha.minX * scaleX + (solidSpan * scaleX - blockWidth) / 2)),
      blockY: Math.max(0, pivotY - blockHeight),
      blockWidth,
      blockHeight,
    });
  }
  const effect = groundFx.has(stem) ? [1, 0.9] : windFx.get(stem);
  const imageComponents = effect ? [{
    '_$type': 'b38c8c9f-4382-48a4-904d-29878f66a31b',
    scriptPath: '../../../src/systems/ForestDecorationShader.ts',
    effect: effect[0],
    amplitude: effect[1],
    phase: Number((parseInt(stableHex(`${rel}:phase`, 4), 16) / 65535 * Math.PI * 2).toFixed(4)),
  }] : undefined;
  const prefab = {
    '_$ver': 1,
    '_$id': rootId,
    '_$type': 'Sprite',
    name,
    width: size.width,
    height: size.height,
    pivotX,
    pivotY,
    '_$comp': comps,
    '_$child': [{
      '_$id': imageId,
      '_$type': 'Sprite',
      name: '图片_可替换',
      width: size.width,
      height: size.height,
      texture: { '_$uuid': textureUuid, '_$type': 'Texture' },
      ...(imageComponents ? { '_$comp': imageComponents } : {}),
    }],
  };
  const out = path.join(outRoot, `${name}.lh`);
  fs.writeFileSync(out, `${JSON.stringify(prefab, null, 2)}\n`, 'utf8');
  fs.writeFileSync(`${out}.meta`, `${JSON.stringify({ uuid: stableUuid(`prefab:${rel}`) }, null, 2)}\n`, 'utf8');
  return { source: rel, prefab: path.relative(project, out).replaceAll('\\', '/'), role };
}

fs.mkdirSync(outRoot, { recursive: true });
const all = [...filesRecursive(forestRoot), ...filesRecursive(elementsRoot)].sort();
const inventory = [];
const built = [];
for (const file of all) {
  const rel = path.relative(project, file).replaceAll('\\', '/');
  const stem = path.basename(file, '.png');
  const role = classify(stem, rel);
  if (existingByStem.has(stem)) {
    inventory.push({ source: rel, role, prefab: `assets/prefab/forest-decoration/${existingByStem.get(stem)}.lh` });
    continue;
  }
  inventory.push({ source: rel, role });
  if (role === 'ground' || role === 'actor') continue;
  const result = createPrefab(file, role);
  if (result) built.push(result);
}
fs.writeFileSync(path.join(outRoot, 'asset-roles.json'), `${JSON.stringify({ inventory, prefabs: built }, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(outRoot, 'asset-roles.json.meta'), `${JSON.stringify({ uuid: stableUuid('asset:forest-decoration:asset-roles.json') }, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(outRoot, 'README.md.meta'), `${JSON.stringify({ uuid: stableUuid('asset:forest-decoration:README.md') }, null, 2)}\n`, 'utf8');
console.log(`Classified ${inventory.length} images; generated ${built.length} reusable forest prefabs.`);
