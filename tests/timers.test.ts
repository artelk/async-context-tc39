import { describe, it, expect } from 'vitest';
import { AsyncContext } from 'async-context-tc39';
import { wait } from "./_lib.js";

const asyncContext = new AsyncContext.Variable();

describe("AsyncContext / setTimeout", () => {
  it("should not infere with timers", async () => {
    const before = Date.now();
    Ѧ(await new Promise((resolve) => setTimeout(resolve, 100)).Ѧ);
    const after = Date.now();
    const timeSpent = after - before;
    expect(timeSpent).toBeGreaterThanOrEqual(100);
  });

  it("timer (scenario 1): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", async () => {
      setTimeout(() => expect(asyncContext.get()).toBe("Inner"), 0);
      setTimeout(() => expect(asyncContext.get()).toBe("Inner"), 10);
      setTimeout(() => expect(asyncContext.get()).toBe("Inner"), 150);
      Ѧ(await wait(100).Ѧ);
      setTimeout(() => expect(asyncContext.get()).toBe("Inner"), 0);
      setTimeout(() => expect(asyncContext.get()).toBe("Inner"), 100);
    });

    const total = asyncContext.wrap("Outer", async () => {
      setTimeout(() => expect(asyncContext.get()).toBe("Outer"), 0);
      setTimeout(() => expect(asyncContext.get()).toBe("Outer"), 10);
      setTimeout(() => expect(asyncContext.get()).toBe("Outer"), 150);
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = Ѧ(await innerCallback().Ѧ);

      setTimeout(() => expect(asyncContext.get()).toBe("Outer"), 0);
      setTimeout(() => expect(asyncContext.get()).toBe("Outer"), 100);
      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    Ѧ(await total().Ѧ);
    Ѧ(await wait(1000).Ѧ);
  });

  it("timer (scenario 2): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", async () => {
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Inner");
        }, 0);
      }, 0);
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Inner");
        }, 10);
      }, 150);

      Ѧ(await wait(100).Ѧ);

      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Inner");
        }, 10);
      }, 150);

      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Inner");
        }, 0);
      }, 0);
    });

    const total = asyncContext.wrap("Outer", async () => {
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Outer");
        }, 0);
      }, 0);
      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Outer");
        }, 10);
      }, 150);
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = Ѧ(await innerCallback().Ѧ);

      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Outer");
        }, 10);
      }, 150);

      setTimeout(() => {
        setTimeout(() => {
          expect(asyncContext.get()).toBe("Outer");
        }, 0);
      }, 0);
      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    Ѧ(await total().Ѧ);
    Ѧ(await wait(1000).Ѧ);
  });

  it("timer (scenario 3): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", async () => {
      setTimeout(async () => expect(asyncContext.get()).toBe("Inner"), 0);
      setTimeout(async () => {
        Ѧ(await wait(200).Ѧ);
        expect(asyncContext.get()).toBe("Inner");
      }, 10);
      setTimeout(async () => {
        Ѧ(await wait(100).Ѧ);
        expect(asyncContext.get()).toBe("Inner");
      }, 150);

      Ѧ(await wait(100).Ѧ);

      setTimeout(async () => expect(asyncContext.get()).toBe("Inner"), 0);
      setTimeout(async () => {
        Ѧ(await wait(200).Ѧ);
        expect(asyncContext.get()).toBe("Inner");
      }, 10);
    });

    const total = asyncContext.wrap("Outer", async () => {
      setTimeout(async () => expect(asyncContext.get()).toBe("Outer"), 0);
      setTimeout(async () => {
        Ѧ(await wait(200).Ѧ);
        expect(asyncContext.get()).toBe("Outer");
      }, 10);
      setTimeout(async () => {
        Ѧ(await wait(100).Ѧ);
        expect(asyncContext.get()).toBe("Outer");
      }, 150);
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = Ѧ(await innerCallback().Ѧ);

      setTimeout(async () => expect(asyncContext.get()).toBe("Outer"), 0);
      setTimeout(async () => {
        Ѧ(await wait(200).Ѧ);
        expect(asyncContext.get()).toBe("Outer");
      }, 10);
      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    Ѧ(await total().Ѧ);
    Ѧ(await wait(1000).Ѧ);
  });
});
