/** Multiplies a foreground actor copy by the occluder's original alpha. */
export class DepthMaskMaterial {
    private static ready = false;
    public static create(): Laya.Material {
        if (!this.ready) {
            const shader = Laya.Shader3D.add("DepthImageAlpha");
            shader.shaderType = Laya.ShaderFeatureType.D2_TextureSV;
            const sub = new Laya.SubShader({
                a_posuv: [0, Laya.ShaderDataType.Vector4],
                a_attribColor: [1, Laya.ShaderDataType.Vector4],
                a_attribFlags: [2, Laya.ShaderDataType.Vector4],
                a_customs: [3, Laya.ShaderDataType.Vector4]
            }, {
                u_depthMask: Laya.ShaderDataType.Texture2D,
                u_depthCapture: Laya.ShaderDataType.Vector4,
                u_depthRowX: Laya.ShaderDataType.Vector4,
                u_depthRowY: Laya.ShaderDataType.Vector4,
                u_depthAtlasX: Laya.ShaderDataType.Vector4,
                u_depthAtlasY: Laya.ShaderDataType.Vector4
            });
            shader.addSubShader(sub);
            sub.addShaderPass(`
                #include "Sprite2DVertex.glsl";
                varying vec2 v_depthUV;
                void main() {
                    vertexInfo info; getVertexInfo(info);
                    v_texcoordAlpha=info.texcoordAlpha; v_color=info.color;
                    v_useTex=info.useTex; v_useClip=info.useClip; v_customs=info.customs;
                    #ifdef USE_TEX_ARRAY
                    v_texLayer=a_attribFlags.w;
                    #endif
                    // UVs remain stable when Laya batches vertices in world space.
                    vec2 capturePos=vec2(info.texcoordAlpha.x,1.0-info.texcoordAlpha.y)
                                    *u_depthCapture.xy+u_depthCapture.zw;
                    v_depthUV=vec2(dot(u_depthRowX.xyz,vec3(capturePos,1.0)),
                                   dot(u_depthRowY.xyz,vec3(capturePos,1.0)));
                    gl_Position=getPosition(info.pos);
                }`, `
                #if defined(GL_FRAGMENT_PRECISION_HIGH)
                precision highp float;
                #else
                precision mediump float;
                #endif
                #include "Sprite2DFrag.glsl";
                varying vec2 v_depthUV;
                void main() {
                    clip();
                    vec2 uv=vec2(dot(u_depthAtlasX.xyz,vec3(1.0,v_depthUV)),
                                 dot(u_depthAtlasY.xyz,vec3(1.0,v_depthUV)));
                    float inside=step(0.0,v_depthUV.x)*step(v_depthUV.x,1.0)
                                *step(0.0,v_depthUV.y)*step(v_depthUV.y,1.0);
                    vec4 color=getSpriteTextureColor();
                    color*=texture2D(u_depthMask,uv).a*inside;
                    setglColor(color);
                }`);
            this.ready = true;
        }
        const material = new Laya.Material();
        material.setShaderName("DepthImageAlpha");
        return material;
    }

    public static update(material: Laya.Material, image: Laya.Sprite, transform: Laya.Matrix, size: number, pad: number): void {
        const texture = image.texture;
        const inverse = transform.clone(); inverse.invert();
        const sx = texture.sourceWidth / (image.width * texture.width);
        const sy = texture.sourceHeight / (image.height * texture.height);
        const data = material.shaderData;
        const set = (name: string, a: number, b: number, c: number) => data.setVector(
            Laya.Shader3D.propertyNameToID(name), new Laya.Vector4(a, b, c, 0));
        data.setTexture(Laya.Shader3D.propertyNameToID("u_depthMask"), texture.bitmap);
        data.setVector(Laya.Shader3D.propertyNameToID("u_depthCapture"), new Laya.Vector4(size, size, -pad, -pad));
        set("u_depthRowX", inverse.a * sx, inverse.c * sx, inverse.tx * sx - texture.offsetX / texture.width);
        set("u_depthRowY", inverse.b * sy, inverse.d * sy, inverse.ty * sy - texture.offsetY / texture.height);
        const uv = texture.uv;
        set("u_depthAtlasX", uv[0], uv[2] - uv[0], uv[6] - uv[0]);
        set("u_depthAtlasY", uv[1], uv[3] - uv[1], uv[7] - uv[1]);
        inverse.destroy();
    }
}
