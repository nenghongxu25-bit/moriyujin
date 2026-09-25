param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
)
# Texture-preserving boundary displacement with an exact 8px tile-edge guard.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class IrregularForestTerrain {
    static double Smooth(double t) { t=Math.Max(0,Math.Min(1,t));return t*t*(3-2*t); }
    public static void Run(string source,string destination) {
        using(var src=new Bitmap(source))
        using(var dst=new Bitmap(src.Width,src.Height,PixelFormat.Format32bppArgb)) {
            if(src.Width!=768 || src.Height!=1152)throw new Exception("Unexpected atlas size");
            int changed=0,guardChanges=0,centerChanges=0,alphaChanges=0;
            for(int y=0;y<src.Height;y++)for(int x=0;x<src.Width;x++) {
                int lx=x%384,ly=y%384,tx=x%128,ty=y%128;
                int edge=Math.Min(Math.Min(tx,127-tx),Math.Min(ty,127-ty));
                int sx=x,sy=y;
                bool center=lx>=128 && lx<256 && ly>=128 && ly<256;
                if(edge>=8 && !center) {
                    double dx=lx-192,dy=ly-192,qx=Math.Abs(dx)-64,qy=Math.Abs(dy)-64;
                    double ax=Math.Max(qx,0),ay=Math.Max(qy,0),len=Math.Sqrt(ax*ax+ay*ay);
                    double distance=len+Math.Min(Math.Max(qx,qy),0)-64;
                    double nx,ny;
                    if(len>0){nx=ax/len*Math.Sign(dx);ny=ay/len*Math.Sign(dy);}
                    else if(qx>qy){nx=Math.Sign(dx);ny=0;}else{nx=0;ny=Math.Sign(dy);}
                    double shell=1-Smooth((Math.Abs(distance)-8)/20);
                    double fade=Smooth((edge-8)/16.0);
                    double phase=(x/384+2*(y/384))*1.73;
                    // Several nonmatching wavelengths avoid regularly scalloped edges.
                    double noise=3.3*Math.Sin(lx*.071+ly*.093+phase)
                        +1.8*Math.Sin(lx*.169-ly*.127+phase*2.1)
                        +.9*Math.Sin(lx*.313+ly*.237-phase*.7);
                    double offset=noise*fade*shell;
                    sx=(int)Math.Round(x+nx*offset);sy=(int)Math.Round(y+ny*offset);
                }
                Color before=src.GetPixel(x,y),sample=src.GetPixel(sx,sy);
                Color after=Color.FromArgb(before.A,sample.R,sample.G,sample.B);
                dst.SetPixel(x,y,after);
                if(before.ToArgb()!=after.ToArgb()){changed++;if(edge<8)guardChanges++;if(center)centerChanges++;}
                if(before.A!=after.A)alphaChanges++;
            }
            if(guardChanges!=0 || centerChanges!=0 || alphaChanges!=0)throw new Exception("Preservation check failed");
            dst.Save(destination,ImageFormat.Png);
            Console.WriteLine("Changed pixels: "+changed+"; 8px guard changes: "+guardChanges+"; center changes: "+centerChanges+"; alpha changes: "+alphaChanges);
        }
    }
}
'@
[IrregularForestTerrain]::Run([IO.Path]::GetFullPath($Source),[IO.Path]::GetFullPath($Destination))
