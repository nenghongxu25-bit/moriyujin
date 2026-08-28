const fs = require("fs");
const path = require("path");

const scenePath = path.join(__dirname, "..", "assets", "scenes", "forest.ls");
const backupPath = path.join(__dirname, "..", "assets", "scenes", "forest.before_map_bake.ls");
const tileDir = path.join(__dirname, "..", "assets", "tileset", "baked");

const SEED = 20260825;
const TILE_SIZE = 128;
const COLS = 30;
const ROWS = 18;
const START_X = 0;
const START_Y = 0;
const STAR_SKY_SCRIPT_UUID = "ee3c57f1-ce7b-4110-a620-2909d8fa8e70";

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function hash2(x, y) {
    const v = Math.sin(x * 127.1 + y * 311.7 + SEED * 0.013) * 43758.5453123;
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
    let amp = 0.55;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < 4; i++) {
        sum += valueNoise(x * freq, y * freq) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2.05;
    }
    return norm > 0 ? sum / norm : 0;
}

function chooseTile(x, y) {
    const biome = fbm(x * 0.075, y * 0.075);
    const detail = fbm(x * 0.22 + 17.1, y * 0.22 - 9.7);
    const speckle = hash2(x, y);

    if (biome < 0.23) return 0;
    if (biome < 0.36) return 1;
    if (biome > 0.78) return 7;
    if (biome > 0.66) return 6;
    if (detail > 0.72) return 4;
    if (detail < 0.25) return 2;
    if (speckle > 0.88) return 5;
    return 3;
}

function walk(value, visitor) {
    if (!value || typeof value !== "object") return;
    visitor(value);
    for (const child of Object.values(value)) {
        if (child && typeof child === "object") {
            walk(child, visitor);
        }
    }
}

function findNodeByName(scene, name) {
    let result = null;
    walk(scene, (node) => {
        if (!result && node.name === name) {
            result = node;
        }
    });
    return result;
}

function loadTileUuids() {
    const uuids = [];
    for (let i = 0; i < 8; i++) {
        const metaPath = path.join(tileDir, `forest_tile_${i}.png.meta`);
        uuids.push(readJson(metaPath).uuid);
    }
    return uuids;
}

function makeTileNode(id, x, y, uuid) {
    return {
        "_$id": id,
        "_$type": "GImage",
        "name": "tile",
        "x": x,
        "y": y,
        "width": TILE_SIZE,
        "height": TILE_SIZE,
        "src": `res://${uuid}`,
    };
}

function makeBakedTerrain(tileUuids) {
    const children = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tileIndex = chooseTile(col, row);
            children.push(makeTileNode(
                `baked_${row}_${col}`,
                START_X + col * TILE_SIZE,
                START_Y + row * TILE_SIZE,
                tileUuids[tileIndex],
            ));
        }
    }

    return {
        "_$id": "bakedterrain",
        "_$type": "Sprite",
        "name": "BakedTerrain",
        "width": COLS * TILE_SIZE,
        "height": ROWS * TILE_SIZE,
        "_$child": children,
    };
}

function main() {
    const raw = fs.readFileSync(scenePath, "utf8");
    if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, raw);
    }

    const scene = JSON.parse(raw);
    const mapLayer = findNodeByName(scene, "MapLayer");
    if (!mapLayer) {
        throw new Error("MapLayer not found in forest.ls");
    }

    if (Array.isArray(mapLayer._$comp)) {
        mapLayer._$comp = mapLayer._$comp.filter((comp) => comp._$type !== STAR_SKY_SCRIPT_UUID);
        if (mapLayer._$comp.length === 0) {
            delete mapLayer._$comp;
        }
    }

    const tileUuids = loadTileUuids();
    const existingChildren = Array.isArray(mapLayer._$child) ? mapLayer._$child : [];
    const keptChildren = existingChildren.filter((child) => child.name !== "BakedTerrain" && child.name !== "img");
    mapLayer._$child = [makeBakedTerrain(tileUuids), ...keptChildren];

    writeJson(scenePath, scene);
    console.log(`Baked ${COLS * ROWS} GImage tiles into MapLayer`);
    console.log(`Backup: ${backupPath}`);
}

main();
