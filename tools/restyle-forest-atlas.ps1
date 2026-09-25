param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
)
# Apply the approved style palette without spatial operations: source pixel
# coordinates, alpha, terrain boundaries and atlas cell positions stay intact.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class ForestAtlasPalette {
    static double Clamp(double x) { return Math.Max(0, Math.Min(1, x)); }
    static double Smooth(double a, double b, double x) {
        double t=Clamp((x-a)/(b-a)); return t*t*(3-2*t);
    }
    public static void Apply(string source, string destination) {
        using (var input=new Bitmap(source))
        using (var output=new Bitmap(input.Width,input.Height,PixelFormat.Format32bppArgb)) {
            if(input.Width!=768 || input.Height!=1152) throw new Exception("Unexpected atlas dimensions");
            for(int y=0;y<input.Height;y++) for(int x=0;x<input.Width;x++) {
                Color p=input.GetPixel(x,y);
                double r=p.R/255.0,g=p.G/255.0,b=p.B/255.0;
                double max=Math.Max(r,Math.Max(g,b)),min=Math.Min(r,Math.Min(g,b)),d=max-min;
                double h=0,s=max==0?0:d/max,v=max;
                if(d>0) { if(max==r)h=((g-b)/d+6)%6;else if(max==g)h=(b-r)/d+2;else h=(r-g)/d+4;h/=6; }
                // Muted earth/stone base; smooth hue ranges avoid hard color bands.
                double green=Smooth(.12,.19,h)*(1-Smooth(.30,.40,h))*Smooth(.15,.50,s);
                double water=Smooth(.40,.49,h)*(1-Smooth(.67,.76,h))*Smooth(.15,.50,s);
                double saturation=s*(.62-.08*green+.07*water);
                double hue=h*(1-water*.60)+.515*water*.60;
                double value=v*(.84-.10*green-.06*water);
                double c=value*saturation,z=c*(1-Math.Abs((hue*6)%2-1)),m=value-c;
                double rr=0,gg=0,bb=0;
                int sector=(int)(hue*6)%6;
                if(sector==0){rr=c;gg=z;}else if(sector==1){rr=z;gg=c;}
                else if(sector==2){gg=c;bb=z;}else if(sector==3){gg=z;bb=c;}
                else if(sector==4){rr=z;bb=c;}else{rr=c;bb=z;}
                output.SetPixel(x,y,Color.FromArgb(p.A,(int)Math.Round(255*Clamp(rr+m)),(int)Math.Round(255*Clamp(gg+m)),(int)Math.Round(255*Clamp(bb+m))));
            }
            output.Save(destination,ImageFormat.Png);
        }
    }
}
'@
[ForestAtlasPalette]::Apply([IO.Path]::GetFullPath($Source), [IO.Path]::GetFullPath($Destination))
