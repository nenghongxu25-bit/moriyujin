const { regClass, property } = Laya;

/** Scene-local backdrop; no gameplay or UI is created. */
@regClass()
export class IsometricStudyBackdrop extends Laya.Script {
    @property(Number) cameraHeight = 4;
    @property(Number) cameraDistance = 9;
    @property(Number) lookHeight = 1;
    @property(Number) fieldOfView = 55;
    private world: Laya.Scene3D;
    private resources: Laya.Resource[] = [];
    private hidden: Laya.Sprite[] = [];
    private previous = "";
    onEnable(): void {
        this.previous = Laya.stage.bgColor;
        Laya.stage.bgColor = "#eee9e0";
        if(this.world){this.world.visible=true;this.hidden.forEach(n=>n.visible=false);}
    }
    onDisable(): void {
        Laya.stage.bgColor = this.previous;
        if(this.world) this.world.visible=false;
        this.hidden.forEach(n=>n.visible=true);
    }
    async onStart(): Promise<void> {
        const root=this.owner as Laya.Scene;
        const groundView=root.getChildByName("NativeIsometricGround") || root.getChildByName("IsometricProjection");
        const tiles=groundView.getChildAt(0) as Laya.Sprite;
        const layer=tiles.getComponent(Laya.TileMapLayer);
        const props=root.getChildByName("ForestProps") as Laya.Sprite;
        this.world=(root.getChildByName("PerspectiveWorld") || root.scene3D) as Laya.Scene3D;
        const camera=this.world.getChildByName("FixedPerspectiveCamera") as Laya.Camera;
        camera.orthographic=false;camera.fieldOfView=this.fieldOfView;
        camera.nearPlane=.1;camera.farPlane=200;
        camera.clearColor=new Laya.Color(.64,.77,.83,1);
        camera.transform.position=new Laya.Vector3(0,this.cameraHeight,this.cameraDistance);
        camera.transform.lookAt(new Laya.Vector3(0,this.lookHeight,0),new Laya.Vector3(0,1,0));
        this.world.enableFog=true;this.world.fogStart=18;this.world.fogRange=65;
        this.world.fogColor=new Laya.Color(.64,.77,.83,1);
        const groundMesh=Laya.PrimitiveMesh.createPlane(1,1);this.resources.push(groundMesh);
        const quad=Laya.PrimitiveMesh.createQuad(1,1);this.resources.push(quad);
        const cache=new Map<string,Laya.UnlitMaterial>();let count=0;
        const originalTexture=await Laya.loader.load("res://3bebbee4-3eed-41b2-bd37-ba3d58e0572b") as Laya.Texture;
        if(this.destroyed)return;
        for(let y=0;y<8;y++)for(let x=0;x<8;x++){
            const native=groundView.name==="NativeIsometricGround";
            const cell=layer.getCellData(native?4+Math.floor((x-y)/2):x,native?x+y:y,false);
            // Empty cells retain the distant ground; do not invent or overwrite painted map cells.
            const atlas=originalTexture.bitmap,p=cell?.cell.cellowner.localPos;
            if(!p)continue;
            const key=p.x+","+p.y;
            let mat=cache.get(key);
            if(!mat){mat=this.material(atlas,new Laya.Vector4(128/atlas.width,128/atlas.height,p.x*128/atlas.width,p.y*128/atlas.height));cache.set(key,mat);}
            const mesh=this.mesh("Ground_"+x+"_"+y,groundMesh,mat);
            mesh.transform.position=new Laya.Vector3((x-y)/Math.SQRT2,0,(x+y-7)/Math.SQRT2);
            mesh.transform.localRotationEuler=new Laya.Vector3(0,-45,0);count++;
        }
        const baseMat=this.material(null);baseMat.albedoColor=new Laya.Color(.25,.32,.19,1);
        const base=this.mesh("DistantGround",groundMesh,baseMat);
        base.transform.position=new Laya.Vector3(0,-.025,0);base.transform.localScale=new Laya.Vector3(200,1,200);
        for(let i=0;i<props.numChildren;i++){
            const prop=props.getChildAt(i) as Laya.Sprite;if(!prop.texture)continue;
            const uv=prop.texture.uv;
            const mat=this.material(prop.texture.bitmap,new Laya.Vector4(uv[2]-uv[0],uv[7]-uv[1],uv[0],uv[1]));
            mat.renderMode=Laya.UnlitMaterial.RENDERMODE_CUTOUT;mat.alphaTestValue=.08;
            const mesh=this.mesh(prop.name,quad,mat),h=prop.height/90.51;
            mesh.transform.localScale=new Laya.Vector3(prop.width/90.51,h,1);
            mesh.transform.position=new Laya.Vector3((prop.x+prop.width/2-667)/90.51,h/2,(prop.y+prop.height-351)/45.255);
        }
        for(const name of ["SoilFoundation",groundView.name,"ContactShadows","ForestProps"]){
            const n=root.getChildByName(name) as Laya.Sprite;n.visible=false;this.hidden.push(n);
        }
        console.log("[ForestPerspective] ready: perspective camera, ground tiles="+count+", upright props="+props.numChildren);
    }
    private material(texture:Laya.BaseTexture|null,uv?:Laya.Vector4):Laya.UnlitMaterial {
        const mat=new Laya.UnlitMaterial();mat.cull=Laya.RenderState.CULL_NONE;
        if(texture)mat.albedoTexture=texture;if(uv)mat.tilingOffset=uv;
        this.resources.push(mat);return mat;
    }
    private mesh(name:string,geometry:Laya.Mesh,material:Laya.Material):Laya.MeshSprite3D {
        const node=new Laya.MeshSprite3D(geometry,name);node.meshRenderer.sharedMaterial=material;
        this.world.addChild(node);return node;
    }
    onDestroy():void {
        if(this.world && !this.world.destroyed)this.world.destroy(true);
        this.resources.forEach(r=>r.destroy());this.resources=[];
    }
}
