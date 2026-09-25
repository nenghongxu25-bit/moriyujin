/** Animate the already-composited night layer, without rebuilding its bitmap. */
export class LightningFlash {
    private remaining = -1;
    private elapsed = -1;
    private baseAlpha = 1;
    private duration = 0.5;
    private strength = 0.88;
    private pattern = -1;

    public update(layer: Laya.Sprite, deltaSeconds: number, enabled: boolean,
        intensity: number, durationSeconds: number, minInterval: number, maxInterval: number): void {
        if (!enabled || !layer.visible) {
            this.reset(layer);
            return;
        }
        const dt = Math.min(0.1, Math.max(0, deltaSeconds));
        if (this.elapsed < 0) {
            if (this.remaining < 0) {
                const low = Math.max(1, minInterval);
                this.remaining = low + Math.random() * Math.max(0, maxInterval - low);
            }
            this.remaining -= dt;
            if (this.remaining > 0) return;
            this.baseAlpha = layer.alpha;
            const choice = Math.floor(Math.random() * (this.pattern < 0 ? 4 : 3));
            this.pattern = this.pattern < 0 ? choice : choice >= this.pattern ? choice + 1 : choice;
            this.duration = Math.max(0.15, durationSeconds) * (0.9 + Math.random() * 0.2);
            this.strength = Math.max(0, Math.min(1, intensity * (0.9 + Math.random() * 0.15)));
            this.elapsed = 0;
        }
        this.elapsed += dt;
        const total = this.pattern === 0 ? this.duration
            : this.pattern === 1 ? this.duration * 1.5
            : this.pattern === 2 ? this.duration * 1.52 + 1
            : this.duration * 2.6;
        if (this.elapsed >= total) {
            layer.alpha = this.baseAlpha;
            this.elapsed = this.remaining = -1;
            return;
        }
        const amount = this.brightness(total);
        layer.alpha = this.baseAlpha * (1 - amount * this.strength);
    }

    private brightness(total: number): number {
        const age = this.elapsed;
        const d = this.duration;
        if (this.pattern === 0) return this.pulse(age, d);
        if (this.pattern === 1) return Math.max(
            0.3 * this.pulse(age, d * 0.24),
            this.pulse(age - d * 0.3, d * 1.2),
        );
        if (this.pattern === 2) {
            // The one-second dark pause stays fixed despite pulse timing variation.
            const firstFlashEnd = d * 0.32;
            const burstAge = age - firstFlashEnd - 1;
            return Math.max(
                0.55 * this.pulse(age, firstFlashEnd),
                0.85 * this.pulse(burstAge, d * 0.5),
                0.7 * this.pulse(burstAge - d * 0.2, d * 0.5),
                this.pulse(burstAge - d * 0.4, d * 0.8),
            );
        }
        // Cloud illumination: a low, smoothly undulating glow without sharp peaks.
        const t = age / total;
        const envelope = Math.sin(Math.PI * t);
        return envelope * envelope * (0.32 + 0.09 * Math.sin(t * Math.PI * 6));
    }

    private pulse(age: number, length: number): number {
        if (age < 0 || age >= length) return 0;
        const rise = Math.min(0.012, length * 0.1);
        const holdEnd = Math.min(0.035, length * 0.25);
        if (age < rise) return age / rise;
        if (age < holdEnd) return 1;
        const fade = (age - holdEnd) / (length - holdEnd);
        return (1 - fade) * (1 - fade);
    }

    public reset(layer: Laya.Sprite): void {
        if (this.elapsed >= 0 && !layer.destroyed) layer.alpha = this.baseAlpha;
        this.elapsed = this.remaining = -1;
    }
}
