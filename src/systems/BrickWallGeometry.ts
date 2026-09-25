/** Wall masks use +u,+v,-u,-v bits on a 256x128 diamond grid. */
const footprints = new Map<number,readonly (readonly number[])[]>();
export function wallFootprints(mask: number): readonly (readonly number[])[] {
    let result=footprints.get(mask);
    if(!result){result=Object.freeze(buildWallFootprints(mask).map(box=>Object.freeze(box)));footprints.set(mask,result);}
    return result;
}
function buildWallFootprints(mask: number): number[][] {
    const t = 3 / 16;
    // Doorway jambs: full-length interfaces, an open middle half, no threshold.
    if (mask === 16) return [[-.5,-t,.25,2*t],[.25,-t,.25,2*t]];
    if (mask === 17) return [[-t,-.5,2*t,.25],[-t,.25,2*t,.25]];
    const boxes = [[-t, -t, 2 * t, 2 * t]];
    if (mask & 1) boxes.push([0, -t, .5, 2 * t]);
    if (mask & 2) boxes.push([-t, 0, 2 * t, .5]);
    if (mask & 4) boxes.push([-.5, -t, .5, 2 * t]);
    if (mask & 8) boxes.push([-t, -.5, 2 * t, .5]);
    return boxes;
}

/** Frontmost ground intersection of a vertical image strip. */
export function wallConnectorCap(mask:number,x:number):{bit:number;top:number;bottom:number}|null {
    if(mask>=16)return null; // Retired doorway compatibility: do not cut its lintel.
    const bit=x>=40&&x<88&&(mask&1)?1:x>=-88&&x< -40&&(mask&2)?2:0;
    if(!bit)return null;
    const ground=64-Math.abs(x)/2;
    return {bit,top:Math.ceil(336+ground-256-.5),bottom:Math.ceil(336+ground-.5)};
}

/** Composite with the neighbour once, reaching the more opaque wall's alpha. */
export function wallCapAlpha(own:number,neighbour:number):number {
    own=Math.max(0,Math.min(1,own));neighbour=Math.max(0,Math.min(1,neighbour));
    return neighbour>=own?0:(own-neighbour)/(1-neighbour);
}

export function wallGroundAtX(mask: number, x: number): number | null {
    let front = -Infinity;
    // The lintel still spans the opening and must render even without floor collision.
    for (const [u, v, w, h] of wallFootprints(mask === 16 ? 5 : mask === 17 ? 10 : mask)) {
        // x=128(u-v), groundY=64(u+v).
        const low = Math.max(u, v + x / 128);
        const high = Math.min(u + w, v + h + x / 128);
        if (low <= high) front = Math.max(front, 128 * high - x / 2);
    }
    return Number.isFinite(front) ? front : null;
}
