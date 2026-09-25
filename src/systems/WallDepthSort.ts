/** Preserve Laya's stable child order while avoiding quadratic insertion on large wall layers. */
export function sortWallChildren(children:any[],structures:any[]):void {
    if(children.length!==structures.length||children.some(n=>!Number.isFinite(n._zOrder)))return;
    const sorted=children.map((node,index)=>({node,index,structure:structures[index]}));
    sorted.sort((a,b)=>a.node._zOrder-b.node._zOrder||a.index-b.index);
    for(let i=0;i<sorted.length;i++){children[i]=sorted[i].node;structures[i]=sorted[i].structure;}
}

export function installWallDepthSort(target:Laya.Sprite):void {
    const node=target as any;
    if(node.__wallDepthSort||typeof node.updateZOrder!=='function')return;
    const original=node.updateZOrder;
    node.updateZOrder=function(){
        const children=this._$children,structures=this._struct?.children;
        if(children?.length>128&&structures)sortWallChildren(children,structures);
        // Keep the engine's render-structure notification and flag handling intact.
        // Its insertion pass is now linear because the arrays are already ordered.
        return original.call(this);
    };
    node.__wallDepthSort=true;
}
