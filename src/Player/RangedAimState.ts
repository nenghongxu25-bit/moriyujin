/** Camera intent shared without coupling camera lifecycle to the attack UI. */
export class RangedAimState {
    static active = false;
    static x = 1;
    static y = 0;
    static amount = 0;
    static cameraOffsetX = 0;
    static cameraOffsetY = 0;
    static reset(): void { this.active = false; this.amount = 0; }
}
