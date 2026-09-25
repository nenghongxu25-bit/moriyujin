// Scene writes are performed by Laya MCP, not this script.
const fs=require('fs');
const folder='assets/isometric-study';
const uuid=n=>JSON.parse(fs.readFileSync(`${folder}/${n}.png.meta`,'utf8')).uuid;
const sprite=(id,name,x,y,width,height,asset)=>({'_$id':id,'_$type':'Sprite',name,x,y,width,height,texture:{'_$uuid':uuid(asset),'_$type':'Texture'}});
const ground=[],props=[];const ox=667,oy=155;
for(let sum=0;sum<=12;sum++)for(let i=0;i<7;i++){
 const j=sum-i;if(j<0||j>6)continue;
 if((i===0||i===6)&&(j===0||j===6))continue;
 const path=i===3 || (j===3&&i>=3);
 ground.push(sprite(`tile_${i}_${j}`,`${path?'Dirt':'Grass'}_${i}_${j}`,ox+(i-j)*64-64,oy+(i+j)*32,128.6,80.4,path?'dirt-block':'grass-block'));
}
function prop(asset,i,j,w,h,dx=0,dy=0){const x=ox+(i-j)*64+dx,y=oy+(i+j)*32+32+dy;const n=sprite(`prop_${props.length}`,`${asset}_${i}_${j}`,x-w/2,y-h,w,h,asset);n.zIndex=Math.round(y);props.push(n);}
prop('tree',0,2,145,175);prop('tree',1,1,155,186);prop('tree',2,0,135,162);
prop('tree',1,5,148,178);prop('tree',5,1,145,174);prop('tree',5,5,125,150);
prop('shrubs',0,4,95,66);prop('shrubs',4,0,90,62);prop('shrubs',5,4,83,57);prop('shrubs',2,5,75,52);
prop('crate',4,2,58,63);prop('crate',5,2,50,55);prop('crate',4,4,58,63);
prop('fence',4,6,86,96,0,8);prop('fence',5,6,86,96,0,8);
props.sort((a,b)=>a.zIndex-b.zIndex);
const root={'_$ver':1,'_$id':'iso_study_root','_$type':'Scene',name:'IsometricStudy',width:1334,height:750,left:0,right:0,top:0,bottom:0,'_$comp':[{'_$type':'86fb35d4-bffe-4012-bc9f-85f003b0b723'}],'_$child':[{'_$id':'iso_ground','_$type':'Sprite',name:'GroundLayer','_$child':ground},{'_$id':'iso_props','_$type':'Sprite',name:'ActorLayer','_$child':props}]};
function ids(n){n._$id=require('crypto').createHash('sha256').update(n._$id).digest('hex').slice(0,12);for(const c of n._$child||[])ids(c);}ids(root);
fs.mkdirSync('.tmp/isometric-study',{recursive:true});
fs.writeFileSync('.tmp/isometric-study/edit.json',JSON.stringify({name:'Laya_EditAsset',arguments:{file_path:`${folder}/isometric-study.ls`,ops:[{op:'replace',path:'',value:JSON.stringify(root)}]}}));
console.log(JSON.stringify({tiles:ground.length,props:props.length}));

