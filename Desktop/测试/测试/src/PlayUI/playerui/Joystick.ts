const { regClass, property } = Laya;

@regClass()
export class Joystick extends Laya.Script {

    public static instance: Joystick | null = null;

    @property(Laya.Sprite)
    public joystickBase: Laya.Sprite | null = null;

    @property(Laya.Sprite)
    public joystickHandle: Laya.Sprite | null = null;

    @property(Number)
    public radius: number = 60;

    @property(Number)
    public activationThreshold: number = 20;

    public valueX: number = 0;
    public valueY: number = 0;

    private centerX: number = 0;
    private centerY: number = 0;

    private handleStartX: number = 0;
    private handleStartY: number = 0;

    private dragging: boolean = false;
    private activePointerId: number = -1;
    private inputActive: boolean = false;


    onAwake(): void {

        Joystick.instance = this;

        if (!this.joystickBase || !this.joystickHandle) {
            return;
        }

        this.centerX = this.joystickBase.width / 2;
        this.centerY = this.joystickBase.height / 2;

        this.handleStartX = this.joystickHandle.x;
        this.handleStartY = this.joystickHandle.y;

        this.joystickHandle.pos(
            this.handleStartX,
            this.handleStartY
        );

        this.joystickBase.on(
            "mousedown",
            this,
            this.onJoystickDown
        );

        this.joystickBase.on(
            "touchstart",
            this,
            this.onJoystickDown
        );
    }


    onEnable(): void {
        Joystick.instance = this;
    }


    onDisable(): void {

        this.dragging = false;

        this.resetJoystick();

        Laya.stage.offAllCaller(this);
    }


    onDestroy(): void {

        if (Joystick.instance === this) {
            Joystick.instance = null;
        }

        if (this.joystickBase) {
            this.joystickBase.offAllCaller(this);
        }

        Laya.stage.offAllCaller(this);
    }


    private getPointerId(e: any): number {

        const pointerId =
            e && typeof e.touchId === "number"
                ? e.touchId
                : -1;

        return pointerId;
    }


    private onJoystickDown(e: any): void {

        this.activePointerId = this.getPointerId(e);

        this.dragging = true;

        Laya.stage.on(
            "mousemove",
            this,
            this.onJoystickMove
        );

        Laya.stage.on(
            "mouseup",
            this,
            this.onJoystickUp
        );

        Laya.stage.on(
            "mouseout",
            this,
            this.onJoystickUp
        );

        Laya.stage.on(
            "touchmove",
            this,
            this.onJoystickMove
        );

        Laya.stage.on(
            "touchend",
            this,
            this.onJoystickUp
        );

        this.onJoystickMove(e);
    }


    private onJoystickMove(e: any): void {

        if (
            !this.dragging ||
            !this.joystickBase ||
            !this.joystickHandle
        ) {
            return;
        }

        const pointerId = this.getPointerId(e);

        if (
            this.activePointerId !== -1 &&
            pointerId !== -1 &&
            pointerId !== this.activePointerId
        ) {
            return;
        }

        const stageMouseX = Laya.stage.mouseX;
        const stageMouseY = Laya.stage.mouseY;

        const stageTouchX = (Laya.stage as any).touchX;
        const stageTouchY = (Laya.stage as any).touchY;

        const mouseX =
            typeof stageMouseX === "number"
                ? stageMouseX
                : stageTouchX;

        const mouseY =
            typeof stageMouseY === "number"
                ? stageMouseY
                : stageTouchY;

        const localPoint =
            this.joystickBase.globalToLocal(
                new Laya.Point(mouseX, mouseY)
            );

        let offsetX =
            localPoint.x - this.centerX;

        let offsetY =
            localPoint.y - this.centerY;

        const distance =
            Math.sqrt(
                offsetX * offsetX +
                offsetY * offsetY
            );

        const threshold =
            Math.max(
                0,
                Math.min(
                    this.radius,
                    this.activationThreshold
                )
            );

        const releaseThreshold =
            Math.max(
                0,
                threshold * 0.7
            );

        const hasReachedThreshold =
            this.inputActive
                ? distance >= releaseThreshold
                : distance >= threshold;

        this.inputActive = hasReachedThreshold;


        // 限制摇杆最大移动距离
        if (distance > this.radius) {

            offsetX =
                (offsetX / distance) *
                this.radius;

            offsetY =
                (offsetY / distance) *
                this.radius;
        }


        // 移动摇杆手柄
        this.joystickHandle.pos(
            this.handleStartX + offsetX,
            this.handleStartY + offsetY
        );


        // 输出方向
        if (hasReachedThreshold) {

            const normalizedDistance =
                distance > this.radius
                    ? this.radius
                    : distance;

            this.valueX =
                offsetX /
                normalizedDistance;

            this.valueY =
                offsetY /
                normalizedDistance;

        } else {

            this.valueX = 0;
            this.valueY = 0;
        }
    }


    private onJoystickUp(e: any): void {

        const pointerId =
            this.getPointerId(e);

        if (
            this.activePointerId !== -1 &&
            pointerId !== -1 &&
            pointerId !== this.activePointerId
        ) {
            return;
        }

        this.dragging = false;
        this.activePointerId = -1;

        Laya.stage.off(
            "mousemove",
            this,
            this.onJoystickMove
        );

        Laya.stage.off(
            "mouseup",
            this,
            this.onJoystickUp
        );

        Laya.stage.off(
            "mouseout",
            this,
            this.onJoystickUp
        );

        Laya.stage.off(
            "touchmove",
            this,
            this.onJoystickMove
        );

        Laya.stage.off(
            "touchend",
            this,
            this.onJoystickUp
        );

        this.resetJoystick();
    }


    private resetJoystick(): void {

        this.valueX = 0;
        this.valueY = 0;

        this.inputActive = false;

        if (this.joystickHandle) {

            this.joystickHandle.pos(
                this.handleStartX,
                this.handleStartY
            );
        }
    }
}