import { ForestWeatherMask } from "./ForestWeatherMask";
import { GroundRain } from "./GroundRain";
const { regClass, property } = Laya;

/** Non-destructive river material on an authored ground node; original shores remain untouched. */
@regClass("84a44a28-839f-4ea1-9d82-4dfd9450b17c")
export class ForestRiverSurface extends Laya.Script {
    @property(Laya.Sprite) public groundNode: Laya.Sprite | null = null;
    @property(Laya.Sprite) public rainNode: Laya.Sprite | null = null;
    @property({ type: Number, min: 0, max: 1 }) public opacity = 0.96;
    @property({ type: Number, min: 0, max: 1 }) public waveStrength = 0.65;
    private static registered = false;
    private material: Laya.Material | null = null;
    private original: Laya.Material | null = null;
    private mask = new ForestWeatherMask();
    private rain: GroundRain | null = null;
    private time = 0;
    private state = new Laya.Vector4();

    onAwake(): void {
        const node = this.owner as Laya.Sprite;
        if (!node.texture || !this.groundNode) return;
        ForestRiverSurface.register();
        this.rain = this.rainNode?.getComponent(GroundRain) ?? null;
        this.original = node.material;
        const material = this.material = new Laya.Material();
        material.setShaderName("ForestRiverSurface");
        material.cull = Laya.RenderState.CULL_NONE;
        this.mask.bind(material, this.groundNode, node);
        const uv = node.texture.uv, id = Laya.Shader3D.propertyNameToID;
        material.shaderData.setVector(id("u_riverUV"), new Laya.Vector4(uv[0],uv[1],uv[2]-uv[0],uv[7]-uv[1]));
        material.shaderData.setVector(id("u_riverRect"), new Laya.Vector4(node.width,node.height,node.x,node.y));
        node.material = material;
        this.updateState();
        // TEMP_RIVER_VIEW: removed after runtime verification.
        Laya.timer.once(1000,this,()=>{
            this.rain = this.rainNode?.getComponent(GroundRain) ?? null;
            console.log("[RiverCheck]",!!this.material,!!this.groundNode,!!this.rain,!!this.rain?.playerNode);
            this.rain?.playerNode?.pos(3950,4000);
        });
    }
    onEnable(): void { (this.owner as Laya.Sprite).alpha = this.material ? 1 : 0; }
    onDisable(): void { (this.owner as Laya.Sprite).alpha = 0; }
    onUpdate(): void {
        if (!this.material) return;
        // This node precedes GroundRain in the scene, whose component may not exist during our Awake.
        if (!this.rain || this.rain.destroyed) this.rain = this.rainNode?.getComponent(GroundRain) ?? null;
        this.time += Math.max(0, Laya.timer.delta) / 1000;
        this.updateState();
    }
    private updateState(): void {
        const rain = this.rainNode?.activeInHierarchy && this.rain?.enabled ? this.rain.rainIntensity : 0;
        this.state.setValue(this.time, Math.max(0,Math.min(1,rain)),
            Math.max(0,Math.min(1,this.opacity)), Math.max(0,Math.min(1,this.waveStrength)));
        this.material.shaderData.setVector(Laya.Shader3D.propertyNameToID("u_riverState"),this.state);
        (this.owner as Laya.Sprite).repaint();
    }
    onDestroy(): void {
        const node = this.owner as Laya.Sprite;
        if (node && !node.destroyed && node.material === this.material) {
            node.material = this.original; node.alpha = 0;
        }
        this.material?.destroy(); this.material = null; this.mask.destroy();
    }
    private static register(): void {
        if (this.registered) return;
        const shader=Laya.Shader3D.add("ForestRiverSurface");
        shader.shaderType=Laya.ShaderFeatureType.D2_TextureSV;
        const sub=new Laya.SubShader({
            a_posuv:[0,Laya.ShaderDataType.Vector4],a_attribColor:[1,Laya.ShaderDataType.Vector4],
            a_attribFlags:[2,Laya.ShaderDataType.Vector4],a_customs:[3,Laya.ShaderDataType.Vector4]
        },{
            ...ForestWeatherMask.uniforms,
            u_riverUV:Laya.ShaderDataType.Vector4,u_riverRect:Laya.ShaderDataType.Vector4,
            u_riverState:Laya.ShaderDataType.Vector4
        });
        shader.addSubShader(sub);
        sub.addShaderPass(`
            #include "Sprite2DVertex.glsl";
            varying vec2 v_river;
            void main() {
                vertexInfo info; getVertexInfo(info);
                v_texcoordAlpha=info.texcoordAlpha; v_color=info.color;
                v_useTex=info.useTex; v_useClip=info.useClip; v_customs=info.customs;
                #ifdef USE_TEX_ARRAY
                v_texLayer=a_attribFlags.w;
                #endif
                v_river=(info.texcoordAlpha.xy-u_riverUV.xy)/u_riverUV.zw*u_riverRect.xy;
                gl_Position=getPosition(info.pos);
            }`,`
            #if defined(GL_FRAGMENT_PRECISION_HIGH)
            precision highp float;
            #else
            precision mediump float;
            #endif
            #include "Sprite2DFrag.glsl";
            varying vec2 v_river;
            ${ForestWeatherMask.glsl}
            float hash(vec2 p) {
                p=fract(p*vec2(0.1031,0.11369));p+=dot(p,p.yx+19.19);
                return fract((p.x+p.y)*p.x);
            }
            float noise(vec2 p) {
                vec2 i=floor(p), f=fract(p);f=f*f*(3.-2.*f);
                return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                    mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
            }
            float rainRing(vec2 p) {
                vec2 cell=floor(p/vec2(108.,78.));
                float clock=u_riverState.x/1.9+hash(cell);
                float age=fract(clock), cycle=floor(clock);
                vec2 center=vec2(0.3)+0.4*vec2(hash(cell+cycle),hash(cell-cycle+4.7));
                vec2 d=(fract(p/vec2(108.,78.))-center)*vec2(108.,78.);d.y/=0.65;
                float ring=1.-smoothstep(0.6,1.7,abs(length(d)-(2.+age*27.)));
                return ring*smoothstep(0.,0.07,age)*(1.-age)*(1.-age);
            }
            void main() {
                clip();
                float water=forestWater(v_river);
                if(water<0.005) discard;
                vec2 p=v_river+u_riverRect.zw;
                float time=u_riverState.x;
                // Broad, continuous tones across tiles; no repeated tile-sized bright speckles.
                float depth=noise(p/300.)*0.7+noise(p/125.+8.)*0.3;
                vec3 color=mix(vec3(0.18,0.29,0.32),vec3(0.28,0.40,0.42),depth);
                float nearLand=1.-min(min(forestWater(v_river+vec2(22.,0.)),forestWater(v_river-vec2(22.,0.))),
                                    min(forestWater(v_river+vec2(0.,22.)),forestWater(v_river-vec2(0.,22.))));
                color=mix(color,vec3(0.36,0.45,0.42),nearLand*0.32);
                float distortion=noise(p/160.+vec2(time*0.012,0.))*6.;
                float wave=0.5+0.5*sin(p.y*0.065+distortion-time*0.7);
                float glint=smoothstep(0.92,1.,wave)*noise(p/85.+time*0.015);
                color+=vec3(0.05,0.065,0.065)*glint*u_riverState.w;
                float ring=rainRing(p)*u_riverState.y;
                color=mix(color,vec3(0.67,0.80,0.82),ring*0.5);
                float alpha=water*u_riverState.z;
                vec4 converted=transspaceColor(vec4(color,1.));
                setglColor(vec4(converted.rgb*alpha,alpha));
            }`);
        this.registered=true;
    }
}
