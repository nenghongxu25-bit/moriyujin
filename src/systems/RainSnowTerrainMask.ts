import { ForestWeatherMask } from "./ForestWeatherMask";

/** Terrain sampling for rain/snow only. River rendering keeps its existing mask. */
export class RainSnowTerrainMask {
    static fitToGround = ForestWeatherMask.fitToGround;
    private textures: Laya.Texture2D[] = [];
    static readonly uniforms = {
        u_weatherCells: Laya.ShaderDataType.Texture2D,
        u_weatherTransforms: Laya.ShaderDataType.Texture2D,
        u_weatherAtlas: Laya.ShaderDataType.Texture2D,
        u_weatherBounds: Laya.ShaderDataType.Vector4,
        u_weatherGrid: Laya.ShaderDataType.Vector4,
        u_weatherShape: Laya.ShaderDataType.Vector4,
        u_weatherAtlasSize: Laya.ShaderDataType.Vector4,
        u_weatherRegion: Laya.ShaderDataType.Vector4,
        u_weatherLocalX: Laya.ShaderDataType.Vector4,
        u_weatherLocalY: Laya.ShaderDataType.Vector4
    };
    static readonly glsl = `
        vec2 forestSurface(vec2 point) {
            if (u_weatherBounds.z<0.5) return vec2(0.0);
            vec3 p=vec3(point,1.0);
            vec2 local=vec2(dot(p,u_weatherLocalX.xyz),dot(p,u_weatherLocalY.xyz));
            vec2 g=(local-u_weatherGrid.xy)/u_weatherGrid.zw;
            vec2 cell=floor(g+0.5);
            vec2 center=cell;
            if (u_weatherShape.x>0.5) {
                vec2 delta=g-cell;
                float offX=0.0, offY=0.0;
                if (abs(delta.x)+abs(delta.y)>0.5) {
                    offX=delta.x<0.0?-1.0:0.0;
                    offY=delta.y<0.0?-1.0:1.0;
                    if (u_weatherShape.y<0.0) offX+=1.0;
                }
                cell=vec2(cell.x+offX,cell.y*2.0+offY);
                center=vec2(cell.x+mod(cell.y,2.0)*0.5*u_weatherShape.y,cell.y*0.5);
            }
            vec2 index=cell-u_weatherBounds.xy;
            if (any(lessThan(index,vec2(0.0))) || any(greaterThanEqual(index,u_weatherBounds.zw))) return vec2(0.0);
            vec2 lookup=(index+0.5)/u_weatherBounds.zw;
            vec4 data=texture2D(u_weatherCells,lookup);
            if (data.a<0.5) return vec2(0.0);
            vec2 tile=floor(data.rg*255.0+0.5)-1.0;
            vec4 transform=(texture2D(u_weatherTransforms,lookup)*255.0-127.0)/127.0;
            vec2 relative=(g-center)*u_weatherGrid.zw/u_weatherRegion.xy;
            vec2 within=vec2(dot(relative,transform.xy),dot(relative,transform.zw))+0.5;
            if (any(lessThan(within,vec2(0.0))) || any(greaterThan(within,vec2(1.0)))) return vec2(0.0);
            within=clamp(within,0.5/u_weatherRegion.xy,1.0-0.5/u_weatherRegion.xy);
            vec2 uv=(u_weatherRegion.zw+tile*u_weatherAtlasSize.zw+within*u_weatherRegion.xy)/u_weatherAtlasSize.xy;
            vec4 terrain=texture2D(u_weatherAtlas,uv);
            float water=smoothstep(0.015,0.07,terrain.b-terrain.r)*smoothstep(0.01,0.06,terrain.g-terrain.r);
            return vec2(1.0-water,water)*terrain.a;
        }
        float forestLand(vec2 point) { return forestSurface(point).x; }
        float forestWater(vec2 point) { return forestSurface(point).y; }
    `;

    bind(material: Laya.Material, ground: Laya.Sprite | null, overlay: Laya.Sprite): void {
        this.destroy();
        const data=material.shaderData, id=Laya.Shader3D.propertyNameToID;
        const vector=(name: string, x=0, y=0, z=0, w=0) => data.setVector(id(name),new Laya.Vector4(x,y,z,w));
        for (const name of ["u_weatherCells","u_weatherTransforms","u_weatherAtlas"])
            data.setTexture(id(name),Laya.Texture2D.whiteTexture);
        vector("u_weatherBounds");
        vector("u_weatherShape",0,1,0.65,0);
        const layer=ground?.getComponent(Laya.TileMapLayer), rect=layer?.rect;
        if (!layer || !rect || rect.z<=rect.x || rect.w<=rect.y) return;
        const iso=layer.tileSet.tileShape===Laya.TileShape.TILE_SHAPE_ISOMETRIC;
        if (!iso && layer.tileSet.tileShape!==Laya.TileShape.TILE_SHAPE_SQUARE) return;
        const tile=layer.tileSet.tileSize, origin=new Laya.Vector2(), odd=new Laya.Vector2();
        layer.gridToPixel(0,0,origin); layer.gridToPixel(0,1,odd);
        const stagger=iso && odd.x<origin.x?-1:1;
        vector("u_weatherGrid",origin.x,origin.y,tile.x,tile.y);
        vector("u_weatherShape",iso?1:0,stagger,iso?tile.y/tile.x:0.65,0);
        const point=(x: number,y: number) => ground.globalToLocal(overlay.localToGlobal(new Laya.Point(x,y),true),false);
        const p0=point(0,0), px=point(1,0), py=point(0,1);
        vector("u_weatherLocalX",px.x-p0.x,py.x-p0.x,p0.x);
        vector("u_weatherLocalY",px.y-p0.y,py.y-p0.y,p0.y);
        const minX=Math.floor((rect.x-origin.x)/tile.x)-2;
        const maxX=Math.ceil((rect.z-origin.x)/tile.x)+2;
        const minY=Math.floor((rect.y-origin.y)/tile.y*(iso?2:1))-2;
        const maxY=Math.ceil((rect.w-origin.y)/tile.y*(iso?2:1))+2;
        const cols=maxX-minX+1, rows=maxY-minY+1;
        const cells=new Uint8Array(cols*rows*4), transforms=new Uint8Array(cols*rows*4);
        let group: Laya.TileSetCellGroup=null, count=0;
        for(let y=minY;y<=maxY;y++) for(let x=minX;x<=maxX;x++) {
            const cell=layer.getCellData(x,y,false);
            if (!cell) continue;
            const source=cell.cell.cellowner, owner=source.owner;
            if (!owner.atlas) continue;
            if (!group) group=owner;
            // This forest palette uses one atlas of single-cell tiles.
            if (owner!==group) continue;
            const i=((y-minY)*cols+x-minX)*4;
            cells[i]=source.localPos.x+1; cells[i+1]=source.localPos.y+1; cells[i+3]=255;
            const uv=Laya.TileMapUtils.parseTransFlag(layer.tileSet.tileShape,cell._transFlag,cell.cell);
            [uv.x,uv.y,uv.z,uv.w].forEach((v,j)=>transforms[i+j]=Math.round((v+1)*127));
            count++;
        }
        if (!group || !count) return;
        const upload=(name: string,pixels: Uint8Array) => {
            const texture=new Laya.Texture2D(cols,rows,Laya.TextureFormat.R8G8B8A8,false,false);
            texture.filterMode=Laya.FilterMode.Point;
            texture.setPixelsData(pixels,false,false); this.textures.push(texture);
            data.setTexture(id(name),texture);
        };
        upload("u_weatherCells",cells); upload("u_weatherTransforms",transforms);
        data.setTexture(id("u_weatherAtlas"),group.atlas);
        const region=group.textureRegionSize, margin=group.margin, gap=group.separation;
        vector("u_weatherAtlasSize",group.atlas.width,group.atlas.height,region.x+gap.x,region.y+gap.y);
        vector("u_weatherRegion",region.x,region.y,margin.x,margin.y);
        vector("u_weatherBounds",minX,minY,cols,rows);
        console.log("[RainSnowTerrainMask] "+(iso?"isometric":"square")+", cells="+count+", lookup="+cols+"x"+rows);
    }
    destroy(): void { this.textures.forEach(t=>t.destroy()); this.textures=[]; }
}
