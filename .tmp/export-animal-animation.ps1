$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Drawing.Drawing2D; using System.Collections.Generic; using System.IO;
public class AnimalFrameExport {
 class Component {public List<int> Pixels=new List<int>();public int X0=int.MaxValue,Y0=int.MaxValue,X1,Y1; public int Row,Col;}
 public class Report {public int FrameCount,Canvas;public double Scale;public string[] Frames;public int[] SourcePixelCounts;}
 public static Report Export(string path,string folder,int cols,int rows,int expected,int canvas,int targetArea,bool running){
 using(var src=new Bitmap(path)){
 int w=src.Width,h=src.Height;bool[] seen=new bool[w*h];var components=new List<Component>();
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){
 int start=y*w+x;if(seen[start]||src.GetPixel(x,y).A==0)continue;
 var c=new Component();var q=new Queue<int>();q.Enqueue(start);seen[start]=true;
 while(q.Count>0){int p=q.Dequeue(),px=p%w,py=p/w;c.Pixels.Add(p);c.X0=Math.Min(c.X0,px);c.Y0=Math.Min(c.Y0,py);c.X1=Math.Max(c.X1,px);c.Y1=Math.Max(c.Y1,py);
 for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=px+dx,ny=py+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;int ni=ny*w+nx;if(!seen[ni]&&src.GetPixel(nx,ny).A>0){seen[ni]=true;q.Enqueue(ni);}}
 }
 if(c.Pixels.Count>5000){c.Row=Math.Min(rows-1,(int)(((c.Y0+c.Y1)/2.0)*rows/h));c.Col=Math.Min(cols-1,(int)(((c.X0+c.X1)/2.0)*cols/w));components.Add(c);}
 }
 if(components.Count!=expected)throw new Exception("Expected "+expected+" main silhouettes, found "+components.Count);
 components.Sort((a,b)=>(a.Row*cols+a.Col).CompareTo(b.Row*cols+b.Col));
 for(int i=0;i<expected;i++)if(components[i].Row*cols+components[i].Col!=i)throw new Exception("Ambiguous frame order");
 var areas=new List<int>();int maxWidth=0,maxHeight=0;int[] rowBottom=new int[rows];
 foreach(var c in components){areas.Add(c.Pixels.Count);maxWidth=Math.Max(maxWidth,c.X1-c.X0+1);maxHeight=Math.Max(maxHeight,c.Y1-c.Y0+1);rowBottom[c.Row]=Math.Max(rowBottom[c.Row],c.Y1);}
 areas.Sort();double scale=Math.Sqrt((double)targetArea/areas[areas.Count/2]);
 scale=Math.Min(scale,Math.Min((double)(canvas-20)/maxWidth,(double)(canvas-30)/maxHeight));
 var report=new Report{FrameCount=expected,Canvas=canvas,Scale=scale,Frames=new string[expected],SourcePixelCounts=new int[expected]};
 Directory.CreateDirectory(folder);
 for(int i=0;i<expected;i++){
 var c=components[i];int cw=c.X1-c.X0+1,ch=c.Y1-c.Y0+1;
 using(var cut=new Bitmap(cw,ch,PixelFormat.Format32bppArgb)){
 foreach(int p in c.Pixels)cut.SetPixel(p%w-c.X0,p/w-c.Y0,src.GetPixel(p%w,p/w));
 using(var dst=new Bitmap(canvas,canvas,PixelFormat.Format32bppArgb)){
 double x=(canvas-cw*scale)/2; double y=canvas-12-ch*scale;
 if(running)y-=(rowBottom[c.Row]-c.Y1)*scale;
 if(y<2)throw new Exception("Frame would clip");
 using(var g=Graphics.FromImage(dst))using(var attr=new ImageAttributes()){
 g.Clear(Color.Transparent);g.CompositingMode=CompositingMode.SourceCopy;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;attr.SetWrapMode(WrapMode.TileFlipXY);
 PointF[] pts={new PointF((float)x,(float)y),new PointF((float)(x+cw*scale),(float)y),new PointF((float)x,(float)(y+ch*scale))};
 g.DrawImage(cut,pts,new RectangleF(0,0,cw,ch),GraphicsUnit.Pixel,attr);
 }
 string file="frame_"+i.ToString("D2")+".png";dst.Save(Path.Combine(folder,file),ImageFormat.Png);report.Frames[i]=file;report.SourcePixelCounts[i]=c.Pixels.Count;
 for(int e=0;e<canvas;e++)if(dst.GetPixel(e,0).A>0||dst.GetPixel(e,canvas-1).A>0||dst.GetPixel(0,e).A>0||dst.GetPixel(canvas-1,e).A>0)throw new Exception("Nontransparent frame border");
 }
 }
 }
 return report;
 }
 }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$jobs=Get-Content -Raw (Join-Path $PSScriptRoot 'animal-animation-jobs.json') | ConvertFrom-Json
$hd=Join-Path $root 'art-library/images/animals-animation-hd'
New-Item -ItemType Directory -Path $hd -Force | Out-Null
foreach($job in $jobs){
 $folder=Join-Path $root ('assets/animation/animals-preview/'+$job.animal+'/'+$job.action)
 if(Test-Path -LiteralPath $folder){throw "Output exists: $folder"}
 $saved=Join-Path $hd ($job.animal+'-'+$job.action+'-sheet.png')
 if(Test-Path -LiteralPath $saved){throw "HD exists: $saved"}
 Copy-Item -LiteralPath $job.source -Destination $saved
 $canvas=160;$area=6000
 if($job.animal -eq 'wolf'){$canvas=224;$area=14500}
 $r=[AnimalFrameExport]::Export($saved,$folder,$job.cols,$job.rows,$job.count,$canvas,$area,($job.action -eq 'run'))
 # Machine-readable export report; metadata is authored separately with apply_patch.
 [PSCustomObject]@{animal=$job.animal;action=$job.action;fps=$job.fps;report=$r} | ConvertTo-Json -Depth 5
}
