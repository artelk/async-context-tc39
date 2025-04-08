import { describe, it, expect } from 'vitest';
import { AsyncContext, originals } from 'async-context-tc39';

const {
    queueMicrotask: origQueueMicrotask
} = originals;

const asyncContext = new AsyncContext.Variable();

describe("Parallel", () => {
    it("run in parallel - should have expected context", () => {
        for (let i = 0; i < 5; i++) {
            const value = i;
            asyncContext.run(value, () => {
                for (let j = 0; j < 4; j++) {
                    const b = (i + j) % 2 == 0;
                    (async () => {
                        Ѧ(await new Promise((r) => origQueueMicrotask(() => r(null))).Ѧ);
                        expect(asyncContext.get()).toBe(value);

                        if (b) {
                            Ѧ(await new Promise((r) => origQueueMicrotask(() => r(null))).Ѧ);
                            expect(asyncContext.get()).toBe(value);
                        }
                    })();
                }

                expect(asyncContext.get()).toBe(value);
            });
        }
    });

    it("native promises running in parallel - should have empty context", () => {
        let n = 10;
        function nativePromisesProcessSimulation() {
            expect(asyncContext.get()).toBe(undefined);
            if (--n > 0) {
                origQueueMicrotask(nativePromisesProcessSimulation);
            }
        }
        origQueueMicrotask(nativePromisesProcessSimulation);

        asyncContext.run(1, () => {
            (async () => {
                Ѧ(await new Promise((r) => origQueueMicrotask(() => r(null))).Ѧ);
                expect(asyncContext.get()).toBe(1);
            })();
        });
    });

});