const { regClass } = Laya;

/** Isolated test target, never touches DataManager or player saves. */
@regClass("13e0a173-96e7-4ef9-9291-135944a71203")
export class AnimalTestTarget extends Laya.Script {
    public currentHp = 100000;
    public damageCalls = 0;
    public attackPower = 5;
    public takeDamage(amount: number): void {
        if (!Number.isFinite(amount) || amount <= 0 || this.isDead()) return;
        this.damageCalls++;
        this.currentHp = Math.max(0, this.currentHp - Math.floor(amount));
    }
    public isDead(): boolean { return this.currentHp <= 0; }
    public getAttackToken(): number { return 1; }
    public reset(): void { this.currentHp = 100000; this.damageCalls = 0; }
}
