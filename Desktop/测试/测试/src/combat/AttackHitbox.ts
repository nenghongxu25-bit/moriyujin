const { regClass, property } = Laya;

export interface HitboxAttacker {
    attackPower: number;
    getAttackToken(): number;
}

export interface DamageReceiver {
    takeDamage(amount: number): void;
    isDead?(): boolean;
}

@regClass()
export class AttackHitbox extends Laya.Script {
    @property(Laya.Node)
    public attackerNode: Laya.Node | null = null;

    @property(String)
    public targetKind: string = "enemy";

    private hitTokens: WeakMap<object, number> = new WeakMap();

    onAwake(): void {
        this.bind();
    }

    onEnable(): void {
        this.bind();
    }

    onDisable(): void {
        this.unbind();
        this.hitTokens = new WeakMap();
    }

    onDestroy(): void {
        this.unbind();
        this.hitTokens = new WeakMap();
    }

    private bind(): void {
        const owner = this.owner as any;
        if (owner && typeof owner.off === "function") {
            owner.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        }
        if (owner && typeof owner.on === "function") {
            owner.on(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        }
    }

    private unbind(): void {
        const owner = this.owner as any;
        if (owner && typeof owner.off === "function") {
            owner.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        }
    }

    private onTriggerEnter(other: any): void {
        const attacker = this.resolveAttacker();
        if (!attacker) {
            return;
        }

        const targetNode = this.resolveOtherNode(other);
        const receiver = this.resolveReceiver(targetNode);
        if (!receiver) {
            return;
        }

        if (!this.matchesTargetKind(receiver)) {
            return;
        }

        if (receiver.isDead && receiver.isDead()) {
            return;
        }

        const token = attacker.getAttackToken();
        if (token <= 0) {
            return;
        }

        const key = receiver as object;
        if (this.hitTokens.get(key) === token) {
            return;
        }

        this.hitTokens.set(key, token);
        receiver.takeDamage(attacker.attackPower);
    }

    private resolveAttacker(): HitboxAttacker | null {
        const node = this.attackerNode || this.findControllerOwner(this.owner as Laya.Node | null);
        return this.findComponentWithMethods(node, ["getAttackToken"], ["attackPower"]) as HitboxAttacker | null;
    }

    private resolveReceiver(node: Laya.Node | null): DamageReceiver | null {
        return this.findComponentWithMethods(node, ["takeDamage"], []) as DamageReceiver | null;
    }

    private matchesTargetKind(receiver: DamageReceiver): boolean {
        const kind = String(this.targetKind || "").toLowerCase();
        const candidate = receiver as any;

        if (kind === "enemy") {
            return typeof candidate.isDead === "function";
        }

        if (kind === "player") {
            return typeof candidate.setRunningState === "function";
        }

        return true;
    }

    private resolveOtherNode(other: any): Laya.Node | null {
        if (!other) {
            return null;
        }

        const node = other.owner || other.node || other.colliderOwner || null;
        return node instanceof Laya.Node ? node : null;
    }

    private findControllerOwner(node: Laya.Node | null): Laya.Node | null {
        let current = node;
        while (current) {
            const attacker = this.findComponentWithMethods(current, ["getAttackToken"], ["attackPower"]);
            if (attacker) {
                return current;
            }
            current = current.parent;
        }

        return null;
    }

    private findComponentWithMethods(node: Laya.Node | null, methods: string[], fields: string[]): any {
        let current = node;
        while (current) {
            const components = (current as any)._components || (current as any).components || [];
            for (let i = 0; i < components.length; i++) {
                const component = components[i] as any;
                if (!component) {
                    continue;
                }

                let matches = true;
                for (let m = 0; m < methods.length; m++) {
                    if (typeof component[methods[m]] !== "function") {
                        matches = false;
                        break;
                    }
                }

                for (let f = 0; matches && f < fields.length; f++) {
                    if (!(fields[f] in component)) {
                        matches = false;
                    }
                }

                if (matches) {
                    return component;
                }
            }

            current = current.parent;
        }

        return null;
    }
}
