const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const dir = 'assets/decorate/city/urban-kit-v1/';
const names = ['streets-corner-store','streets-apartment','streets-bus-shelter','streets-dumpster','streets-delivery-van','center-office-entry','center-parking-entry','center-security-barrier','center-planter-bench','center-utility-cabinet'];
const id = name => crypto.createHash('sha256').update(name).digest('hex').slice(0,12);
const children = names.map((name,i) => {
  const png = fs.readFileSync(path.join(root,dir,name+'.png'));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  const meta = JSON.parse(fs.readFileSync(path.join(root,dir,name+'.png.meta'),'utf8').replace(/^\uFEFF/,''));
  const scale = 240 / Math.max(width,height);
  return {'_$id':id(name),'_$type':'Sprite',name,x:20+(i%5)*262,y:i<5?48:410,width,height,scaleX:scale,scaleY:scale,texture:{'_$uuid':meta.uuid,'_$type':'Texture'}};
});
const scene = {'_$ver':1,'_$id':id('UrbanElementsPreview'),'_$type':'Scene',name:'UrbanElementsPreview',width:1334,height:750,left:0,right:0,top:0,bottom:0,'_$child':children};
const request = {name:'Laya_EditAsset',arguments:{file_path:dir+'urban-elements-preview.ls',ops:[{op:'replace',path:'',value:JSON.stringify(scene)}]}};
fs.mkdirSync(path.join(root,'.tmp'),{recursive:true});
fs.writeFileSync(path.join(root,'.tmp/urban-preview-request.json'),JSON.stringify(request));
console.log('Prepared MCP scene edit for '+children.length+' sprites.');
