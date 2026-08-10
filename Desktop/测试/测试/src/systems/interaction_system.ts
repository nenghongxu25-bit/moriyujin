import { HarvestableBase } from "../harvestable/HarvestableBase";

export class InteractionSystem {
    public static readonly instance: InteractionSystem = new InteractionSystem();

    public start(): void {
        // Intentionally empty.
    }

    public getFocusedChopTarget(): HarvestableBase | null {
        return HarvestableBase.getFocusedChopTarget();
    }

    public destroyByInstanceId(instanceId: string): boolean {
        return HarvestableBase.destroyByInstanceId(instanceId);
    }

    public resolveByInstanceId(instanceId: string): HarvestableBase | null {
        return HarvestableBase.resolveByInstanceId(instanceId);
    }

    public setFocusedChopTarget(target: HarvestableBase | null): void {
        HarvestableBase.setFocusedChopTarget(target);
    }
}
