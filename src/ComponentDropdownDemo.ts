const { regClass } = Laya;

@regClass()
export class ComponentDropdownDemo extends Laya.Script {
    private popup: Laya.Sprite | null = null;
    private valueText: Laya.Text | null = null;
    private trainItems: Laya.Sprite[] = [];
    private popupOpen = false;
    private trainOpen = false;

    onAwake(): void {
        const root = this.owner as Laya.Node;
        const dropdownButton = this.findNode(root, "DropdownButton");
        const trainHead = this.findNode(root, "TrainHead");

        this.popup = this.findNode(root, "DropdownPopup") as Laya.Sprite | null;
        this.valueText = this.findNode(root, "DropdownValue") as Laya.Text | null;
        this.trainItems = [
            this.findNode(root, "TrainItemRole") as Laya.Sprite | null,
            this.findNode(root, "TrainItemBag") as Laya.Sprite | null,
            this.findNode(root, "TrainItemSkill") as Laya.Sprite | null,
            this.findNode(root, "TrainItemMap") as Laya.Sprite | null,
        ].filter((node): node is Laya.Sprite => !!node);

        dropdownButton?.on(Laya.Event.CLICK, this, this.togglePopup);
        trainHead?.on(Laya.Event.CLICK, this, this.toggleTrain);

        this.bindOption(root, "OptionTown", "枫桥镇");
        this.bindOption(root, "OptionSect", "青槐宗");
        this.bindOption(root, "OptionVillage", "杨家庄");

        this.setPopup(false);
        this.setTrain(false, true);
    }

    private bindOption(root: Laya.Node, nodeName: string, value: string): void {
        const option = this.findNode(root, nodeName);
        option?.on(Laya.Event.CLICK, this, () => {
            if (this.valueText) {
                this.valueText.text = value;
            }

            this.setPopup(false);
        });
    }

    private togglePopup(): void {
        this.setPopup(!this.popupOpen);
    }

    private setPopup(open: boolean): void {
        this.popupOpen = open;
        if (this.popup) {
            this.popup.visible = open;
        }
    }

    private toggleTrain(): void {
        this.setTrain(!this.trainOpen, false);
    }

    private setTrain(open: boolean, immediate: boolean): void {
        this.trainOpen = open;

        this.trainItems.forEach((item, index) => {
            const targetX = open ? 72 * (index + 1) : 0;
            const targetAlpha = open ? 1 : 0;
            item.visible = true;
            Laya.Tween.clearAll(item);

            if (immediate) {
                item.x = targetX;
                item.alpha = targetAlpha;
                item.visible = open;
                return;
            }

            Laya.Tween.to(
                item,
                { x: targetX, alpha: targetAlpha },
                180,
                null,
                Laya.Handler.create(this, () => {
                    if (!open) {
                        item.visible = false;
                    }
                }),
                index * 45
            );
        });
    }

    private findNode(root: Laya.Node, name: string): Laya.Node | null {
        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findNode(root.getChildAt(i), name);
            if (result) {
                return result;
            }
        }

        return null;
    }
}
