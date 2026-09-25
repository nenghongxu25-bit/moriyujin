const { regClass } = Laya;

import { listTemplate, type ListTemplateData } from "../CommonUI/listTemplate";

@regClass()
export class CraftingItemBox extends Laya.Script {
    private template: listTemplate | null = null;

    public bind(item: ListTemplateData | null): void {
        this.resolveTemplate();
        if (this.template) {
            this.template.bindData(item);
        }
    }

    private resolveTemplate(): void {
        if (this.template && this.template.owner) {
            return;
        }

        const owner = this.owner as Laya.Node;
        this.template = owner.getComponent(listTemplate);
        if (!this.template) {
            this.template = owner.addComponent(listTemplate);
        }
    }
}
