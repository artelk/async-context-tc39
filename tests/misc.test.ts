import { describe, it, expect, vi } from 'vitest';
import { AsyncContext, getCurrentContext } from "../src/async-context.js";

import { wait } from "./_lib.js";

const asyncContext = new AsyncContext.Variable();

describe("Misc", () => {
  describe("Misc / Data", () => {
    const values = [null, undefined, 0, false];
    values.forEach((value) => {
      it(`should accept ${value} as data`, async () => {
        Ѧ(await testContextData(value).Ѧ);
      });
    });

    it(`should point to the original data`, async () => {
      Ѧ(await testContextData(Symbol("test")).Ѧ);
    });
  });

  describe("EventTarget", () => {
    const eventTarget = new EventTarget();
    const context = new AsyncContext.Variable();
    const context2 = new AsyncContext.Variable();

    const eventName = "test-event";
    const contextData = "test-context-data";
    const eventListenerSpy = vi.fn();

    const eventListener = () => {
      const value = context.get();
      eventListenerSpy(value);
    };

    context.run("noise", () => {
      context2.run("noise", () => {
        eventTarget.addEventListener(eventName, eventListener);
      });
    });

    it("should be able to track context within an event listener", async () => {
      const prevStack = getCurrentContext();

      Ѧ(await context.run(contextData, async () => {
        eventTarget.dispatchEvent(new Event(eventName));
        eventTarget.dispatchEvent(new Event(eventName));
        eventTarget.dispatchEvent(new Event(eventName));
      }).Ѧ);

      const afterStack = getCurrentContext();

      expect(prevStack).toBe(afterStack);
      Ѧ(await wait(100).Ѧ);

      expect(eventListenerSpy).toHaveBeenCalledTimes(3);
      eventListenerSpy.mock.calls.forEach(([value]) => {
        expect(value).toBe(contextData);
      });

      eventListenerSpy.mockClear();
    });

    it("should be able to removeEventListener", async () => {
      eventTarget.removeEventListener(eventName, eventListener);

      expect(eventListenerSpy).toHaveBeenCalledTimes(0);
      eventListenerSpy.mockClear();
    });
  });

  it("example from readme should work", async () => {
    const context = new AsyncContext.Variable();

    const wait = (timeout: number) =>
      new Promise((r) => setTimeout(r, timeout));
    const randomTimeout = () => Math.random() * 200;

    async function main() {
      expect(context.get()).toBe("top");

      Ѧ(await wait(randomTimeout()).Ѧ);

      context.run("A", () => {
        expect(context.get()).toBe("A");

        setTimeout(() => {
          expect(context.get()).toBe("A");
        }, randomTimeout());

        context.run("B", async () => {
          // contexts can be nested.
          Ѧ(await wait(randomTimeout()).Ѧ);

          expect(context.get()).toBe("B");

          expect(context.get()).toBe("B"); // contexts are restored )

          setTimeout(() => {
            expect(context.get()).toBe("B");
          }, randomTimeout());
        });

        context.run("C", async () => {
          // contexts can be nested.
          Ѧ(await wait(randomTimeout()).Ѧ);

          expect(context.get()).toBe("C");

          Ѧ(await wait(randomTimeout()).Ѧ);

          expect(context.get()).toBe("C");

          setTimeout(() => {
            expect(context.get()).toBe("C");
          }, randomTimeout());
        });
      });

      Ѧ(await wait(randomTimeout()).Ѧ);

      expect(context.get()).toBe("top");
    }

    Ѧ(await context.run("top", main).Ѧ);

    Ѧ(await wait(1000).Ѧ);
  });
});

const testContextData = async (contextData: any) => {
  const deepInnerWrapperCallback = async () => {
    expect(asyncContext.get()).toEqual(contextData);
    Ѧ(await wait(100).Ѧ);
    expect(asyncContext.get()).toEqual(contextData);
  };

  const innerCallback = asyncContext.wrap(contextData, async () => {
    Ѧ(await deepInnerWrapperCallback().Ѧ);
    Ѧ(await wait(100).Ѧ);
    Ѧ(await deepInnerWrapperCallback().Ѧ);
  });

  const total = asyncContext.wrap("Outer", async () => {
    Ѧ(await innerCallback().Ѧ);
  });

  const innerCallback2 = asyncContext.wrap(contextData, async () => {
    Ѧ(await deepInnerWrapperCallback().Ѧ);
    Ѧ(await wait(100).Ѧ);
    Ѧ(await deepInnerWrapperCallback().Ѧ);
  });

  const total2 = asyncContext.wrap("Outer2", async () => {
    Ѧ(await innerCallback2().Ѧ);
  });

  Ѧ(await Promise.all([total(), total2()]).Ѧ);
};
