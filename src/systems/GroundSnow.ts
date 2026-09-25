const { regClass, property } = Laya;
import { RainSnowTerrainMask } from "./RainSnowTerrainMask";
import { ForestDecorationSnow } from "./ForestDecorationSnow";

/** Applies a repeating snow tile to walkable land on the authored ground overlay. */
@regClass("490e7f77-d07b-4c90-863b-e7bc71a68659")
export class GroundSnow extends Laya.Script {
    @property({ type: Number, min: 0, max: 1 }) public coverage = 0;
    @property(Boolean) public autoAccumulate = true;
    @property(Number) public accumulationSeconds = 30;
    @property(Number) public startDelaySeconds = 2;
    @property({ type: Number, min: 0, max: 1 }) public maxCoverage = 0.9;
    @property(Number) public tileSize = 128;
    @property(Number) public edgeFeather = 100;
    @property({ type: Number, min: 0, max: 100, caption: "Decoration snow (%)" })
    public decorationSnowPercent = 20;
    @property({ type: Boolean, caption: "Show snow on decorations" })
    public showDecorationSnow = false;
    @property({ type: Laya.Texture, caption: "Snow tile (ice/3.png)" })
    public snowTexture: Laya.Texture | null = null;
    @property(Laya.Sprite) public groundNode: Laya.Sprite | null = null;

    private terrainMask = new RainSnowTerrainMask();
    private static registered = false;
    private snowMaterial: Laya.Material | null = null;
    private previousMaterial: Laya.Material | null = null;
    private elapsed = 0;
    private appliedCoverage = -1;
    private appliedDecorationSnow = -1;

    onStart(): void {
        const node = this.owner as Laya.Sprite;
        const geometryTexture = node.texture;
        if (!geometryTexture || !this.snowTexture) {
            console.warn("[GroundSnow] Assign ice/3.png as the snowTexture.");
            return;
        }
        GroundSnow.registerShader();
        RainSnowTerrainMask.fitToGround(this.groundNode, node);
        this.previousMaterial = node.material;
        const material = this.snowMaterial = new Laya.Material();
        material.setShaderName("GroundSnowCoverage");
        material.cull = Laya.RenderState.CULL_NONE;
        const data = material.shaderData;
        const id = Laya.Shader3D.propertyNameToID;
        this.terrainMask.bind(material, this.groundNode, node);
        const spriteUV = geometryTexture.uv, snowUV = this.snowTexture.uv;
        data.setTexture(id("u_snowTexture"), this.snowTexture.bitmap);
        data.setVector(id("u_spriteUV"), new Laya.Vector4(spriteUV[0], spriteUV[1],
            spriteUV[2] - spriteUV[0], spriteUV[7] - spriteUV[1]));
        data.setVector(id("u_snowUV"), new Laya.Vector4(snowUV[0], snowUV[1],
            snowUV[2] - snowUV[0], snowUV[7] - snowUV[1]));
        data.setVector(id("u_snowSize"), new Laya.Vector4(node.width, node.height,
            Math.max(1, this.tileSize), 0));
        data.setVector(id("u_snowEdge"), new Laya.Vector4(Math.max(1, this.edgeFeather),
            node.x, node.y, 0));
        node.material = material;
        node.alpha = 1;
        this.applyCoverage();
    }

    onEnable(): void {
        (this.owner as Laya.Sprite).alpha = this.snowMaterial ? 1 : 0;
        this.applyDecorationSnow();
    }
    onDisable(): void {
        (this.owner as Laya.Sprite).alpha = 0;
        ForestDecorationSnow.setSnow(this.snowTexture, 0);
        this.appliedDecorationSnow = 0;
    }

    onUpdate(): void {
        if (!this.snowMaterial) return;
        const previous = Math.max(0, this.elapsed - Math.max(0, this.startDelaySeconds));
        this.elapsed += Math.max(0, Laya.timer.delta) / 1000;
        const current = Math.max(0, this.elapsed - Math.max(0, this.startDelaySeconds));
        if (this.autoAccumulate && this.coverage < this.maxCoverage) {
            this.coverage = Math.min(Math.max(0, Math.min(1, this.maxCoverage)),
                this.coverage + (current - previous) / Math.max(0.1, this.accumulationSeconds));
        }
        this.applyCoverage();
    }

    private applyCoverage(): void {
        this.coverage = Math.max(0, Math.min(1, this.coverage));
        this.applyDecorationSnow();
        if (this.coverage === this.appliedCoverage || !this.snowMaterial) return;
        this.snowMaterial.shaderData.setNumber(Laya.Shader3D.propertyNameToID("u_snowCoverage"), this.coverage);
        this.appliedCoverage = this.coverage;
        (this.owner as Laya.Sprite).repaint();
    }

    private applyDecorationSnow(): void {
        const percent = Math.max(0, Math.min(100, this.decorationSnowPercent));
        const amount = this.showDecorationSnow ? Math.round(this.coverage * percent) / 100 : 0;
        if (amount === this.appliedDecorationSnow) return;
        ForestDecorationSnow.setSnow(this.snowTexture, amount);
        this.appliedDecorationSnow = amount;
    }

    onDestroy(): void {
        const node = this.owner as Laya.Sprite;
        if (node && !node.destroyed && node.material === this.snowMaterial) {
            node.material = this.previousMaterial;
            node.alpha = 0;
        }
        this.snowMaterial?.destroy();
        this.snowMaterial = null;
        ForestDecorationSnow.setSnow(this.snowTexture, 0);
        this.terrainMask.destroy();
    }

    private static registerShader(): void {
        if (this.registered) return;
        const shader = Laya.Shader3D.add("GroundSnowCoverage");
        shader.shaderType = Laya.ShaderFeatureType.D2_TextureSV;
        const sub = new Laya.SubShader({
            a_posuv: [0, Laya.ShaderDataType.Vector4],
            a_attribColor: [1, Laya.ShaderDataType.Vector4],
            a_attribFlags: [2, Laya.ShaderDataType.Vector4],
            a_customs: [3, Laya.ShaderDataType.Vector4]
        }, {
            u_snowTexture: Laya.ShaderDataType.Texture2D,
            u_spriteUV: Laya.ShaderDataType.Vector4,
            u_snowUV: Laya.ShaderDataType.Vector4,
            u_snowSize: Laya.ShaderDataType.Vector4,
            u_snowEdge: Laya.ShaderDataType.Vector4,
            u_snowCoverage: Laya.ShaderDataType.Float,
            ...RainSnowTerrainMask.uniforms
        });
        shader.addSubShader(sub);
        sub.addShaderPass(`
            #include "Sprite2DVertex.glsl";
            varying vec2 v_snowLocal;
            void main() {
                vertexInfo info; getVertexInfo(info);
                v_texcoordAlpha=info.texcoordAlpha; v_color=info.color;
                v_useTex=info.useTex; v_useClip=info.useClip; v_customs=info.customs;
                #ifdef USE_TEX_ARRAY
                v_texLayer=a_attribFlags.w;
                #endif
                v_snowLocal=(info.texcoordAlpha.xy-u_spriteUV.xy)/u_spriteUV.zw*u_snowSize.xy;
                gl_Position=getPosition(info.pos);
            }`, `
            #if defined(GL_FRAGMENT_PRECISION_HIGH)
            precision highp float;
            #else
            precision mediump float;
            #endif
            #include "Sprite2DFrag.glsl";
            varying vec2 v_snowLocal;
            ${RainSnowTerrainMask.glsl}
            float snowHash(vec2 p) {
                p=fract(p*vec2(0.1031,0.11369));
                p+=dot(p,p.yx+19.19);
                return fract((p.x+p.y)*p.x);
            }
            float snowNoise(vec2 p) {
                vec2 cell=floor(p), f=fract(p);
                f=f*f*(3.0-2.0*f);
                float a=snowHash(cell);
                float b=snowHash(cell+vec2(1.0,0.0));
                float c=snowHash(cell+vec2(0.0,1.0));
                float d=snowHash(cell+vec2(1.0,1.0));
                return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
            }
            float snowAccumulationMask(vec2 world) {
                if (u_snowCoverage<=0.0) return 0.0;
                vec2 p=world/max(1.0,u_snowSize.z);
                float pattern=0.65*snowNoise(p+3.7)
                    +0.25*snowNoise(p*2.17+9.1)+0.1*snowNoise(p*5.1);
                float threshold=mix(-0.1,1.0,u_snowCoverage);
                return 1.0-smoothstep(threshold-0.022,threshold+0.022,pattern);
            }
            float snowLandCoverage(vec2 point) {
                // Bridge transparent hairline seams between adjacent isometric ground cells.
                float land=forestLand(point);
                land=max(land,forestLand(point+vec2(5.0,0.0)));
                land=max(land,forestLand(point-vec2(5.0,0.0)));
                land=max(land,forestLand(point+vec2(0.0,5.0)));
                land=max(land,forestLand(point-vec2(0.0,5.0)));
                return land;
            }
            void main() {
                clip();
                vec2 world=v_snowLocal+u_snowEdge.yz;
                if (u_weatherShape.x>0.5) world.y/=u_weatherShape.z;
                // Sample one fixed point from the snow tile; repeating the image caused visible tile grids.
                float grain=snowNoise(world/18.0);
                vec4 color=vec4(mix(vec3(0.90,0.94,1.0),vec3(1.0),grain*0.18),1.0);
                vec2 border=min(v_snowLocal,u_snowSize.xy-v_snowLocal);
                float edge=smoothstep(0.0,u_snowEdge.x,min(border.x,border.y));
                float accumulatedSnow=snowAccumulationMask(world);
                color*=accumulatedSnow*edge*snowLandCoverage(v_snowLocal);
                setglColor(color);
            }`);
        this.registered = true;
    }
}
