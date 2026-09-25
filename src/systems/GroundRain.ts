const { regClass, property } = Laya;
import { RainSnowTerrainMask } from "./RainSnowTerrainMask";

// Shared by vertex (foot contact) and fragment (visible puddles): no CPU/GPU mask mismatch.
const puddleMaskGLSL = `
    float hash(vec2 p) {
        p=fract(p*vec2(0.1031,0.11369)); p+=dot(p,p.yx+19.19);
        return fract((p.x+p.y)*p.x);
    }
    float noise(vec2 p) {
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                   mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
    }
    float puddleNoise(vec2 point) {
        vec2 p=(point+u_rainPattern.xy)/u_rainSize.z;
        if (u_weatherShape.x>0.5) p.y/=u_weatherShape.z;
        return 0.65*noise(p+3.7)+0.25*noise(p*2.17+9.1)+0.1*noise(p*5.1);
    }
    float puddleLandCoverage(vec2 point) {
        // Bridge transparent hairline seams between adjacent isometric ground cells.
        float land=forestLand(point);
        land=max(land,forestLand(point+vec2(5.0,0.0)));
        land=max(land,forestLand(point-vec2(5.0,0.0)));
        land=max(land,forestLand(point+vec2(0.0,5.0)));
        land=max(land,forestLand(point-vec2(0.0,5.0)));
        return land;
    }
    float puddleAt(vec2 point) {
        float threshold=mix(-0.1,0.49,u_rainState.x);
        float pool=1.0-smoothstep(threshold-0.022,threshold+0.022,puddleNoise(point));
        vec2 border=min(point,u_rainSize.xy-point);
        return pool*smoothstep(0.,u_rainSize.w,min(border.x,border.y))*puddleLandCoverage(point);
    }
`;

/** Rain sample on a scene-authored ground Sprite. No camera following or generated UI. */
@regClass("cb292bea-fca6-4503-8c06-db76efaac944")
export class GroundRain extends Laya.Script {
    @property({ type: Number, min: 0, max: 1 }) public wetness = 0;
    @property(Boolean) public autoAccumulate = true;
    @property(Number) public accumulationSeconds = 18;
    @property({ type: Number, min: 0, max: 1 }) public rainIntensity = 1;
    @property(Number) public puddleSize = 150;
    @property(Number) public edgeFeather = 100;
    @property(Laya.Sprite) public groundNode: Laya.Sprite | null = null;
    private terrainMask = new RainSnowTerrainMask();
    @property(Laya.Sprite) public playerNode: Laya.Sprite | null = null;
    @property(Number) public footOffsetY = 80;
    @property(Number) public stepDistance = 72;
    @property(Boolean) public footRipples = true;
    private static registered = false;
    private rainMaterial: Laya.Material | null = null;
    private previousMaterial: Laya.Material | null = null;
    private elapsed = 0;
    private state = new Laya.Vector4();
    private readonly steps = Array.from({ length: 6 }, () => new Laya.Vector4(0, 0, -100, 0));
    private nextStep = 0;
    private lastFoot: Laya.Point | null = null;
    private readonly foot = new Laya.Point();
    private travelled = 0;

    onStart(): void {
        const node = this.owner as Laya.Sprite, tex = node.texture;
        if (!tex) {
            console.warn("[GroundRain] Assign the grass-water atlas to the scene Sprite.");
            return;
        }
        GroundRain.registerShader();
        RainSnowTerrainMask.fitToGround(this.groundNode, node);
        this.previousMaterial = node.material;
        const material = this.rainMaterial = new Laya.Material();
        material.setShaderName("GroundRainPuddles");
        material.cull = Laya.RenderState.CULL_NONE;
        const data = material.shaderData, id = Laya.Shader3D.propertyNameToID, uv = tex.uv;
        const sx = uv[2] - uv[0], sy = uv[7] - uv[1];
        data.setTexture(id("u_rainTexture"), tex.bitmap);
        data.setVector(id("u_rainUV"), new Laya.Vector4(uv[0], uv[1], sx, sy));
        data.setVector(id("u_rainSize"), new Laya.Vector4(node.width, node.height,
            Math.max(1, this.puddleSize), Math.max(1, this.edgeFeather)));
        // Preserve the original sample's world-space puddle pattern when extending its bounds.
        data.setVector(id("u_rainPattern"), new Laya.Vector4(node.x + 160, node.y - 3700, 0, 0));
        this.terrainMask.bind(material, this.groundNode, node);
        // Inner water tile of tileset/forest/rain-water.png; do not sample grass or borders.
        data.setVector(id("u_waterRegion"), new Laya.Vector4(
            uv[0] + sx * (1 / 6 + 0.5 / tex.width), uv[1] + sy * (1 / 4 + 0.5 / tex.height),
            sx * (1 / 6 - 1 / tex.width), sy * (1 / 4 - 1 / tex.height)));
        node.material = material;
        node.alpha = 1;
        this.uploadSteps();
        this.updateState();
    }
    onEnable(): void { (this.owner as Laya.Sprite).alpha = this.rainMaterial ? 1 : 0; }
    onDisable(): void {
        (this.owner as Laya.Sprite).alpha = 0;
        this.lastFoot = null;
        this.travelled = 0;
        this.steps.forEach(step => step.setValue(0, 0, -100, 0));
        if (this.rainMaterial) this.uploadSteps();
    }
    onUpdate(): void {
        if (!this.rainMaterial) return;
        const dt = Math.max(0, Laya.timer.delta) / 1000;
        this.elapsed += dt;
        this.rainIntensity = Math.max(0, Math.min(1, this.rainIntensity));
        if (this.autoAccumulate)
            this.wetness += dt * this.rainIntensity / Math.max(0.1, this.accumulationSeconds);
        this.updateState();
    }
    onLateUpdate(): void {
        const player = this.playerNode;
        if (!this.rainMaterial || !this.footRipples || !player || player.destroyed || !player.activeInHierarchy) {
            this.lastFoot = null;
            this.travelled = 0;
            return;
        }
        // The same parent transforms cancel, so this stays in ground space under camera movement.
        this.foot.setTo(0, this.footOffsetY);
        player.localToGlobal(this.foot, false);
        (this.owner as Laya.Sprite).globalToLocal(this.foot, false);
        this.trackFoot(this.foot.x, this.foot.y, Math.max(0, Laya.timer.delta) / 1000);
    }
    private trackFoot(x: number, y: number, dt: number): void {
        if (!this.lastFoot) { this.lastFoot = new Laya.Point(x, y); return; }
        const distance = Math.hypot(x - this.lastFoot.x, y - this.lastFoot.y);
        this.lastFoot.setTo(x, y);
        // Ignore jitter and teleports/background catch-up, instead of drawing a trail across the map.
        if (dt <= 0 || dt > 0.2 || distance > 100 || distance < 0.1) {
            this.travelled = 0;
            return;
        }
        this.travelled += distance;
        const stride = Math.max(16, this.stepDistance);
        if (this.travelled < stride) return;
        this.travelled %= stride;
        const strength = distance / dt > 260 ? 1.25 : 1;
        this.steps[this.nextStep].setValue(x, y, this.elapsed, strength);
        this.nextStep = (this.nextStep + 1) % this.steps.length;
        this.uploadSteps();
    }
    private uploadSteps(): void {
        this.steps.forEach((step, index) => this.rainMaterial.shaderData.setVector(
            Laya.Shader3D.propertyNameToID("u_step" + index), step));
    }
    private updateState(): void {
        this.wetness = Math.max(0, Math.min(1, this.wetness));
        this.state.setValue(this.wetness, this.elapsed, Math.max(0, Math.min(1, this.rainIntensity)), 0);
        this.rainMaterial.shaderData.setVector(Laya.Shader3D.propertyNameToID("u_rainState"), this.state);
        (this.owner as Laya.Sprite).repaint();
    }
    onDestroy(): void {
        const node = this.owner as Laya.Sprite;
        if (node && !node.destroyed && node.material === this.rainMaterial) {
            node.material = this.previousMaterial;
            node.alpha = 0;
        }
        this.rainMaterial?.destroy();
        this.rainMaterial = null;
        this.terrainMask.destroy();
    }
    private static registerShader(): void {
        if (this.registered) return;
        const shader = Laya.Shader3D.add("GroundRainPuddles");
        shader.shaderType = Laya.ShaderFeatureType.D2_TextureSV;
        const sub = new Laya.SubShader({
            a_posuv: [0, Laya.ShaderDataType.Vector4], a_attribColor: [1, Laya.ShaderDataType.Vector4],
            a_attribFlags: [2, Laya.ShaderDataType.Vector4], a_customs: [3, Laya.ShaderDataType.Vector4]
        }, {
            u_rainTexture: Laya.ShaderDataType.Texture2D, u_rainUV: Laya.ShaderDataType.Vector4,
            u_waterRegion: Laya.ShaderDataType.Vector4, u_rainSize: Laya.ShaderDataType.Vector4,
            u_rainState: Laya.ShaderDataType.Vector4,
            u_rainPattern: Laya.ShaderDataType.Vector4,
            ...RainSnowTerrainMask.uniforms,
            u_step0: Laya.ShaderDataType.Vector4, u_step1: Laya.ShaderDataType.Vector4,
            u_step2: Laya.ShaderDataType.Vector4, u_step3: Laya.ShaderDataType.Vector4,
            u_step4: Laya.ShaderDataType.Vector4, u_step5: Laya.ShaderDataType.Vector4
        });
        shader.addSubShader(sub);
        sub.addShaderPass(`
            #include "Sprite2DVertex.glsl";
            varying vec2 v_ground;
            varying vec4 v_stepWetA;
            varying vec2 v_stepWetB;
            ${RainSnowTerrainMask.glsl}
            ${puddleMaskGLSL}
            float stepWet(vec4 foot) { return smoothstep(0.35,0.8,puddleAt(foot.xy))*foot.w; }
            void main() {
                vertexInfo info; getVertexInfo(info);
                v_texcoordAlpha=info.texcoordAlpha; v_color=info.color;
                v_useTex=info.useTex; v_useClip=info.useClip; v_customs=info.customs;
                #ifdef USE_TEX_ARRAY
                v_texLayer=a_attribFlags.w;
                #endif
                v_ground=(info.texcoordAlpha.xy-u_rainUV.xy)/u_rainUV.zw*u_rainSize.xy;
                v_stepWetA=vec4(stepWet(u_step0),stepWet(u_step1),stepWet(u_step2),stepWet(u_step3));
                v_stepWetB=vec2(stepWet(u_step4),stepWet(u_step5));
                gl_Position=getPosition(info.pos);
            }`, `
            #if defined(GL_FRAGMENT_PRECISION_HIGH)
            precision highp float;
            #else
            precision mediump float;
            #endif
            #include "Sprite2DFrag.glsl";
            varying vec2 v_ground;
            varying vec4 v_stepWetA;
            varying vec2 v_stepWetB;
            ${RainSnowTerrainMask.glsl}
            ${puddleMaskGLSL}
            float footRing(vec4 foot, float contact) {
                float age=(u_rainState.y-foot.z)/1.35;
                if (age<0.0 || age>1.0 || contact<0.01) return 0.0;
                vec2 d=v_ground-foot.xy; d.y/=u_weatherShape.z;
                float radius=5.0+age*58.0;
                float ring=1.0-smoothstep(1.0,2.8,abs(length(d)-radius));
                float inner=1.0-smoothstep(0.8,2.0,abs(length(d)-radius*0.68));
                return (ring+0.35*inner)*smoothstep(0.,0.06,age)*(1.0-age)*contact;
            }
            float ripple(vec2 p, float offset) {
                vec2 cell=floor(p/vec2(100.,72.));
                float clock=u_rainState.y/1.8+hash(cell+offset);
                float cycle=floor(clock), age=fract(clock);
                // Each impact gets a new location; rings expand and fade before respawning.
                vec2 center=vec2(0.3)+0.4*vec2(hash(cell+cycle+offset),hash(cell-cycle+offset+5.7));
                vec2 d=(fract(p/vec2(100.,72.))-center)*vec2(100.,72.);
                d.y/=u_weatherShape.z;
                float radius=2.0+age*26.0;
                float ring=1.0-smoothstep(0.65,1.8,abs(length(d)-radius));
                float second=1.0-smoothstep(0.5,1.4,abs(length(d)-radius*0.65));
                return (ring+0.3*second)*smoothstep(0.,0.08,age)*(1.0-age)*(1.0-age);
            }
            void main() {
                clip();
                float wet=u_rainState.x;
                vec2 pattern=v_ground+u_rainPattern.xy;
                vec2 p=pattern/u_rainSize.z;
                float n=puddleNoise(v_ground);
                float threshold=mix(-0.1,0.49,wet);
                float pool=1.0-smoothstep(threshold-0.022,threshold+0.022,n);
                float shore=1.0-smoothstep(threshold+0.02,threshold+0.09,n);
                vec2 border=min(v_ground,u_rainSize.xy-v_ground);
                float edge=smoothstep(0.,u_rainSize.w,min(border.x,border.y))*puddleLandCoverage(v_ground);
                float grain=noise(p*2.6+vec2(4.1,8.3));
                float shine=0.5+0.5*sin(pattern.y*0.075+noise(p*2.)*5.+u_rainState.y*0.6);
                vec3 waterColor=mix(vec3(0.14,0.25,0.29),vec3(0.24,0.35,0.38),grain)
                    +vec3(shine*0.025);
                float rings=min(1.,ripple(pattern,0.0)+ripple(pattern+vec2(41.,29.),13.7));
                rings*=pool*u_rainState.z;
                float steps=footRing(u_step0,v_stepWetA.x)+footRing(u_step1,v_stepWetA.y)
                    +footRing(u_step2,v_stepWetA.z)+footRing(u_step3,v_stepWetA.w)
                    +footRing(u_step4,v_stepWetB.x)+footRing(u_step5,v_stepWetB.y);
                rings=min(1.0,rings+steps*pool);
                vec3 color=mix(vec3(0.07,0.10,0.08),waterColor,pool);
                color=mix(color,vec3(0.75,0.87,0.90),rings*0.8);
                float alpha=(wet*0.10+shore*0.08+pool*0.50+rings*0.15)*edge;
                vec4 result=transspaceColor(vec4(color,1.0));
                setglColor(vec4(result.rgb*alpha,alpha));
            }`);
        this.registered = true;
    }
}
