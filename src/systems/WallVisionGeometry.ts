import {wallFootprints} from './BrickWallGeometry';

export interface VisionWall {mask:number;x:number;y:number;a:number;d:number}

/** Ground-ray intersection, deliberately independent of movement recovery. */
export function wallBlocksSight(wall:VisionWall,ax:number,ay:number,bx:number,by:number):boolean {
    // Doorway compatibility tiles may keep jamb collision footprints, but the
    // aperture itself is open and must never create a lighting/vision shadow.
    if(wall.mask>=16)return false;
    // Every supplied footprint fits inside this conservative ground diamond AABB.
    // Reject unrelated walls before projecting the ray or inspecting each box.
    const halfW=128*wall.a,halfH=64*wall.d;
    if(Math.max(ax,bx)<wall.x-halfW||Math.min(ax,bx)>wall.x+halfW||
       Math.max(ay,by)<wall.y-halfH||Math.min(ay,by)>wall.y+halfH)return false;
    const x0=(ax-wall.x)/wall.a,y0=(ay-wall.y)/wall.d;
    const x1=(bx-wall.x)/wall.a,y1=(by-wall.y)/wall.d;
    const au=x0/256+y0/128,av=-x0/256+y0/128;
    const du=(x1/256+y1/128)-au,dv=(-x1/256+y1/128)-av;
    for(const [u,v,w,h] of wallFootprints(wall.mask)){
        let enter=0,leave=1;
        for(let axis=0;axis<2;axis++){
            const lo=axis===0?u:v,hi=lo+(axis===0?w:h),delta=axis===0?du:dv,start=axis===0?au:av;
            if(Math.abs(delta)<1e-9){if(start<=lo||start>=hi){leave=-1;break;}}
            else{const p=(lo-start)/delta,q=(hi-start)/delta;enter=Math.max(enter,Math.min(p,q));leave=Math.min(leave,Math.max(p,q));}
        }
        if(enter<leave-1e-8&&leave>1e-8&&enter<1-1e-8)return true;
    }
    return false;
}

/** Rear edge of the actual wall footprint at this image column. */
export function wallBackAtX(mask:number,x:number):number|null {
    let back=Infinity;
    for(const [u,v,w,h] of wallFootprints(mask)){
        const low=Math.max(u,v+x/128),high=Math.min(u+w,v+h+x/128);
        if(low<=high)back=Math.min(back,128*low-x/2);
    }
    return Number.isFinite(back)?back:null;
}
