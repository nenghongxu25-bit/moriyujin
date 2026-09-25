import {wallFootprints} from './BrickWallGeometry';

export interface VisionWall {mask:number;x:number;y:number;a:number;d:number}

/** Ground-ray intersection, deliberately independent of movement recovery. */
export function wallBlocksSight(wall:VisionWall,ax:number,ay:number,bx:number,by:number):boolean {
    const project=(x:number,y:number)=>{
        x=(x-wall.x)/wall.a;y=(y-wall.y)/wall.d;
        return [x/256+y/128,-x/256+y/128];
    };
    const a=project(ax,ay),b=project(bx,by);
    for(const [u,v,w,h] of wallFootprints(wall.mask)){
        let enter=0,leave=1;
        for(let axis=0;axis<2;axis++){
            const lo=axis===0?u:v,hi=lo+(axis===0?w:h),delta=b[axis]-a[axis];
            if(Math.abs(delta)<1e-9){if(a[axis]<=lo||a[axis]>=hi){leave=-1;break;}}
            else{const p=(lo-a[axis])/delta,q=(hi-a[axis])/delta;enter=Math.max(enter,Math.min(p,q));leave=Math.min(leave,Math.max(p,q));}
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
