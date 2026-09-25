for(const p of ['tiles/city-diamond-atlas.png','city-diamond.tres','city-diamond-preview.ls'])Laya.loader.clearRes('tileset/city-isometric/'+p);
Laya.Scene.open('tileset/city-isometric/city-diamond-preview.ls',true).then(()=>new Promise(resolve=>setTimeout(()=>resolve({children:Laya.stage.numChildren}),1000)))
