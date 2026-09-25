import { ContainerBase, type ContainerItem } from './ContainerBase';
const { regClass, property } = Laya;

/** Map loot prop; contents can be configured per instance through contentsJson. */
@regClass()
export class LootPoint extends ContainerBase {
    @property(String)
    public visualId = 'weapon_crate';

    @property(String)
    public visualFolder = 'loot-points-v1';

    onAwake(): void {
        super.onAwake();
        Laya.loader.load(this.getOpenVisualFrames()).catch(error => console.warn('物资点动画加载失败', this.visualId, error));
    }

    protected getDefaultContainerId(): string { return 'loot_' + this.visualId; }
    protected getDefaultDisplayName(): string { return '物资箱'; }
    protected getDefaultContents(): ContainerItem[] { return []; }
    protected getOpenVisualFrames(): string[] {
        return [0, 1, 2, 3].map(i => `animation/container/${this.visualFolder}/${this.visualId}/frame_0${i}.png`);
    }
}
