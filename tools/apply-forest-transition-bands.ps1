param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Generated,
    [Parameter(Mandatory=$true)][string]$Destination
)
# Import imagegen material details only inside transition bands.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class ForestTransitionBands {
    static double Smooth(double t){t=Math.Max(0,Math.Min(1,t));return t*t*(3-2*t);}
    static int Mix(int a,int b,double t){return (int)Math.Round(a+(b-a)*t);}
    public static void Run(string source,string generated,string destination){
        using(var src=new Bitmap(source))
        using(var art=new Bitmap(generated))
        using(var aligned=new Bitmap(src.Width,src.Height,PixelFormat.Format32bppArgb))
        using(var dst=new Bitmap(src.Width,src.Height,PixelFormat.Format32bppArgb)){
            if(src.Width!=768||src.Height!=1152)throw new Exception("Unexpected source atlas dimensions");
            if(art.Width*3!=art.Height*2)throw new Exception("Generated atlas aspect ratio mismatch");
            using(var g=Graphics.FromImage(aligned)){
                g.CompositingMode=CompositingMode.SourceCopy;
                g.InterpolationMode=InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode=PixelOffsetMode.HighQuality;
                g.DrawImage(art,new Rectangle(0,0,src.Width,src.Height),0,0,art.Width,art.Height,GraphicsUnit.Pixel);
            }
            int changed=0,guardChanges=0,centerChanges=0,interiorChanges=0,alphaChanges=0;
            for(int y=0;y<src.Height;y++)for(int x=0;x<src.Width;x++){
                int lx=x%384,ly=y%384,tx=x%128,ty=y%128;
                int edge=Math.Min(Math.Min(tx,127-tx),Math.Min(ty,127-ty));
                bool center=lx>=128&&lx<256&&ly>=128&&ly<256;
                double qx=Math.Abs(lx-192)-64,qy=Math.Abs(ly-192)-64;
                double ax=Math.Max(qx,0),ay=Math.Max(qy,0);
                double distance=Math.Sqrt(ax*ax+ay*ay)+Math.Min(Math.Max(qx,qy),0)-64;
                // The 32px envelope includes existing irregularity and shore stones.
                double band=1-Smooth((Math.Abs(distance)-12)/20);
                double weight=center?0:band*Smooth((edge-8)/16.0);
                Color a=src.GetPixel(x,y),b=aligned.GetPixel(x,y);
                Color c=Color.FromArgb(a.A,Mix(a.R,b.R,weight),Mix(a.G,b.G,weight),Mix(a.B,b.B,weight));
                dst.SetPixel(x,y,c);
                if(a.ToArgb()!=c.ToArgb()){
                    changed++;if(edge<8)guardChanges++;if(center)centerChanges++;
                    if(Math.Abs(distance)>=32)interiorChanges++;
                }
                if(a.A!=c.A)alphaChanges++;
            }
            if(guardChanges+centerChanges+interiorChanges+alphaChanges!=0)throw new Exception("Protected pixels changed");
            dst.Save(destination,ImageFormat.Png);
            Console.WriteLine("Changed band pixels: "+changed+"; guard changes: "+guardChanges+"; center changes: "+centerChanges+"; outside band changes: "+interiorChanges+"; alpha changes: "+alphaChanges);
        }
    }
}
'@
[ForestTransitionBands]::Run([IO.Path]::GetFullPath($Source),[IO.Path]::GetFullPath($Generated),[IO.Path]::GetFullPath($Destination))
