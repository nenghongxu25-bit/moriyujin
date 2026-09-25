const { regClass } = Laya;

/** Binds authored template nodes only. Does not create or draw UI. */
@regClass('86caec40-e001-46c8-936a-23e0e175eb55')
export class ReferenceTemplates extends Laya.Script {
    private nodes: Laya.Node[] = [];
    onAwake(): void {
        const visit = (n: Laya.Node) => {
            this.nodes.push(n);
            if (n.name.startsWith('go:') || n.name.startsWith('pick:')) {
                (n as Laya.Sprite).mouseEnabled = true;
                n.on(Laya.Event.CLICK, this, this.click, [n]);
            }
            for (let i = 0; i < n.numChildren; i++) visit(n.getChildAt(i));
        };
        visit(this.owner);
    }
    private click(n: Laya.Node, event?: Laya.Event): void {
        event?.stopPropagation();
        const parts = n.name.split(':');
        if (parts[0] === 'go') {
            for (const p of this.nodes) if (p.name.startsWith('page:'))
                (p as Laya.Sprite).visible = p.name === 'page:' + parts[1];
            const warehouse = this.nodes.find(p => p.name === 'warehouse_panel');
            if (warehouse && parts[1] === 'warehouse') {
                (warehouse as Laya.Sprite).visible = true;
                const components = (warehouse as any)._components || [];
                for (const c of components) {
                    if (typeof c.onPanelOpened === 'function') c.onPanelOpened();
                    else if (typeof c.refresh === 'function') c.refresh();
                }
            }
            const map = this.nodes.find(p => p.name === 'mapchoose');
            if (map && parts[1] === 'map') (map as Laya.Sprite).visible = true;
        } else {
            // Local selection groups keep individual pages independent.
            let page = n.parent;
            while (page && !page.name.startsWith('page:')) page = page.parent;
            if (!page) return;
            const select = (p: Laya.Node) => {
                if (p.name.startsWith('pick:' + parts[1] + ':')) {
                    const mark = p.getChildByName('Selected') as Laya.Sprite;
                    if (mark) mark.visible = p === n;
                }
                if (p.name.startsWith('view:' + parts[1] + ':'))
                    (p as Laya.Sprite).visible = p.name === 'view:' + parts[1] + ':' + parts[2];
                for (let i = 0; i < p.numChildren; i++) select(p.getChildAt(i));
            };
            select(page);
        }
    }
    onDestroy(): void {
        for (const n of this.nodes) if (!n.destroyed) n.offAllCaller(this);
        this.nodes = [];
    }
}
