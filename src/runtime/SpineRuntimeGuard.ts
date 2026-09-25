declare const Laya: any;

const PATCH_FLAG = "__spineRuntimeGuardPatched";
const LOGGED_FLAG = "__spineRuntimeGuardLogged";
const GLOBAL_DUMP_NAME = "dumpSpineRuntimeDiagnostics";
const INSTALL_STATE_NAME = "__spineRuntimeGuardInstallState";

export function installSpineRuntimeGuard(attempt: number = 0): void {
    installGlobalDump();

    const spineCtor = Laya && Laya.Spine2DRenderNode;
    const proto = spineCtor && spineCtor.prototype;
    if (proto && proto[PATCH_FLAG]) {
        return;
    }

    if (!proto) {
        scheduleInstallRetry(attempt);
        return;
    }

    const originalUpdate = proto._update;
    const originalPlay = proto.play;
    const currentTimeDescriptor = findPropertyDescriptor(proto, "currentTime");

    if (currentTimeDescriptor && currentTimeDescriptor.get) {
        Object.defineProperty(proto, "currentTime", {
            configurable: true,
            enumerable: currentTimeDescriptor.enumerable,
            get: function (): number {
                if (!this._templet || !this._spineRender || !this._spineRender.trackEntry) {
                    return 0;
                }

                try {
                    return Number(currentTimeDescriptor.get!.call(this)) || 0;
                } catch (error) {
                    return 0;
                }
            },
            set: function (value: number): void {
                if (!this._templet || !this._spineRender || !currentTimeDescriptor.set) {
                    return;
                }

                currentTimeDescriptor.set.call(this, value);
            },
        });
    }

    if (typeof originalPlay === "function") {
        proto.play = function (
            animationName: string,
            loop?: boolean,
            trackIndexOrForce?: number | boolean,
            start?: number,
            end?: number
        ): void {
            const force = typeof trackIndexOrForce === "boolean" ? trackIndexOrForce : true;
            if (typeof trackIndexOrForce === "number") {
                this.trackIndex = Math.max(0, Math.floor(trackIndexOrForce || 0));
            }

            try {
                originalPlay.call(this, animationName, loop, force, start, end);
            } catch (error) {
                const message = error && (error as Error).message ? (error as Error).message : String(error);
                if (message.indexOf("currentTime") >= 0 || message.indexOf("trackEntry") >= 0) {
                    logSpineProblem("play", this, error);
                    this._needUpdate = false;
                    return;
                }

                throw error;
            }
        };
    }

    if (typeof originalUpdate === "function") {
        proto._update = function (): void {
            const render = this && this._spineRender;
            if (!this || !this._templet || !render) {
                return;
            }

            if (!render || !render.trackEntry) {
                logSpineProblem("update-missing-track", this);
                this._needUpdate = false;
                return;
            }

            try {
                originalUpdate.apply(this, arguments);
            } catch (error) {
                const message = error && (error as Error).message ? (error as Error).message : String(error);
                if (message.indexOf("currentTime") >= 0 || message.indexOf("trackEntry") >= 0) {
                    logSpineProblem("update", this, error);
                    this._needUpdate = false;
                    return;
                }

                throw error;
            }
        };
    }

    proto[PATCH_FLAG] = true;
    console.info("[SpineRuntimeGuard] installed", stringifyDetails({
        hasPlay: typeof originalPlay === "function",
        hasUpdate: typeof originalUpdate === "function",
        hasCurrentTime: !!currentTimeDescriptor,
    }));
}

function findPropertyDescriptor(proto: any, propertyName: string): PropertyDescriptor | undefined {
    let current = proto;
    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, propertyName);
        if (descriptor) {
            return descriptor;
        }

        current = Object.getPrototypeOf(current);
    }

    return undefined;
}

function installGlobalDump(): void {
    const scope = globalThis as any;
    if (typeof scope[GLOBAL_DUMP_NAME] === "function") {
        return;
    }

    scope[GLOBAL_DUMP_NAME] = (): any[] => {
        const spines = collectSpineStates();
        console.group(`[SpineRuntimeGuard] spine count=${spines.length}`);
        for (let i = 0; i < spines.length; i++) {
            console.log(`[SpineRuntimeGuard] spine[${i}]`, stringifyDetails(spines[i]));
        }
        console.groupEnd();
        return spines;
    };
}

function scheduleInstallRetry(attempt: number): void {
    const scope = globalThis as any;
    const state = scope[INSTALL_STATE_NAME] || { scheduled: false };
    scope[INSTALL_STATE_NAME] = state;
    if (state.scheduled || attempt >= 120) {
        return;
    }

    state.scheduled = true;
    const retry = (): void => {
        state.scheduled = false;
        installSpineRuntimeGuard(attempt + 1);
    };

    try {
        if (Laya && typeof Laya.addAfterInitCallback === "function") {
            Laya.addAfterInitCallback(retry);
        }
    } catch (error) {
    }

    try {
        if (Laya && Laya.timer && typeof Laya.timer.once === "function") {
            Laya.timer.once(50, null, retry);
            return;
        }
    } catch (error) {
    }

    setTimeout(retry, 50);
}

function logSpineProblem(reason: string, spineComponent: any, error?: unknown): void {
    if (!spineComponent || spineComponent[LOGGED_FLAG]) {
        return;
    }

    spineComponent[LOGGED_FLAG] = true;
    const details = {
        reason,
        spine: describeSpineComponent(spineComponent),
        error: formatError(error),
    };
    const spine = details.spine as Record<string, unknown>;
    console.warn(
        `[SpineRuntimeGuard] blocked reason=${reason} node=${String(spine.nodePath || "")} anim=${String(spine.animationName || "")} source=${String(spine.source || "")}`,
        stringifyDetails(details),
    );
}

function collectSpineStates(): any[] {
    const result: any[] = [];
    const stage = Laya && Laya.stage;
    if (!stage) {
        return result;
    }

    const stack = [stage];
    while (stack.length > 0) {
        const node = stack.pop();
        if (!node) {
            continue;
        }

        const spine = typeof node.getComponent === "function" && Laya.Spine2DRenderNode
            ? node.getComponent(Laya.Spine2DRenderNode)
            : null;
        if (spine) {
            result.push(describeSpineComponent(spine));
        }

        const children = node._children || node.children || [];
        for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
        }
    }

    return result;
}

function describeSpineComponent(spineComponent: any): Record<string, unknown> {
    const render = spineComponent?._spineRender;
    const owner = spineComponent?.owner;
    return {
        nodePath: getNodePath(owner),
        nodeName: owner?.name || null,
        nodeUrl: owner?.url || null,
        source: spineComponent?._source || spineComponent?.source || null,
        skinName: spineComponent?._skinName || spineComponent?.skinName || null,
        animationName: spineComponent?._animationName || spineComponent?.animationName || null,
        loop: spineComponent?._loop,
        pause: spineComponent?._pause,
        needUpdate: spineComponent?._needUpdate,
        trackIndex: spineComponent?.trackIndex,
        hasTemplet: !!spineComponent?._templet,
        hasSpineRender: !!render,
        hasTrackEntry: !!render?.trackEntry,
        renderCurrentTime: safeReadNumber(render, "currentTime"),
        trackAnimationName: render?.trackEntry?.animation?.name || null,
        trackAnimationDuration: render?.trackEntry?.animation?.duration ?? null,
    };
}

function getNodePath(node: any): string {
    const names: string[] = [];
    let current = node;
    while (current) {
        names.push(String(current.name || current.url || current.constructor?.name || "(unnamed)"));
        current = current.parent;
    }
    return names.reverse().join("/");
}

function safeReadNumber(target: any, propertyName: string): number | null {
    if (!target) {
        return null;
    }

    try {
        const value = target[propertyName];
        return typeof value === "number" ? value : null;
    } catch (error) {
        return null;
    }
}

function formatError(error: unknown): string | null {
    if (!error) {
        return null;
    }

    if (error instanceof Error) {
        return error.stack || error.message;
    }

    return String(error);
}

function stringifyDetails(details: unknown): string {
    try {
        return JSON.stringify(details);
    } catch (error) {
        return String(details);
    }
}
