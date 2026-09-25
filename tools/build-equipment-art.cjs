const fs=require('fs');
const catalog=JSON.parse(fs.readFileSync('assets/config/equipment-design-v1.json','utf8'));
const docPath='docs/equipment-design-v1.md';
fs.writeFileSync(docPath,fs.readFileSync(docPath,'utf8').replace('当前是设计配置，尚未绘图或启用新装备。','立绘已完成并存入项目，等级底色由 UI 叠加；新装备玩法尚未启用。')+'\n立绘预览：equipment-art-gallery.html。生成工具为内置 image_gen，完整提示词与来源见 equipment-art-manifest.json。素材位于 assets/atlas/picture/items/equipment-v1/。\n');
const descriptions={armor:'护甲：六级共用立绘',helmet:'头盔：六级共用立绘',headset:'耳机：蓝／紫／金',rig:'弹挂：独立名称与外观',backpack:'背包：独立外观'};
const sections=Object.entries(descriptions).map(([category,title])=>`<section><h2>${title}</h2><div class="items">${catalog.items.filter(i=>i.category===category).map(i=>`<figure><div class="frame" style="width:${i.gridWidth*52}px;height:${i.gridHeight*52}px;background-color:${i.presentation.backgroundColor};border-color:${i.presentation.borderColor}"><img src="../assets/${i.icon}"></div><figcaption>${i.name}<small>${i.gridWidth}×${i.gridHeight} 格${i.container?' · 内部 '+i.container.usableCells+' 格':''}</small></figcaption></figure>`).join('')}</div></section>`).join('');
fs.writeFileSync('docs/equipment-art-gallery.html',`<!doctype html><html lang="zh"><meta charset="utf-8"><title>装备立绘</title><style>*{box-sizing:border-box}body{background:#11171b;color:#e3e7df;font:15px system-ui;margin:0;padding:24px}h1{font-size:26px;margin:0 0 8px}h2{font-size:18px;color:#bfc9c6;margin:20px 0 10px}p,small{color:#9da8a7}p{margin:0}.items{display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap}figure{margin:0}.frame{position:relative;border:2px solid;background-image:linear-gradient(#ffffff06 1px,transparent 1px),linear-gradient(90deg,#ffffff06 1px,transparent 1px);background-size:52px 52px;display:flex;align-items:center;justify-content:center}.frame img{width:100%;height:100%;object-fit:contain}figcaption{margin-top:5px;font-size:13px}small{display:block;font-size:11px;margin-top:2px}</style><h1>装备物资 · 立绘与等级底色</h1><p>每格 256×256 像素，透明立绘。底色由 UI 叠加；所有展示按相同格子大小缩放。</p>${sections}</html>`);
const old=fs.readFileSync('tools/install-weapon-remaster.ps1','utf8');
const prefix=old.slice(0,old.indexOf('$manifestPath='));
const body=`
$manifestPath='docs/equipment-art-manifest.json'
$manifest=Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$projectRoot=(Get-Location).Path
foreach($record in $manifest.items){
 $target=Join-Path $projectRoot $record.file
 $source=Join-Path $projectRoot $record.localSource
 New-Item -ItemType Directory -Force -Path (Split-Path -Parent $source),(Split-Path -Parent $target) | Out-Null
 if(-not(Test-Path -LiteralPath $source)){Copy-Item -LiteralPath $record.generatedSource -Destination $source}
 $fit=[WeaponIconFit]::Fit($source,$target,[int]$record.pixelWidth,[int]$record.pixelHeight)
 $record | Add-Member -Force -NotePropertyName fitting -NotePropertyValue $fit
 Write-Output ($record.id+': '+$record.pixelWidth+'x'+$record.pixelHeight)
}
$manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
`;
fs.writeFileSync('tools/install-equipment-art.ps1',prefix+body);
console.log('Wrote equipment gallery and exact-size asset installer.');
