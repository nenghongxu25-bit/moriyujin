const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),dir='assets/decorate/city/museum-props-v1/';
const names=['glass-display-case','table-display-case','artifact-pedestal','round-display-plinth','exhibit-table','museum-info-stand'];
const id=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const children=names.map((name,i)=>{
 const png=fs.readFileSync(path.join(root,dir,name+'.png')),width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 const meta=JSON.parse(fs.readFileSync(path.join(root,dir,name+'.png.meta'),'utf8').replace(/^\uFEFF/,''));
 const scale=300/Math.max(width,height);
 return {'_$id':id(name),'_$type':'Sprite',name,x:65+(i%3)*440,y:i<3?20:390,width,height,scaleX:scale,scaleY:scale,texture:{'_$uuid':meta.uuid,'_$type':'Texture'}};
});
const scene={'_$ver':1,'_$id':id('MuseumPropsV1'),'_$type':'Scene',name:'MuseumPropsV1',width:1334,height:750,left:0,right:0,top:0,bottom:0,'_$child':children};
fs.mkdirSync(path.join(root,'.tmp'),{recursive:true});
fs.writeFileSync(path.join(root,'.tmp/museum-preview-request.json'),JSON.stringify({name:'Laya_EditAsset',arguments:{file_path:dir+'museum-props-preview.ls',ops:[{op:'replace',path:'',value:JSON.stringify(scene)}]}}));
console.log('Prepared 6-prop MCP preview edit.');
