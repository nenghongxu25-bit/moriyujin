const fs=require('fs');const path='src/systems/BrickWallTileLayer.ts';let s=fs.readFileSync(path,'utf8');
const start=s.indexOf('    onLateUpdate():void {'),end=s.indexOf('    private updateCaps():void {',start);
if(start<0||end<0)throw Error('Missing update anchors');
s=s.slice(0,start)+`    onLateUpdate():void {
        if(!Laya.LayaEnv.isPlaying)return;
        this.updateVisibleSurfaces();
        const owner=this.owner as Laya.Sprite;
        this.revealed.clear();
        for(const s of this.surfaces){
            s.opacity=1;
            for(const node of s.nodes||[]){
                if(node.alpha!==owner.alpha)node.alpha=owner.alpha;
                if(node.visible!==owner.visible)node.visible=owner.visible;
            }
        }
        this.updateLightingDepth();
    }
`+s.slice(end);
const build=s.indexOf('            entry.buildVisual=()=>{'),stop=s.indexOf('            for(const [u,v,w,h] of wallFootprints(mask)){',build);
if(build<0||stop<0)throw Error('Missing build anchors');
s=s.slice(0,build)+`            entry.buildVisual=()=>{
                // One complete image per painted wall tile. Occlusion is now
                // intentional; the existing actor outline remains visible.
                const cut=Laya.Texture.createFromTexture(texture,atlasX,atlasY,256,384);
                visualTextures.push(cut);
                const node=new Laya.Sprite();node.name='BrickWallVisual';
                node.texture=cut;node.size(256,384);
                const pos=map(cellX-128,cellY-336);
                target.addChild(node);node.pos(pos.x,pos.y);node.scale(a,d);
                node.zOrder=map(cellX,cellY+48).y;
                node.visible=owner.visible;node.alpha=owner.alpha;
                nodes.push(node);
            };
`+s.slice(stop);
s=s.replace('        for(const existing of BrickWallTileLayer.live)existing.updateCaps();','');
fs.writeFileSync(path,s);
