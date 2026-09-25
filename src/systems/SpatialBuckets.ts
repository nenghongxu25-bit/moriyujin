/** Static broad phase; callers keep the original precise intersection tests. */
export class SpatialBuckets<T> {
    private cells=new Map<string,Set<T>>();
    private keys=new Map<T,string[]>();
    private oversized=new Set<T>();
    constructor(private size=512){}
    add(value:T,left:number,top:number,right:number,bottom:number):void {
        this.remove(value);
        const x0=Math.floor(left/this.size),x1=Math.floor(right/this.size);
        const y0=Math.floor(top/this.size),y1=Math.floor(bottom/this.size);
        const keys:string[]=[];this.keys.set(value,keys);
        if(!Number.isFinite(x0+y0+x1+y1)||(x1-x0+1)*(y1-y0+1)>4096){this.oversized.add(value);return;}
        for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
            const key=x+','+y;let cell=this.cells.get(key);
            if(!cell)this.cells.set(key,cell=new Set());cell.add(value);keys.push(key);
        }
    }
    remove(value:T):void {
        for(const key of this.keys.get(value)||[]){const cell=this.cells.get(key);cell.delete(value);if(!cell.size)this.cells.delete(key);}
        this.keys.delete(value);this.oversized.delete(value);
    }
    get count():number{return this.keys.size;}
    values():Iterable<T>{return this.keys.keys();}
    query(left:number,top:number,right:number,bottom:number):Iterable<T>{
        const x0=Math.floor(left/this.size),x1=Math.floor(right/this.size);
        const y0=Math.floor(top/this.size),y1=Math.floor(bottom/this.size);
        if(!Number.isFinite(x0+y0+x1+y1)||(x1-x0+1)*(y1-y0+1)>4096)return this.values();
        const found=new Set<T>(this.oversized);
        for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(const item of this.cells.get(x+','+y)||[])found.add(item);
        return found;
    }
}
