const { regClass, property } = Laya;

/** A polygon-shaped animated river. Its water mask is also the movement blocker. */
@regClass("97b7ffd5-8573-4eb4-badc-57b0ce80afdd")
export class ForestRiver extends Laya.Script {
    @property(String) public polygon = "0.62,0;0.60,0.08;0.50,0.16;0.41,0.24;0.42,0.32;0.52,0.40;0.62,0.48;0.61,0.56;0.50,0.64;0.40,0.72;0.39,0.80;0.50,0.88;0.60,0.96;0.61,1;0.36,1;0.34,0.92;0.25,0.84;0.22,0.76;0.27,0.68;0.37,0.60;0.48,0.52;0.49,0.44;0.39,0.36;0.29,0.28;0.27,0.20;0.35,0.12;0.44,0.04;0.44,0";
    @property(Number) public speed = 18;
    @property({ type: Number, min: 4, max: 120, caption: "Shore transition width" }) public shoreWidth = 24;
    private static readonly active = new Set<ForestRiver>();
    private static registered = false;
    private material: Laya.Material | null = null;
    private original: Laya.Material | null = null;
    private mask: Laya.Texture2D | null = null;
    private vertices: Array<[number, number]> = [];
    private elapsed = 0;
    private state = new Laya.Vector4();

    onStart(): void {
        const node = this.owner as Laya.Sprite;
        if (!node.texture || node.width <= 0 || node.height <= 0) {
            console.warn("[ForestRiver] Assign water-flow.png and a non-zero area.");
            return;
        }
        this.vertices = this.parsePolygon();
        if (this.vertices.length < 3) {
            console.warn("[ForestRiver] Polygon needs at least three normalized x,y points.");
            return;
        }
        this.mask = this.createMask();
        ForestRiver.register();
        this.original = node.material;
        const material = this.material = new Laya.Material();
        material.setShaderName("ForestRiverPolygon");
        material.cull = Laya.RenderState.CULL_NONE;
        const id = Laya.Shader3D.propertyNameToID, uv = node.texture.uv;
        material.shaderData.setTexture(id("u_riverTexture"), node.texture.bitmap);
        material.shaderData.setTexture(id("u_riverMask"), this.mask);
        material.shaderData.setVector(id("u_riverUV"), new Laya.Vector4(uv[0], uv[1], uv[2] - uv[0], uv[7] - uv[1]));
        material.shaderData.setVector(id("u_riverSize"), new Laya.Vector4(node.width, node.height, 0, 0));
        material.shaderData.setNumber(id("u_riverShoreWidth"), Math.max(4, this.shoreWidth));
        material.shaderData.setNumber(id("u_riverMaxDistance"), Math.max(64, this.shoreWidth * 2));
        material.shaderData.setVector(id("u_riverState"), this.state);
        node.material = material;
        node.alpha = 1;
        ForestRiver.active.add(this);
    }

    onUpdate(): void {
        if (!this.material) return;
        this.elapsed += Math.min(0.1, Math.max(0, Laya.timer.delta) / 1000);
        this.state.setValue(this.elapsed * Math.max(0, this.speed), this.elapsed, 0, 0);
        this.material.shaderData.setVector(Laya.Shader3D.propertyNameToID("u_riverState"), this.state);
        (this.owner as Laya.Sprite).repaint();
    }

    onDestroy(): void {
        ForestRiver.active.delete(this);
        const node = this.owner as Laya.Sprite;
        if (node && !node.destroyed && node.material === this.material) node.material = this.original;
        this.material?.destroy();
        this.material = null;
        this.mask?.destroy();
        this.mask = null;
    }

    /** Used by TileBlockMovement so rendered and solid river outlines stay identical. */
    public static blocksMove(actor: Laya.Sprite, fromX: number, fromY: number, toX: number, toY: number,
        footOffsetY: number, halfWidth: number, halfDepth: number): boolean {
        if (fromX === toX && fromY === toY) return false;
        for (const river of this.active) {
            const node = river.owner as Laya.Sprite;
            if (node.destroyed || !node.activeInHierarchy || node.scene !== actor.scene || !actor.parent) continue;
            const length = Math.hypot(toX - fromX, toY - fromY);
            const steps = Math.max(1, Math.ceil(length / 8));
            // Allow an actor placed in the water to recover and walk out.
            if (river.containsActorPoint(actor, fromX, fromY, footOffsetY)) continue;
            for (let i = 1; i <= steps; i++) {
                const t = i / steps, x = fromX + (toX - fromX) * t, y = fromY + (toY - fromY) * t;
                if (river.containsActorPoint(actor, x, y, footOffsetY)) return true;
                for (let j = 0; j < 8; j++) {
                    const a = j * Math.PI / 4;
                    if (river.containsActorPoint(actor, x + Math.cos(a) * halfWidth,
                        y + Math.sin(a) * halfDepth, footOffsetY)) return true;
                }
            }
        }
        return false;
    }

    private containsActorPoint(actor: Laya.Sprite, x: number, y: number, footY: number): boolean {
        const point = new Laya.Point(x, y + footY);
        (actor.parent as Laya.Sprite).localToGlobal(point, false);
        (this.owner as Laya.Sprite).globalToLocal(point, false);
        const node = this.owner as Laya.Sprite;
        return this.pointInPolygon(point.x / node.width, point.y / node.height);
    }

    private parsePolygon(): Array<[number, number]> {
        return this.polygon.split(";").map(pair => pair.split(",").map(Number) as [number, number])
            .filter(p => p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    }

    private pointInPolygon(x: number, y: number): boolean {
        let inside = false;
        for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            const a = this.vertices[i], b = this.vertices[j];
            if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
        }
        return inside;
    }

    private createMask(): Laya.Texture2D {
        const size = 512, pixels = new Uint8Array(size * size * 4);
        const node = this.owner as Laya.Sprite;
        const maxDistance = Math.max(64, this.shoreWidth * 2);
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const px = (x + 0.5) / size * node.width, py = (y + 0.5) / size * node.height;
            let inside = false, minDistance2 = Infinity;
            for (let a = 0, b = this.vertices.length - 1; a < this.vertices.length; b = a++) {
                const va = this.vertices[a], vb = this.vertices[b];
                if ((va[1] > py / node.height) !== (vb[1] > py / node.height) &&
                    px / node.width < (vb[0] - va[0]) * (py / node.height - va[1]) / (vb[1] - va[1]) + va[0]) inside = !inside;
                const ax = va[0] * node.width, ay = va[1] * node.height;
                const bx = vb[0] * node.width, by = vb[1] * node.height;
                const dx = bx - ax, dy = by - ay;
                const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
                const ex = px - (ax + t * dx), ey = py - (ay + t * dy);
                minDistance2 = Math.min(minDistance2, ex * ex + ey * ey);
            }
            const signedDistance = (inside ? 1 : -1) * Math.min(maxDistance, Math.sqrt(minDistance2));
            pixels[i] = Math.round((signedDistance / maxDistance * 0.5 + 0.5) * 255);
            pixels[i + 1] = pixels[i + 2] = 255;
            pixels[i + 3] = 255;
        }
        const texture = new Laya.Texture2D(size, size, Laya.TextureFormat.R8G8B8A8, false, false);
        texture.filterMode = Laya.FilterMode.Bilinear;
        texture.setPixelsData(pixels, false, false);
        return texture;
    }

    private static register(): void {
        if (this.registered) return;
        const shader = Laya.Shader3D.add("ForestRiverPolygon");
        shader.shaderType = Laya.ShaderFeatureType.D2_TextureSV;
        const sub = new Laya.SubShader({
            a_posuv: [0, Laya.ShaderDataType.Vector4], a_attribColor: [1, Laya.ShaderDataType.Vector4],
            a_attribFlags: [2, Laya.ShaderDataType.Vector4], a_customs: [3, Laya.ShaderDataType.Vector4]
        }, {
            u_riverTexture: Laya.ShaderDataType.Texture2D, u_riverMask: Laya.ShaderDataType.Texture2D,
            u_riverUV: Laya.ShaderDataType.Vector4, u_riverSize: Laya.ShaderDataType.Vector4,
            u_riverState: Laya.ShaderDataType.Vector4,
            u_riverShoreWidth: Laya.ShaderDataType.Float, u_riverMaxDistance: Laya.ShaderDataType.Float
        });
        shader.addSubShader(sub);
        sub.addShaderPass(`
            #include "Sprite2DVertex.glsl";
            varying vec2 v_riverLocal;
            void main() {
                vertexInfo info; getVertexInfo(info);
                v_texcoordAlpha=info.texcoordAlpha; v_color=info.color;
                v_useTex=info.useTex; v_useClip=info.useClip; v_customs=info.customs;
                #ifdef USE_TEX_ARRAY
                v_texLayer=a_attribFlags.w;
                #endif
                v_riverLocal=(info.texcoordAlpha.xy-u_riverUV.xy)/u_riverUV.zw*u_riverSize.xy;
                gl_Position=getPosition(info.pos);
            }`, `
            #if defined(GL_FRAGMENT_PRECISION_HIGH)
            precision highp float;
            #else
            precision mediump float;
            #endif
            #include "Sprite2DFrag.glsl";
            varying vec2 v_riverLocal;
            void main() {
                clip();
                float signedDistance=(texture2D(u_riverMask,v_riverLocal/u_riverSize.xy).r*2.0-1.0)*u_riverMaxDistance;
                float shoreWidth=max(1.0,u_riverShoreWidth);
                float coverage=smoothstep(-shoreWidth*0.08,shoreWidth*0.72,signedDistance);
                if(coverage<0.005) discard;
                vec2 uv=fract((v_riverLocal+vec2(-u_riverState.x*0.45,u_riverState.x))/128.0);
                uv=mix(vec2(0.5/128.0),vec2(127.5/128.0),uv);
                vec4 water=transspaceColor(texture2D(u_riverTexture,u_riverUV.xy+uv*u_riverUV.zw));
                float shallows=1.0-smoothstep(0.0,shoreWidth*0.7,max(0.0,signedDistance));
                water.rgb=mix(water.rgb,vec3(0.32,0.50,0.38),shallows*0.10);
                water.a*=coverage*0.94;
                setglColor(water*v_color);
            }`);
        this.registered = true;
    }
}
