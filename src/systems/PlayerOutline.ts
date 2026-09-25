const {regClass,property}=Laya;

/** A silhouette-only world overlay. The original player keeps its depth and lighting. */
@regClass('ebfe0645-ea67-46fb-aef9-30d2f83cba97')
export class PlayerOutline extends Laya.Script {
    @property({type:Number,caption:'描边宽度'}) public thickness=2;
    @property({type:Number,caption:'描边透明度'}) public opacity=.55;
    private static shaderReady=false;
    private readonly size=512;
    private readonly pad=256;
    private visual:Laya.Sprite;
    private overlay:Laya.Sprite;
    private target:Laya.RenderTexture2D;
    private texture:Laya.Texture;
    private material:Laya.Material;

    onStart():void {
        const actor=this.owner as Laya.Sprite;
        const ui=actor.scene?.getChildByName('UILayer');
        if(ui?.getChildByName('LobbyChrome'))return;
        this.visual=actor.getChildByName('viewnode') as Laya.Sprite;
        const area=actor.parent?.parent as Laya.Sprite;
        if(!this.visual||!area){console.warn('[PlayerOutline] Missing player visual or world layer.');return;}
        this.material=PlayerOutline.createMaterial();
        this.overlay=new Laya.Sprite();this.overlay.name='PlayerOutlineVisual';
        this.overlay.mouseEnabled=false;this.overlay.zOrder=200000;
        this.overlay.material=this.material;area.addChild(this.overlay);
        console.info('[PlayerOutline] Silhouette above world lighting; player depth unchanged.');
    }
    onLateUpdate():void {
        const actor=this.owner as Laya.Sprite,visual=this.visual,overlay=this.overlay;
        if(!overlay||overlay.destroyed||!visual||visual.destroyed)return;
        overlay.visible=actor.activeInHierarchy&&actor.visible&&actor.alpha>0&&visual.visible&&this.opacity>0;
        if(!overlay.visible)return;
        // Capture body and equipped weapon as one silhouette, without their UI.
        // Restore visibility immediately after the synchronous offscreen draw.
        const hidden:{node:Laya.Sprite;visible:boolean}[]=[];
        try {
            for(const child of actor.children){
                const node=child as Laya.Sprite;
                if(node===visual||node.name==='ranged')continue;
                hidden.push({node,visible:node.visible});node.visible=false;
            }
            this.target=actor.drawToRenderTexture2D(this.size,this.size,this.pad*actor.scaleX,this.pad*actor.scaleY,
                this.target||undefined,false,false,new Laya.Color(0,0,0,0));
        } finally {
            for(const entry of hidden)entry.node.visible=entry.visible;
        }
        if(!this.texture){
            this.texture=new Laya.Texture(this.target);
            overlay.graphics.drawTexture(this.texture,-this.pad,-this.pad,this.size,this.size,null,1,
                null,null,[0,1,1,1,1,0,0,0]);
        }
        const parent=overlay.parent as Laya.Sprite;
        // The capture already contains the actor's own scale and weapon rotation.
        const actorParent=actor.parent as Laya.Sprite;
        const map=(x:number,y:number)=>parent.globalToLocal(actorParent.localToGlobal(new Laya.Point(x,y),false),false);
        const o=map(actor.x,actor.y),x=map(actor.x+1,actor.y),y=map(actor.x,actor.y+1);
        overlay.transform=new Laya.Matrix(x.x-o.x,x.y-o.y,y.x-o.x,y.y-o.y,o.x,o.y);
        const data=this.material.shaderData;
        data.setTexture(Laya.Shader3D.propertyNameToID('u_outlineCapture'),this.target);
        data.setVector(Laya.Shader3D.propertyNameToID('u_outlineStep'),new Laya.Vector4(
            Math.max(.5,Math.min(6,this.thickness))/this.size,0,0,0));
        data.setVector(Laya.Shader3D.propertyNameToID('u_outlineColor'),new Laya.Vector4(.8,.93,1,Math.max(0,Math.min(1,this.opacity))));
    }
    onEnable():void {if(this.overlay)this.overlay.visible=true;}
    onDisable():void {if(this.overlay)this.overlay.visible=false;}
    onDestroy():void {
        this.overlay?.destroy();this.material?.destroy();this.texture?.destroy();this.target?.destroy();
    }
    public static createMaterial():Laya.Material {
        if(!this.shaderReady){
            const shader=Laya.Shader3D.add('PlayerSilhouetteOutline');
            shader.shaderType=Laya.ShaderFeatureType.D2_TextureSV;
            const sub=new Laya.SubShader({
                a_posuv:[0,Laya.ShaderDataType.Vector4],a_attribColor:[1,Laya.ShaderDataType.Vector4],
                a_attribFlags:[2,Laya.ShaderDataType.Vector4],a_customs:[3,Laya.ShaderDataType.Vector4]
            },{u_outlineCapture:Laya.ShaderDataType.Texture2D,u_outlineStep:Laya.ShaderDataType.Vector4,u_outlineColor:Laya.ShaderDataType.Vector4});
            shader.addSubShader(sub);
            sub.addShaderPass(`
                #include "Sprite2DVertex.glsl";
                void main(){
                    vertexInfo info;getVertexInfo(info);
                    v_texcoordAlpha=info.texcoordAlpha;v_color=info.color;
                    v_useTex=info.useTex;v_useClip=info.useClip;v_customs=info.customs;
                    #ifdef USE_TEX_ARRAY
                    v_texLayer=a_attribFlags.w;
                    #endif
                    gl_Position=getPosition(info.pos);
                }`, `
                #if defined(GL_FRAGMENT_PRECISION_HIGH)
                precision highp float;
                #else
                precision mediump float;
                #endif
                #include "Sprite2DFrag.glsl";
                float body(vec2 uv){return smoothstep(0.45,0.65,texture2D(u_outlineCapture,uv).a);}
                void main(){
                    clip();vec2 uv=v_texcoordAlpha.xy;vec2 d=vec2(u_outlineStep.x,u_outlineStep.y>0.0?u_outlineStep.y:u_outlineStep.x);
                    float a=body(uv);float edge=0.0;
                    edge=max(edge,body(uv+vec2(d.x,0.0)));edge=max(edge,body(uv-vec2(d.x,0.0)));
                    edge=max(edge,body(uv+vec2(0.0,d.y)));edge=max(edge,body(uv-vec2(0.0,d.y)));
                    edge=max(edge,body(uv+d*0.7071));edge=max(edge,body(uv+vec2(-d.x,d.y)*0.7071));
                    edge=max(edge,body(uv+vec2(d.x,-d.y)*0.7071));edge=max(edge,body(uv-d*0.7071));
                    float alpha=max(0.0,edge-a)*u_outlineColor.a;
                    setglColor(vec4(u_outlineColor.rgb*alpha,alpha));
                }`);
            this.shaderReady=true;
        }
        const material=new Laya.Material();material.setShaderName('PlayerSilhouetteOutline');return material;
    }
}
