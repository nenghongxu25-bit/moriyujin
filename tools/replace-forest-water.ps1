param([Parameter(Mandatory=$true)][string]$Source,[Parameter(Mandatory=$true)][string]$Water,[Parameter(Mandatory=$true)][string]$Destination,[Parameter(Mandatory=$true)][string]$TileOutput)
# Mechanical placement of imagegen output; original land/shore geometry and alpha are authoritative.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
public static class ReplaceForestWater {
    static double Smooth(double lo,double hi,double x){double t=Math.Max(0,Math.Min(1,(x-lo)/(hi-lo)));return t*t*(3-2*t);}
    static double Mask(Color c){return Smooth(0.015,0.07,(c.B-c.R)/255.0)*Smooth(0.01,0.06,(c.G-c.R)/255.0);}
    static Color Mix(Color a,Color b,double t){return Color.FromArgb(a.A,(int)Math.Round(a.R+(b.R-a.R)*t),(int)Math.Round(a.G+(b.G-a.G)*t),(int)Math.Round(a.B+(b.B-a.B)*t));}
    public static void Run(string source,string water,string destination,string tileOutput){
        using(var src=new Bitmap(source)) using(var art=new Bitmap(water))
        using(var tile=new Bitmap(128,128,PixelFormat.Format32bppArgb))
        using(var dst=new Bitmap(src.Width,src.Height,PixelFormat.Format32bppArgb)) {
            if(src.Width!=768||src.Height!=1152)throw new Exception("Unexpected atlas dimensions");
            using(var g=Graphics.FromImage(tile)){
                g.InterpolationMode=InterpolationMode.HighQualityBicubic;
                g.DrawImage(art,new Rectangle(0,0,128,128));
            }
            for(int y=0;y<128;y++)for(int x=0;x<128;x++){
                Color c=tile.GetPixel(x,y);tile.SetPixel(x,y,Color.FromArgb(255,c.R,c.G,c.B));
            }
            // Match opposing edges in a narrow strip so the same 128px water patch joins across all cells.
            for(int y=0;y<128;y++)for(int x=0;x<12;x++){
                Color a=tile.GetPixel(x,y),b=tile.GetPixel(127-x,y),mean=Mix(a,b,0.5);
                double t=1-Smooth(0,12,x);
                tile.SetPixel(x,y,Mix(a,mean,t));tile.SetPixel(127-x,y,Mix(b,mean,t));
            }
            for(int x=0;x<128;x++)for(int y=0;y<12;y++){
                Color a=tile.GetPixel(x,y),b=tile.GetPixel(x,127-y),mean=Mix(a,b,0.5);
                double t=1-Smooth(0,12,y);
                tile.SetPixel(x,y,Mix(a,mean,t));tile.SetPixel(x,127-y,Mix(b,mean,t));
            }
            for(int i=0;i<128;i++){
                if(tile.GetPixel(0,i).ToArgb()!=tile.GetPixel(127,i).ToArgb()||tile.GetPixel(i,0).ToArgb()!=tile.GetPixel(i,127).ToArgb())throw new Exception("Water seam failed");
            }
            int changed=0,protectedChanged=0,alphaChanged=0,maskLost=0;
            for(int y=0;y<src.Height;y++)for(int x=0;x<src.Width;x++){
                Color old=src.GetPixel(x,y);double weight=y<384?Mask(old):0;
                Color next=weight>0?Mix(old,tile.GetPixel(x%128,y%128),weight):old;
                dst.SetPixel(x,y,next);
                if(old.ToArgb()!=next.ToArgb()){changed++;if(weight==0)protectedChanged++;}
                if(old.A!=next.A)alphaChanged++;
                if(weight>0.99&&Mask(next)<0.99)maskLost++;
            }
            if(protectedChanged!=0||alphaChanged!=0||maskLost!=0)throw new Exception("Atlas invariant failed");
            tile.Save(tileOutput,ImageFormat.Png);dst.Save(destination,ImageFormat.Png);
            Console.WriteLine("Water pixels replaced: "+changed+"; non-water changed: "+protectedChanged+"; alpha changed: "+alphaChanged+"; water-mask losses: "+maskLost+"; tile edge mismatches: 0");
        }
    }
}
'@
[ReplaceForestWater]::Run([IO.Path]::GetFullPath($Source),[IO.Path]::GetFullPath($Water),[IO.Path]::GetFullPath($Destination),[IO.Path]::GetFullPath($TileOutput))
