import { ForestWeatherMask } from "./ForestWeatherMask";
const { regClass, property } = Laya;

/** Slow motion of the existing water texture, clipped to fixed river banks. */
@regClass("5398903d-897b-4ead-bb18-d1b67f35be7f")
export class ForestWaterFlow extends Laya.Script {
    @property(Laya.Sprite) public groundNode: Laya.Sprite | null = null;
    @property(Number) public speed = 12;
    @property(Number) public amplitude = 5;
    private static registered = false;
    private material: Laya.Material | null = null;
    private original: Laya.Material | null = null;
    private mask = new ForestWeatherMask();
    private elapsed = 0;
    private state = new Laya.Vector4();

    // Start runs after the scene's node references/textures and the ground renderer have initialized.
    onStart(): void {
        const node = this.owner as Laya.Sprite, texture = node.texture;
        if (!texture || !this.groundNode || !ForestWeatherMask.fitToGround(this.groundNode, node)) {
            console.warn("[ForestWaterFlow] Missing texture/ground bounds; original static water retained.");
            return;
        }
        ForestWaterFlow.register();
        this.original = node.material;
        const material = this.material = new Laya.Material();
        material.setShaderName("ForestWaterFlow");
        material.cull = Laya.RenderState.CULL_NONE;
        this.mask.bind(material, this.groundNode, node);
        const uv = texture.uv, id = Laya.Shader3D.propertyNameToID;
        material.shaderData.setTexture(id("u_flowTexture"), texture.bitmap);
        material.shaderData.setVector(id("u_flowUV"), new Laya.Vector4(uv[0],uv[1],uv[2]-uv[0],uv[7]-uv[1]));
        material.shaderData.setVector(id("u_flowRect"), new Laya.Vector4(node.width,node.height,node.x,node.y));
        node.material = material;
        node.alpha = 1;
        this.updateState();
    }
    onEnable(): void { (this.owner as Laya.Sprite).alpha = this.material ? 1 : 0; }
    onDisable(): void { (this.owner as Laya.Sprite).alpha = 0; }
    onUpdate(): void {
        if (!this.material) return;
        this.elapsed += Math.min(0.1,Math.max(0,Laya.timer.delta)/1000);
        this.updateState();
    }
    private updateState(): void {
        const travel = this.elapsed*Math.max(0,this.speed);
        this.state.setValue((travel*0.8)%128,(travel*0.3)%128,
            Math.sin(this.elapsed*0.45)*Math.max(0,this.amplitude),
            Math.cos(this.elapsed*0.37)*Math.max(0,this.amplitude));
        this.material.shaderData.setVector(Laya.Shader3D.propertyNameToID("u_flowState"),this.state);
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
        const shader=Laya.Shader3D.add("ForestWaterFlow");
        shader.shaderType=Laya.ShaderFeatureType.D2_TextureSV;
        const sub=new Laya.SubShader({
            a_posuv:[0,Laya.ShaderDataType.Vector4],a_attribColor:[1,Laya.ShaderDataType.Vector4],
            a_attribFlags:[2,Laya.ShaderDataType.Vector4],a_customs:[3,Laya.ShaderDataType.Vector4]
        },{
            ...ForestWeatherMask.uniforms,
            u_flowTexture:Laya.ShaderDataType.Texture2D,u_flowUV:Laya.ShaderDataType.Vector4,
            u_flowRect:Laya.ShaderDataType.Vector4,u_flowState:Laya.ShaderDataType.Vector4
        });
        shader.addSubShader(sub);
        sub.addShaderPass(`
            #include "Sprite2DVertex.glsl";
            varying vec2 v_water;
            void main() {
                vertexInfo info; getVertexInfo(info);
                v_texcoordAlpha=info.texcoordAlpha; v_color=info.color;
                v_useTex=info.useTex; v_useClip=info.useClip; v_customs=info.customs;
                #ifdef USE_TEX_ARRAY
                v_texLayer=a_attribFlags.w;
                #endif
                v_water=(info.texcoordAlpha.xy-u_flowUV.xy)/u_flowUV.zw*u_flowRect.xy;
                gl_Position=getPosition(info.pos);
            }`,`
            #if defined(GL_FRAGMENT_PRECISION_HIGH)
            precision highp float;
            #else
            precision mediump float;
            #endif
            #include "Sprite2DFrag.glsl";
            varying vec2 v_water;
            ${ForestWeatherMask.glsl}
            void main() {
                clip();
                // The mask never moves; only the interior texture coordinates do.
                float water=forestWater(v_water);
                if(water<0.005) discard;
                vec2 world=v_water+u_flowRect.zw;
                vec2 wobble=vec2(sin(world.y*0.035),cos(world.x*0.027))*u_flowState.zw;
                vec2 uv=fract((world+u_flowState.xy+wobble)/128.0);
                uv=mix(vec2(0.5/128.),vec2(127.5/128.),uv);
                vec4 color=transspaceColor(texture2D(u_flowTexture,u_flowUV.xy+uv*u_flowUV.zw));
                setglColor(color*water);
            }`);
        this.registered=true;
    }
}
