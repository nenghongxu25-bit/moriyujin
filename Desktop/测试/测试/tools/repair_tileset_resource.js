const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const tileSetPath = path.join(projectRoot, "assets", "tileset", "tileset.tres");
const tileSetMetaPath = `${tileSetPath}.meta`;
const spriteMetaPath = path.join(projectRoot, "assets", "tileset", "spritesheet.png.meta");
const scenes = [
    path.join(projectRoot, "assets", "scenes", "cunzhuang.ls"),
    path.join(projectRoot, "assets", "scenes", "mine.ls"),
];

const SOURCE_SPRITESHEET = path.join("D:", "Desktop", "itch素材", "isometric tileset", "isometric tileset", "spritesheet.png");
const DEFAULT_TILESET_UUID = "72c87429-3034-403a-b525-56e4ad5a71a7";
const SPRITESHEET_UUID = "bd293737-4429-47c6-9994-6bd8b288ecb6";
const OLD_TILESET_UUID = "6ea46a08-f8d2-4eec-abb9-52de164c3f82";
const TILE_SIZE = 32;
const ATLAS_WIDTH = 352;
const ATLAS_HEIGHT = 352;
const COLUMNS = ATLAS_WIDTH / TILE_SIZE;
const ROWS = ATLAS_HEIGHT / TILE_SIZE;

function vector2(x, y) {
    return { "_$type": "Vector2", x, y };
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function makeCellData(gid) {
    return {
        "_$type": "TileSetCellData",
        "rotateCount": 0,
        "texture_origin": vector2(0, 0),
        "z_index": 0,
        "y_sort_origin": 0,
        "terrainSet": -1,
        "terrain": -1,
        "_terrain_peering_bits": new Array(16).fill(-1)
    };
}

function makeAlternative(x, y, gid) {
    return {
        "_$type": "TileAlternativesData",
        "localPos": vector2(x, y),
        "sizeByAtlas": vector2(1, 1),
        "animation_columns": 0,
        "animation_separation": vector2(0, 0),
        "animation_speed": 1,
        "animationMode": null,
        "animationFrams": [],
        "tileDatas": {
            "0": makeCellData(gid),
            "_$type": "Record"
        }
    };
}

function makeTiles() {
    const tiles = {};
    for (let y = 0; y < ROWS; y++) {
        const row = {};
        for (let x = 0; x < COLUMNS; x++) {
            // Laya stores tile native ids on a 32-wide row stride for this map data.
            row[x] = makeAlternative(x, y, y * 32 + x);
        }
        row._$type = "Record";
        tiles[y] = row;
    }
    tiles._$type = "Record";
    return tiles;
}

function main() {
    fs.mkdirSync(path.dirname(spriteMetaPath), { recursive: true });
    if (!fs.existsSync(path.join(projectRoot, "assets", "tileset", "spritesheet.png"))) {
        fs.copyFileSync(SOURCE_SPRITESHEET, path.join(projectRoot, "assets", "tileset", "spritesheet.png"));
    }
    if (!fs.existsSync(spriteMetaPath)) {
        writeJson(spriteMetaPath, {
            "uuid": SPRITESHEET_UUID,
            "importer": {
                "textureType": 2
            }
        });
    }

    if (!fs.existsSync(tileSetMetaPath)) {
        writeJson(tileSetMetaPath, {
            "uuid": DEFAULT_TILESET_UUID
        });
    }

    const spriteMeta = readJson(spriteMetaPath);
    const tileSetMeta = readJson(tileSetMetaPath);
    const tileSetUuid = tileSetMeta.uuid || DEFAULT_TILESET_UUID;

    writeJson(tileSetPath, {
        "_$type": "TileSet",
        "tileShape": 0,
        "tileSize": vector2(TILE_SIZE, TILE_SIZE),
        "groups": [
            {
                "_$type": "TileSetCellGroup",
                "id": 1,
                "name": "spritesheet",
                "_maxAlternativesCount": 1,
                "_maxCellCount": 32,
                "atlas": {
                    "_$uuid": spriteMeta.uuid,
                    "_$type": "Texture2D"
                },
                "atlasSize": vector2(ATLAS_WIDTH, ATLAS_HEIGHT),
                "margin": vector2(0, 0),
                "separation": vector2(0, 0),
                "textureRegionSize": vector2(TILE_SIZE, TILE_SIZE),
                "tiles": makeTiles()
            }
        ]
    });

    for (const scenePath of scenes) {
        const scene = fs.readFileSync(scenePath, "utf8");
        if (!scene.includes(OLD_TILESET_UUID) && !scene.includes(DEFAULT_TILESET_UUID) && !scene.includes(tileSetUuid)) {
            console.warn(`No known tileset uuid found in ${path.relative(projectRoot, scenePath)}`);
            continue;
        }
        fs.writeFileSync(scenePath
            , scene
                .replaceAll(OLD_TILESET_UUID, tileSetUuid)
                .replaceAll(DEFAULT_TILESET_UUID, tileSetUuid));
    }

    console.log(`Rebuilt ${path.relative(projectRoot, tileSetPath)} with ${COLUMNS * ROWS} tiles`);
    console.log(`Updated scene TileSet references to ${tileSetUuid}`);
}

main();
