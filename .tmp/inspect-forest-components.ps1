$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Collections.Generic;
public class ForestComponents {
 public static string Inspect(string path) {
 using(var b=new Bitmap(path)) {
 int w=b.Width,h=b.Height; var seen=new bool[w*h]; var lines=new List<string>();
 for(int y=0;y<h;y++) for(int x=0;x<w;x++) {
 int idx=y*w+x; if(seen[idx] || b.GetPixel(x,y).A==0) continue;
 var q=new Queue<int>(); q.Enqueue(idx); seen[idx]=true;
 int count=0,minX=x,maxX=x,minY=y,maxY=y;
 while(q.Count>0){int p=q.Dequeue(),px=p%w,py=p/w; count++; minX=Math.Min(minX,px);maxX=Math.Max(maxX,px);minY=Math.Min(minY,py);maxY=Math.Max(maxY,py);
 for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=px+dx,ny=py+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;int ni=ny*w+nx;if(!seen[ni]&&b.GetPixel(nx,ny).A>0){seen[ni]=true;q.Enqueue(ni);}}
 }
 if(count>=8)lines.Add(count+" px: "+minX+","+minY+".."+maxX+","+maxY);
 }
 return w+"x"+h+"\n"+string.Join("\n",lines);
 }
 }
}
'@
Get-ChildItem (Join-Path (Split-Path $PSScriptRoot -Parent) 'assets/decorate/forest') -Filter '*-v1.png' | Where-Object { $_.Name -notlike '*kit*' } | ForEach-Object { $_.Name; [ForestComponents]::Inspect($_.FullName) }
