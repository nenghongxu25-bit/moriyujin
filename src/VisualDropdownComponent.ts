const { regClass, property } = Laya;

interface DropdownOption {
    label: string;
    value: string;
}

@regClass()
export class VisualDropdownComponent extends Laya.Script {
    @property(String)
    labels = "Option A,Option B,Option C";

    @property(Number)
    selectedIndex = 0;

    @property(Number)
    dropdownWidth = 180;

    @property(Number)
    rowHeight = 36;

    @property(Number)
    visibleItemCount = 6;

    @property(Number)
    fontSize = 18;

    @property(String)
    textColor = "#e8dcc3";

    @property(String)
    backgroundColor = "#171717";

    @property(String)
    borderColor = "#6f6045";

    @property(String)
    hoverColor = "#2a241b";

    @property(String)
    popupColor = "#111111";

    @property(String)
    placeholderLabel = "";

    onSelect: ((index: number, label: string, value: string) => void) | null = null;

    private root!: Laya.Sprite;
    private valueText: Laya.Text | null = null;
    private arrowText: Laya.Text | null = null;
    private popup: Laya.Sprite | null = null;
    private list: Laya.GList | null = null;
    private options: DropdownOption[] = [];
    private open = false;

    onAwake(): void {
        this.root = this.owner as Laya.Sprite;
        this.root.mouseEnabled = true;
        this.root.size(this.dropdownWidth, this.rowHeight);

        this.valueText = this.findNode(this.root, "DropdownValue") as Laya.Text | null;
        this.arrowText = this.findNode(this.root, "DropdownArrow") as Laya.Text | null;
        this.popup = this.findNode(this.root, "DropdownPopup") as Laya.Sprite | null;
        this.list = this.findNode(this.root, "DropdownList") as Laya.GList | null;
        if (!this.popup) {
            this.popup = new Laya.Sprite();
            this.popup.name = "DropdownPopup";
            this.root.addChild(this.popup);
        }

        this.options = this.parseOptions(this.labels);
        this.selectedIndex = this.clampIndex(this.selectedIndex);

        this.root.on(Laya.Event.CLICK, this, this.toggle);
        Laya.stage?.on(Laya.Event.CLICK, this, this.closeFromStage);

        this.render();
        this.setOpen(false);
    }

    onDestroy(): void {
        Laya.stage?.off(Laya.Event.CLICK, this, this.closeFromStage);
    }

    get selectedLabel(): string {
        return this.options[this.selectedIndex]?.label ?? "";
    }

    get selectedValue(): string {
        return this.options[this.selectedIndex]?.value ?? "";
    }

    setLabels(labels: string, selectedIndex = 0): void {
        this.labels = labels;
        this.options = this.parseOptions(labels);
        this.selectedIndex = this.clampIndex(selectedIndex);
        if (!this.root) {
            return;
        }

        this.render();
        this.setOpen(false);
    }

    private toggle(event: Laya.Event): void {
        event.stopPropagation();
        this.setOpen(!this.open);
    }

    private closeFromStage(): void {
        this.setOpen(false);
    }

    private setOpen(value: boolean): void {
        this.open = value;
        if (value && this.root.parent) {
            this.root.parent.addChild(this.root);
        }

        if (this.popup) {
            this.popup.visible = value;
        }
        if (this.list) {
            this.list.visible = false;
        }
        if (this.arrowText) {
            this.arrowText.text = value ? "^" : "v";
        }
    }

    private select(index: number, event: Laya.Event): void {
        event.stopPropagation();
        this.selectedIndex = this.clampIndex(index);
        this.placeholderLabel = "";
        if (this.valueText) {
            this.valueText.text = this.selectedLabel;
        }
        this.setOpen(false);

        if (this.onSelect) {
            this.onSelect(this.selectedIndex, this.selectedLabel, this.selectedValue);
        }
    }

    private render(): void {
        this.drawRoot();
        this.renderText();
        this.renderPopup();
    }

    private drawRoot(): void {
        this.root.graphics.clear();
        this.root.graphics.drawRect(0, 0, this.dropdownWidth, this.rowHeight, this.backgroundColor, this.borderColor, 1);
        this.root.width = this.dropdownWidth;
        this.root.height = this.rowHeight;
    }

    private renderText(): void {
        if (this.valueText) {
            this.valueText.text = this.placeholderLabel || this.selectedLabel;
            this.valueText.color = this.textColor;
            this.valueText.fontSize = this.fontSize;
            this.valueText.pos(12, 0);
            this.valueText.size(this.dropdownWidth - 42, this.rowHeight);
            this.valueText.align = "left";
            this.valueText.valign = "middle";
            this.valueText.mouseEnabled = false;
        }

        if (this.arrowText) {
            this.arrowText.color = this.textColor;
            this.arrowText.fontSize = this.fontSize;
            this.arrowText.pos(this.dropdownWidth - 30, 0);
            this.arrowText.size(24, this.rowHeight);
            this.arrowText.align = "center";
            this.arrowText.valign = "middle";
            this.arrowText.mouseEnabled = false;
        }
    }

    private renderPopup(): void {
        if (!this.popup) {
            return;
        }

        if (this.popup.numChildren > 0) {
            this.popup.removeChildren(0, this.popup.numChildren - 1, true);
        }
        this.popup.pos(0, this.rowHeight + 2);
        this.popup.size(this.dropdownWidth, this.rowHeight * this.options.length);
        this.popup.mouseEnabled = true;
        this.popup.graphics.clear();
        this.popup.graphics.drawRect(0, 0, this.dropdownWidth, this.rowHeight * this.options.length, this.popupColor, this.borderColor, 1);

        this.options.forEach((option, index) => {
            const item = new Laya.Sprite();
            item.name = "OptionItem";
            item.pos(0, index * this.rowHeight);
            item.size(this.dropdownWidth, this.rowHeight);
            item.mouseEnabled = true;
            this.drawItem(item, index === this.selectedIndex);

            const text = new Laya.Text();
            text.name = "OptionText";
            text.text = option.label;
            text.color = this.textColor;
            text.fontSize = this.fontSize;
            text.pos(12, 0);
            text.size(this.dropdownWidth - 24, this.rowHeight);
            text.align = "left";
            text.valign = "middle";
            text.mouseEnabled = false;
            item.addChild(text);

            item.on(Laya.Event.MOUSE_OVER, this, () => this.drawItem(item, true));
            item.on(Laya.Event.MOUSE_OUT, this, () => this.drawItem(item, index === this.selectedIndex));
            item.on(Laya.Event.CLICK, this, (event: Laya.Event) => this.select(index, event));
            this.popup?.addChild(item);
        });
    }

    private renderList(): void {
        if (!this.list) {
            return;
        }

        this.list.pos(0, this.rowHeight + 2);
        this.list.size(this.dropdownWidth, Math.min(this.options.length, this.visibleItemCount) * this.rowHeight);
        this.list.visible = false;
        this.list.itemRenderer = (index: number, item: Laya.GWidget) => {
            this.renderListItem(index, item);
        };
        this.list.numItems = this.options.length;
        this.list.selectedIndex = this.selectedIndex;
    }

    private renderListItem(index: number, item: Laya.GWidget): void {
        item.size(this.dropdownWidth, this.rowHeight);
        item.mouseEnabled = true;

        const sprite = item.getChildByName("ItemBackground") as Laya.Sprite | null;
        if (sprite) {
            sprite.size(this.dropdownWidth, this.rowHeight);
            this.drawItem(sprite, index === this.selectedIndex);
            sprite.mouseEnabled = false;
        }

        const text = item.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.text = this.options[index]?.label ?? "";
            text.color = this.textColor;
            text.fontSize = this.fontSize;
            text.pos(12, 0);
            text.size(this.dropdownWidth - 24, this.rowHeight);
            text.align = "left";
            text.valign = "middle";
            text.mouseEnabled = false;
        }

        item.offAll(Laya.Event.CLICK);
        item.on(Laya.Event.CLICK, this, (event: Laya.Event) => this.select(index, event));
    }

    private drawItem(item: Laya.Sprite, active: boolean): void {
        item.graphics.clear();
        item.graphics.drawRect(0, 0, this.dropdownWidth, this.rowHeight, active ? this.hoverColor : this.popupColor);
    }

    private parseOptions(labels: string): DropdownOption[] {
        return labels
            .split(",")
            .map((label) => label.trim())
            .filter((label) => label.length > 0)
            .map((label) => ({ label, value: label }));
    }

    private clampIndex(index: number): number {
        if (this.options.length === 0) {
            return -1;
        }
        return Math.max(0, Math.min(index, this.options.length - 1));
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
