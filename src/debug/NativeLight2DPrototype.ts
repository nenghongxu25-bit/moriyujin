const { regClass } = Laya;

/** Isolated LayaAir Light2D test: lit Mesh2D receivers + a polygon wall occluder. */
@regClass("8bdc9456-33f1-43d1-b6f2-6fc9dcbf2413")
export class NativeLight2DPrototype extends Laya.Script {
    private readonly created: Laya.Sprite[] = [];

    onAwake(): void {
        const root = this.owner as Laya.Sprite;
        this.addReceiver(root, 0, 0, 1334, 750, 0.16, 0.19, 0.22);

        // A tiled-looking floor makes the light falloff easy to judge.
        const colors = [
            [0.42, 0.39, 0.31], [0.35, 0.37, 0.32], [0.47, 0.42, 0.34],
            [0.31, 0.34, 0.31], [0.40, 0.38, 0.32], [0.34, 0.36, 0.33]
        ];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 7; col++) {
                const c = colors[(row * 7 + col) % colors.length];
                this.addReceiver(root, 92 + col * 164, 72 + row * 148, 158, 142, c[0], c[1], c[2]);
            }
        }

        // The warm point light illuminates the floor and casts a hard shadow.
        this.addLight(root, 350, 370, 310, 0xffc878);
        // A second cool light demonstrates overlapping native lights.
        this.addLight(root, 1000, 380, 265, 0x82bfff);

        // One wall with an actual LightOccluder2D polygon.
        const wall = this.addReceiver(root, 635, 257, 46, 254, 0.62, 0.56, 0.43);
        const occluder = wall.addComponent(Laya.LightOccluder2D) as Laya.LightOccluder2D;
        occluder.layerMask = 1;
        occluder.polygonPoint = new Laya.PolygonPoint2D([
            -23, -127, 23, -127, 23, 127, -23, 127
        ]);

        // A second short wall gives the shadow shape a more useful comparison.
        const shortWall = this.addReceiver(root, 840, 110, 34, 162, 0.52, 0.49, 0.39);
        const shortOccluder = shortWall.addComponent(Laya.LightOccluder2D) as Laya.LightOccluder2D;
        shortOccluder.layerMask = 1;
        shortOccluder.polygonPoint = new Laya.PolygonPoint2D([
            -17, -81, 17, -81, 17, 81, -17, 81
        ]);
    }

    private addReceiver(parent: Laya.Sprite, x: number, y: number, width: number, height: number,
        r: number, g: number, b: number): Laya.Sprite {
        const node = new Laya.Sprite();
        node.pos(x, y);
        parent.addChild(node);
        const mesh = node.addComponent(Laya.Mesh2DRender) as Laya.Mesh2DRender;
        mesh.useUnitQuad = true;
        mesh.size = new Laya.Vector2(width, height);
        mesh.color = new Laya.Color(r, g, b, 1);
        // Mesh2DRender does not receive Light2D unless this is explicitly enabled.
        mesh.lightReceive = true;
        this.created.push(node);
        return node;
    }

    private addLight(parent: Laya.Sprite, x: number, y: number, radius: number, hexColor: number): void {
        const node = new Laya.Sprite();
        node.pos(x, y);
        parent.addChild(node);
        const light = node.addComponent(Laya.SpotLight2D) as Laya.SpotLight2D;
        light.innerRadius = radius * 0.12;
        light.outerRadius = radius;
        light.innerAngle = 360;
        light.outerAngle = 360;
        light.falloffIntensity = 1.5;
        light.color = new Laya.Color(
            ((hexColor >> 16) & 255) / 255,
            ((hexColor >> 8) & 255) / 255,
            (hexColor & 255) / 255,
            1
        );
        light.intensity = 1.2;
        light.layerMask = 1;
        light.shadowLayerMask = 1;
        light.shadowEnable = true;
        light.shadowStrength = 0.9;
        light.shadowFilterType = Laya.ShadowFilterType.None;
    }

    onDestroy(): void {
        this.created.length = 0;
    }
}
