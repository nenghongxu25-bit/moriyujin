const { regClass, property } = Laya;

interface BattlePassTaskView {
    title: string;
    currentProgress: number;
    requiredProgress: number;
    experience: number;
    completed: boolean;
}

interface BattlePassRewardView {
    level: number;
    name: string;
    count: number;
    icon: string;
    unlocked: boolean;
    claimed: boolean;
}

@regClass()
export class BattlePassPanel extends Laya.Script {
    @property(Laya.Node)
    public timeListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public taskListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public gradeListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public rewardListNode: Laya.Node | null = null;

    @property(Laya.Text)
    public experienceText: Laya.Text | null = null;

    private selectedWeek: number = 1;
    private currentExperience: number = 0;
    private nextLevelExperience: number = 200;

    onAwake(): void {
        this.resolveBindings();
        this.scheduleRefresh();
    }

    onEnable(): void {
        this.resolveBindings();
        this.scheduleRefresh();
    }

    public onPanelOpened(): void {
        this.selectedWeek = 1;
        this.scheduleRefresh();
    }

    private scheduleRefresh(): void {
        Laya.timer.callLater(this, this.refresh);
    }

    public refresh(): void {
        this.resolveBindings();
        this.renderExperienceText();
        this.renderWeekList();
        this.renderTaskList();
        this.renderGradeList();
        this.renderRewardList();
    }

    private renderExperienceText(): void {
        if (this.experienceText) {
            this.experienceText.text = `${this.currentExperience}/${this.nextLevelExperience}`;
        }
    }

    private renderWeekList(): void {
        this.renderList(
            this.timeListNode,
            7,
            (index, node) => this.renderWeekItem(index + 1, node)
        );
    }

    private renderTaskList(): void {
        const tasks = this.getTasksForWeek(this.selectedWeek);
        this.renderList(
            this.taskListNode,
            tasks.length,
            (index, node) => this.renderTaskItem(tasks[index] || null, node)
        );
    }

    private renderGradeList(): void {
        this.renderList(
            this.gradeListNode,
            60,
            (index, node) => this.renderGradeItem(index + 1, node)
        );
    }

    private renderRewardList(): void {
        const rewards = this.getRewards();
        this.renderList(
            this.rewardListNode,
            rewards.length,
            (index, node) => this.renderRewardItem(rewards[index] || null, node)
        );
    }

    private renderWeekItem(week: number, node: Laya.Node): void {
        this.setNodeVisible(node, true);
        this.setFirstText(node, `\u7b2c${week}\u5468`);
        this.setNodeAlpha(node, week === this.selectedWeek ? 1 : 0.6);

        const target = node as any;
        if (target && typeof target.off === "function" && typeof target.on === "function") {
            target.off(Laya.Event.CLICK, this, this.onWeekClick);
            target.on(Laya.Event.CLICK, this, this.onWeekClick, [week]);
        }
    }

    private renderTaskItem(task: BattlePassTaskView | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!task);
        if (!task) {
            return;
        }

        const titleText = this.findDirectText(node);
        if (titleText) {
            titleText.text = task.title;
        }

        const progressText = this.findChildByName(node, "progresstext") as Laya.Text | null;
        if (progressText) {
            progressText.text = `${task.currentProgress}/${task.requiredProgress}`;
        }

        const maskNode = this.findChildByName(node, "mask") || this.findChildByName(node, "mask_1");
        this.setNodeVisible(maskNode, task.completed);
    }

    private renderGradeItem(level: number, node: Laya.Node): void {
        this.setNodeVisible(node, true);
        this.setFirstText(node, `${level}\u7ea7`);
        this.setNodeVisible(this.findChildByName(node, "Sprite_1"), false);
    }

    private renderRewardItem(reward: BattlePassRewardView | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!reward);
        if (!reward) {
            return;
        }

        const gradeNode = this.findChildByName(node, "bt");
        this.setFirstText(gradeNode, `${reward.level}`);

        const iconNode = this.findChildByName(node, "icon") as any;
        if (iconNode) {
            if ("visible" in iconNode) {
                iconNode.visible = true;
            }
            if ("width" in iconNode) {
                iconNode.width = 76;
            }
            if ("height" in iconNode) {
                iconNode.height = 76;
            }
            if ("autoSize" in iconNode) {
                iconNode.autoSize = false;
            }
            if ("skin" in iconNode) {
                iconNode.skin = reward.icon;
            }
            if ("src" in iconNode) {
                iconNode.src = reward.icon;
            }
        }

        const nameText = this.findChildByName(node, "name") as Laya.Text | null;
        if (nameText) {
            nameText.text = reward.name;
        }

        const amountText = this.findChildByName(node, "amount") as Laya.Text | null;
        if (amountText) {
            amountText.text = reward.count > 1 ? `${reward.count}` : "";
        }

        this.setNodeVisible(this.findChildByName(node, "mask_0"), !reward.unlocked);
        this.setNodeVisible(this.findChildByName(node, "mask_1"), reward.claimed);
    }

    private onWeekClick(week: number): void {
        this.selectedWeek = this.clampWeek(week);
        this.renderWeekList();
        this.renderTaskList();
    }

    private renderList(
        listNode: Laya.Node | null,
        count: number,
        renderer: (index: number, node: Laya.Node) => void
    ): void {
        const list = listNode as any;
        if (!list) {
            return;
        }

        if (!this.getTemplateNode(listNode)) {
            Laya.timer.callLater(this, () => {
                this.renderList(listNode, count, renderer);
            });
            return;
        }

        if ("itemRenderer" in list) {
            list.itemRenderer = (index: number, item: Laya.Node) => {
                renderer(index, item);
            };
        }

        if ("numItems" in list) {
            list.numItems = count;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        Laya.timer.callLater(this, () => {
            this.renderVisibleListItems(listNode, count, renderer);
        });
    }

    private renderVisibleListItems(
        listNode: Laya.Node | null,
        count: number,
        renderer: (index: number, node: Laya.Node) => void
    ): void {
        const children = listNode && Array.isArray((listNode as any).children)
            ? ((listNode as any).children as Laya.Node[])
            : [];
        const templateNode = this.getTemplateNode(listNode);
        let dataIndex = 0;

        for (let i = 0; i < children.length && dataIndex < count; i++) {
            const node = children[i];
            if (!node || node === templateNode) {
                continue;
            }

            renderer(dataIndex, node);
            dataIndex++;
        }
    }

    private resolveBindings(): void {
        const root = this.owner as Laya.Node;
        this.timeListNode = this.timeListNode || this.findChildByName(root, "timelist");
        this.taskListNode = this.taskListNode || this.findChildByName(root, "tasklist");
        this.gradeListNode = this.isGListNode(this.gradeListNode)
            ? this.gradeListNode
            : this.findChildByNameAndType(root, "grade", "GList");
        this.rewardListNode = this.rewardListNode || this.findNamedChildUnder(root, "reward", "reward");
        this.experienceText = this.experienceText || (this.findChildByName(root, "experience") as Laya.Text | null);
    }

    private getTasksForWeek(week: number): BattlePassTaskView[] {
        const baseTasks = [
            { prefix: "\u51fb\u6740", count: 20, suffix: "\u4e2a\u654c\u4eba" },
            { prefix: "\u91c7\u96c6", count: 30, suffix: "\u4e2a\u8d44\u6e90" },
            { prefix: "\u6253\u5f00", count: 5, suffix: "\u4e2a\u5bb9\u5668" },
            { prefix: "\u5236\u4f5c", count: 3, suffix: "\u4ef6\u7269\u54c1" },
            { prefix: "\u5b8c\u6210", count: 1, suffix: "\u6b21\u63a2\u7d22" },
            { prefix: "\u7b7e\u5230", count: 1, suffix: "\u5929" },
        ];
        const taskGroups = [
            { multiplier: 1, experience: 240 },
            { multiplier: 3, experience: 720 },
            { multiplier: 5, experience: 1200 },
        ];
        const tasks: BattlePassTaskView[] = [];

        for (let i = 0; i < taskGroups.length; i++) {
            const taskGroup = taskGroups[i];
            for (let j = 0; j < baseTasks.length; j++) {
                const task = baseTasks[j];
                const requiredProgress = task.count * taskGroup.multiplier;
                const currentProgress = 0;
                tasks.push({
                    title: `${task.prefix}${requiredProgress}${task.suffix}`,
                    currentProgress,
                    requiredProgress,
                    experience: taskGroup.experience,
                    completed: currentProgress >= requiredProgress,
                });
            }
        }

        return tasks;
    }

    private getRewards(): BattlePassRewardView[] {
        const rewardCycle: Array<Omit<BattlePassRewardView, "level" | "unlocked" | "claimed">> = [
            {
                name: "\u77f3\u5934",
                count: 20,
                icon: "atlas/picture/items/materials/basic_materials/shitou.png",
            },
            {
                name: "\u6728\u5934",
                count: 20,
                icon: "atlas/picture/items/materials/basic_materials/wood.png",
            },
            {
                name: "\u6d46\u679c",
                count: 20,
                icon: "atlas/picture/items/materials/food_materials/fruit.png",
            },
            {
                name: "\u8349",
                count: 20,
                icon: "atlas/picture/items/materials/basic_materials/grass.png",
            },
            {
                name: "\u68d2\u7403\u68cd",
                count: 1,
                icon: "atlas/picture/items/weapons/melees/baseket_bat.png",
            },
        ];
        const rewards: BattlePassRewardView[] = [];
        for (let level = 1; level <= 60; level++) {
            const reward = rewardCycle[(level - 1) % rewardCycle.length];
            rewards.push({
                level,
                name: reward.name,
                count: reward.count,
                icon: reward.icon,
                unlocked: false,
                claimed: false,
            });
        }
        return rewards;
    }

    private clampWeek(week: number): number {
        if (!Number.isFinite(week)) {
            return 1;
        }

        return Math.min(7, Math.max(1, Math.floor(week)));
    }

    private getTemplateNode(listNode: Laya.Node | null): Laya.Node | null {
        const list = listNode as any;
        return (list?._templateNode as Laya.Node | null)
            || (list?.templateNode as Laya.Node | null)
            || null;
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private findNamedChildUnder(root: Laya.Node | null, parentName: string, childName: string): Laya.Node | null {
        const parent = this.findChildByName(root, parentName);
        if (!parent) {
            return null;
        }

        const children = (parent as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child && (child as any).name === childName) {
                return child;
            }
        }

        return null;
    }

    private findDirectText(root: Laya.Node | null): Laya.Text | null {
        const children = root && Array.isArray((root as any).children)
            ? ((root as any).children as Laya.Node[])
            : [];

        for (let i = 0; i < children.length; i++) {
            const child = children[i] as any;
            if (child && child.constructor?.name === "Text") {
                return child as Laya.Text;
            }
        }

        return null;
    }

    private setFirstText(root: Laya.Node | null, text: string): void {
        const textNode = this.findChildByType(root, "Text") as Laya.Text | null;
        if (textNode) {
            textNode.text = text;
        }
    }

    private findChildByType(root: Laya.Node | null, typeName: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).constructor?.name === typeName || (root as any)._$type === typeName) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByType(children[i], typeName);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private findChildByNameAndType(root: Laya.Node | null, name: string, typeName: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name && this.isNodeType(root, typeName)) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByNameAndType(children[i], name, typeName);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private isGListNode(node: Laya.Node | null): boolean {
        return this.isNodeType(node, "GList");
    }

    private isNodeType(node: Laya.Node | null, typeName: string): boolean {
        return !!node && ((node as any).constructor?.name === typeName || (node as any)._$type === typeName);
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = visible;
        }
        if ("active" in target) {
            target.active = visible;
        }
    }

    private setNodeAlpha(node: Laya.Node | null, alpha: number): void {
        const target = node as any;
        if (target && "alpha" in target) {
            target.alpha = alpha;
        }
    }
}
