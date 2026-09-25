param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
)
# Round the 45-degree transition corners by remapping existing source pixels.
# No palette change, generated replacement texture, or atlas repacking.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class RoundForestTerrain {
    static double Smooth(double t) { t=Math.Max(0,Math.Min(1,t)); return t*t*(3-2*t); }
    public static void Run(string source, string destination) {
        using(var src=new Bitmap(source))
        using(var dst=new Bitmap(src.Width,src.Height,PixelFormat.Format32bppArgb)) {
            if(src.Width!=768 || src.Height!=1152) throw new Exception("Expected 6x9 atlas of 128px tiles");
            int changed=0, protectedChanged=0;
            for(int y=0;y<src.Height;y++) for(int x=0;x<src.Width;x++) {
                int bx=x/384*384,by=y/384*384,lx=x-bx,ly=y-by;
                int sx=x,sy=y;
                bool corner=(lx<128 || lx>=256) && (ly<128 || ly>=256);
                // A two-pixel guard at every tile edge guarantees the original interfaces.
                bool guard=x%128<2 || x%128>=126 || y%128<2 || y%128>=126;
                if(corner && !guard) {
                    double cx=lx<128?128:256,cy=ly<128?128:256;
                    double dx=lx-cx,dy=ly-cy,r=Math.Sqrt(dx*dx+dy*dy);
                    if(r>0) {
                        double sum=(Math.Abs(dx)+Math.Abs(dy))/r;
                        // Old chamfer: |dx|+|dy|=64. New contour: radius=64.
                        double delta=64-64/sum;
                        double weight=r<=64?Smooth((r-16)/48):1-Smooth((r-64)/56);
                        double rr=r-delta*weight;
                        sx=bx+(int)Math.Round(cx+dx*rr/r);
                        sy=by+(int)Math.Round(cy+dy*rr/r);
                    }
                }
                Color before=src.GetPixel(x,y),after=src.GetPixel(sx,sy);
                // Source alpha at the destination remains authoritative.
                after=Color.FromArgb(before.A,after.R,after.G,after.B);
                dst.SetPixel(x,y,after);
                if(before.ToArgb()!=after.ToArgb()) {
                    changed++;
                    if(!corner || guard) protectedChanged++;
                }
            }
            if(protectedChanged!=0) throw new Exception("Protected tile pixels changed");
            dst.Save(destination,ImageFormat.Png);
            Console.WriteLine("Changed corner pixels: "+changed+"; changed center/straight/interface pixels: "+protectedChanged);
        }
    }
}
'@
[RoundForestTerrain]::Run([IO.Path]::GetFullPath($Source),[IO.Path]::GetFullPath($Destination))
