/** Forest terrain lookup; no UI or image assets are generated or modified. */
export class ForestWeatherMask {
    private lookup: Laya.Texture2D | null = null;
    static readonly uniforms = {
        u_terrainCells: Laya.ShaderDataType.Texture2D,
        u_terrainAtlas: Laya.ShaderDataType.Texture2D,
        u_terrainGrid: Laya.ShaderDataType.Vector4,
        u_terrainAtlasSize: Laya.ShaderDataType.Vector4
    };
    static readonly glsl = `
        float forestLand(vec2 point) {
            if (u_terrainGrid.x<0.5) return 1.0;
            vec2 grid=point/u_terrainGrid.zw;
            vec2 cell=floor(grid);
            if (cell.x<0.0 || cell.y<0.0 || cell.x>=u_terrainGrid.x || cell.y>=u_terrainGrid.y) return 0.0;
            vec4 data=texture2D(u_terrainCells,(cell+0.5)/u_terrainGrid.xy);
            if (data.a<0.5) return 0.0;
            vec2 tile=floor(data.rg*255.0+0.5)-1.0;
            vec2 within=clamp(fract(grid),0.5/u_terrainGrid.zw,vec2(1.)-0.5/u_terrainGrid.zw);
            vec2 uv=(tile+within)*u_terrainGrid.zw/u_terrainAtlasSize.xy;
            vec3 terrain=texture2D(u_terrainAtlas,uv).rgb;
            // This forest atlas's water is blue-green; grass, soil and rocks are not.
            float water=smoothstep(0.015,0.07,terrain.b-terrain.r)
                       *smoothstep(0.01,0.06,terrain.g-terrain.r);
            return 1.0-water;
        }
    `;
    bind(material: Laya.Material, ground: Laya.Sprite | null, overlay: Laya.Sprite): void {
        const data = material.shaderData, id = Laya.Shader3D.propertyNameToID;
        data.setVector(id("u_terrainGrid"), new Laya.Vector4());
        data.setTexture(id("u_terrainCells"), Laya.Texture2D.whiteTexture);
        data.setTexture(id("u_terrainAtlas"), Laya.Texture2D.whiteTexture);
        data.setVector(id("u_terrainAtlasSize"), new Laya.Vector4(1, 1, 0, 0));
        if (!ground) return;
        const layer = ground.getComponent(Laya.TileMapLayer);
        if (!layer) return;
        const tile = layer.tileSet.tileSize;
        const cols = Math.ceil(overlay.width / tile.x), rows = Math.ceil(overlay.height / tile.y);
        const pixels = new Uint8Array(cols * rows * 4);
        let atlas: Laya.Texture2D | null = null;
        const point = new Laya.Point();
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
            point.setTo((x + 0.5) * tile.x, (y + 0.5) * tile.y);
            overlay.localToGlobal(point, false); ground.globalToLocal(point, false);
            const cell = layer.getCellData(point.x, point.y, true);
            if (!cell) continue;
            const source = cell.cell.cellowner;
            atlas = source.owner.atlas;
            const i = (y * cols + x) * 4;
            pixels[i] = source.localPos.x + 1;
            pixels[i + 1] = source.localPos.y + 1;
            pixels[i + 3] = 255;
        }
        if (!atlas) return;
        this.lookup = new Laya.Texture2D(cols, rows, Laya.TextureFormat.R8G8B8A8, false, false);
        this.lookup.filterMode = Laya.FilterMode.Point;
        this.lookup.setPixelsData(pixels, false, false);
        data.setTexture(id("u_terrainCells"), this.lookup);
        data.setTexture(id("u_terrainAtlas"), atlas);
        data.setVector(id("u_terrainGrid"), new Laya.Vector4(cols, rows, tile.x, tile.y));
        data.setVector(id("u_terrainAtlasSize"), new Laya.Vector4(atlas.width, atlas.height, 0, 0));
    }
    destroy(): void { this.lookup?.destroy(); this.lookup = null; }
}
