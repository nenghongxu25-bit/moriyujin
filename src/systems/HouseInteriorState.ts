/** Shared logical state: roof and house walls must agree on inside/outside. */
const interiors=new WeakMap<object,boolean>();
export function setHouseInterior(house:object,inside:boolean):void {interiors.set(house,inside);}
export function houseInteriorState(node:{parent?:any}):boolean|null {
    for(let current=node;current;current=current.parent){
        if(interiors.has(current))return interiors.get(current)===true;
    }
    return null;
}
export function allowsHouseWallReveal(node:{parent?:any}):boolean {return houseInteriorState(node)!==false;}
