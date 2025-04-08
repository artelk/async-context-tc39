import { AsyncContext, getCurrentContext, setCurrentContext, emptyContext, Context } from "./async-context.js";

const { Snapshot } = AsyncContext;

declare global {
    interface Promise<T> {
        get Ѧ(): Promise<RequireѦ<T>>;
    }

    interface PromiseLike<T> {
        get Ѧ(): Promise<RequireѦ<T>>;
    }

    /**
     * Wrap the expression in Ѧ(...)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type RequireѦ<T> = object

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Ѧ<T>(v: T extends Promise<any> ? never : T): T extends RequireѦ<infer U> ? U : T;
}

export const originals = {
    setTimeout: globalThis.setTimeout,
    setInterval: globalThis.setTimeout,
    setImmediate: globalThis.setImmediate,
    queueMicrotask: globalThis.queueMicrotask,
    then: globalThis.Promise.prototype.then,
};

let patched = false;

export function patch() {
    if (patched) return;
    patched = true;

    // queueMicrotask
    (() => {
        const origQueueMicrotask = globalThis.queueMicrotask;
        globalThis.queueMicrotask = (callback: () => void): void => {
            return origQueueMicrotask(Snapshot.wrap(callback));
        }
    })();

    // setTimeout
    (() => {
        const origSetTimeout = globalThis.setTimeout;

        function setTimeout(handler: TimerHandler, timeout?: number, ...args: unknown[]): ReturnType<typeof origSetTimeout> {
            if (typeof handler === 'string' || handler instanceof String) {
                return origSetTimeout(handler, timeout, ...args) as unknown as ReturnType<typeof origSetTimeout>;
            }

            const wrappedHandler = Snapshot.wrap(handler as (this: unknown, ...args: unknown[]) => unknown);
            return origSetTimeout(wrappedHandler, timeout, ...args);
        }

        Object.assign(setTimeout, origSetTimeout);
        globalThis.setTimeout = setTimeout as unknown as typeof globalThis.setTimeout;
    })();

    // setInterval
    (() => {
        const origSetInterval = globalThis.setInterval;

        function setInterval(handler: TimerHandler, timeout?: number, ...args: unknown[]): ReturnType<typeof origSetInterval> {
            if (typeof handler === 'string' || handler instanceof String) {
                return origSetInterval(handler, timeout, ...args) as unknown as ReturnType<typeof origSetInterval>;
            }

            const wrappedHandler = Snapshot.wrap(handler as (this: unknown, ...args: unknown[]) => unknown);
            return origSetInterval(wrappedHandler, timeout, ...args);

        };

        Object.assign(setInterval, origSetInterval);
        globalThis.setInterval = setInterval as unknown as typeof globalThis.setInterval;
    })();

    // setImmediate
    (() => {
        const origSetImmediate = globalThis.setImmediate;
        if (!origSetImmediate)
            return;

        function setImmediate<TArgs extends unknown[]>(callback: (...args: TArgs) => void, ...args: TArgs): ReturnType<typeof origSetImmediate> {
            const wrappedCallback = Snapshot.wrap(callback);
            return origSetImmediate(wrappedCallback, ...args);
        };

        Object.assign(setImmediate, origSetImmediate);
        globalThis.setImmediate = setImmediate as unknown as typeof globalThis.setImmediate;
    })();

    // Promise
    (() => {
        const origThen = globalThis.Promise.prototype.then;

        globalThis.Promise.prototype.then = function <T>(
            this: Promise<T>,
            onfulfilled?: Parameters<typeof origThen>[0],
            onrejected?: Parameters<typeof origThen>[1]
        ): Promise<T> {
            const capturedContext = getCurrentContext();
            if (capturedContext !== emptyContext) {
                if (onfulfilled) {
                    const orig_onfulfilled = onfulfilled;
                    onfulfilled = (value: unknown) => {
                        setCurrentContext(capturedContext);
                        try {
                            return orig_onfulfilled(value);
                        }
                        finally {
                            setCurrentContext(emptyContext);
                        }
                    };
                }

                if (onrejected) {
                    const orig_onrejected = onrejected;
                    onrejected = (reason: unknown) => {
                        setCurrentContext(capturedContext);
                        try {
                            return orig_onrejected(reason);
                        }
                        finally {
                            setCurrentContext(emptyContext);
                        }
                    };
                }
            }

            return origThen.call(this, onfulfilled, onrejected) as Promise<T>;
        }
    })();

    // Ѧ
    (() => {
        const runOnFreshMicrotaskQueue = (() => {
            const taskQueue: (() => void)[] = [];

            function executeTasks() {
                for (let i = 0; i < taskQueue.length; i++) {
                    try {
                        taskQueue[i]();
                    } catch (error) {
                        console.error(error);
                    }
                }
                taskQueue.length = 0;
            }

            const origSetImmediate = originals.setImmediate;
            const scheduleExecutorMacrotask = origSetImmediate
                ? () => origSetImmediate(executeTasks)
                : (() => {
                    const mc = new MessageChannel();
                    mc.port1.onmessage = executeTasks;
                    return () => { mc.port2.postMessage(null); }
                })();

            return function (callback: () => void) {
                if (taskQueue.length == 0) {
                    scheduleExecutorMacrotask();
                }
                taskQueue.push(callback);
            }
        })();

        const setCurrentContextAndScheduleReset = (() => {
            const origQueueMicrotask = originals.queueMicrotask;

            function resetCurrentContext() {
                setCurrentContext(emptyContext)
            }

            return (context: Context) => {
                if (getCurrentContext() === emptyContext && context !== emptyContext)
                    origQueueMicrotask(resetCurrentContext);
                setCurrentContext(context);
            };
        })();

        class RejectReasonHolder {
            reason: unknown;
            constructor(reason: unknown) {
                this.reason = reason;
            }
        }

        Object.defineProperty(Object.prototype, 'Ѧ', {
            configurable: true,
            enumerable: false,
            get() {
                const thisPromise = typeof this?.then === 'function'
                    ? this as Promise<unknown>
                    : Promise.resolve(this);

                const currentContext = getCurrentContext();
                if (currentContext === emptyContext) {
                    return thisPromise.then(undefined, (reason) => new RejectReasonHolder(reason));
                }

                try {
                    setCurrentContext(emptyContext); // optimization: no need to capture the context in 'then'

                    let resolve: (value: unknown) => void;
                    const promise = new Promise<unknown>((r) => { resolve = r; });

                    // the trick with runOnFreshMicrotaskQueue is needed because the resetCurrentContext microtask
                    // should be scheduled to run right after the microtask(s) that calls the setCurrentContextAndScheduleReset
                    // but which doesn't reset the context (the Ѧ-function below)
                    thisPromise.then(
                        (value: unknown) => runOnFreshMicrotaskQueue(() => resolve(value)),
                        (reason: unknown) => runOnFreshMicrotaskQueue(() => resolve(new RejectReasonHolder(reason)))
                    );

                    return promise;
                } finally {
                    setCurrentContext(currentContext);
                }
            },
        });

        Object.defineProperty(globalThis, 'Ѧ',
            {
                enumerable: true,
                configurable: true,
                get() { // note: getter returning the function
                    const capturedContext = getCurrentContext(); // capture before the await
                    return (awaitResult: unknown) => {
                        setCurrentContextAndScheduleReset(capturedContext);
                        if (awaitResult instanceof RejectReasonHolder) {
                            throw awaitResult.reason;
                        }
                        return awaitResult;
                    };
                },
            });
    })();
}