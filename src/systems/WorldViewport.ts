/** Camera2D transforms live in Area2D's renderer, outside Sprite.globalToLocal. */
export function worldViewportCorners(world:Laya.Sprite,padding:number):Laya.Point[] {
    let area:any=world;
    while(area&&!(area.mainCamera&&typeof area.transformPoint==='function'))area=area.parent;
    const width=area?(Laya.RenderState2D.width||Laya.stage.width):Laya.stage.width;
    const height=area?(Laya.RenderState2D.height||Laya.stage.height):Laya.stage.height;
    return [[-padding,-padding],[width+padding,-padding],[-padding,height+padding],[width+padding,height+padding]].map(([x,y])=>{
        const global=area?area.localToGlobal(area.transformPoint(x,y),false):new Laya.Point(x,y);
        return world.globalToLocal(global,false);
    });
}
