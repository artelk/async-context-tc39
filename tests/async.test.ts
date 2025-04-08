import { describe, it, expect } from 'vitest';
import { AsyncContext } from 'async-context-tc39';
import { wait } from "./_lib.js";

const asyncContext = new AsyncContext.Variable<string>();

describe("SimpleAsyncContext / Async", () => {
  it("async (scenario 1): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", () => {
      expect(asyncContext.get()).toBe("Inner");
      return "INNER";
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value}`;
    });

    expect(asyncContext.get()).toBe(undefined)
    Ѧ(await expect(total()).resolves.toBe("OUTER INNER").Ѧ);
  });

  it("async (scenario 2): should know in which context it is", async () => {
    Ѧ(await asyncContext.run("Outer", async () => {
      // captureAsyncContexts().forEach((ctx, i) => ctx.index = i);

      // console.log(captureAsyncContexts().map((ctx, i) => ctx.index));
      expect(asyncContext.get()).toBe("Outer");
      // console.log(captureAsyncContexts().map((ctx, i) => ctx.index));
      Ѧ(await wait(30).Ѧ);

      // console.log(captureAsyncContexts().map((ctx, i) => ctx.index));
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER`;
    }).Ѧ);
  });

  it("async (scenario 2/throw): should know in which context it is", async () => {
    let thrown = false;
    Ѧ(await asyncContext.run("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      try {
        Ѧ(await wait(30).then(() => { throw "Error" }).Ѧ);
      } catch (error) {
        thrown = true;
        expect(error).toBe("Error");
        expect(asyncContext.get()).toBe("Outer");
      }
      return `OUTER`;
    }).Ѧ);
    expect(thrown).toBe(true);
  });

  it("async (scenario 3): should know in which context it is", async () => {
    const total = asyncContext.wrap("Outer", async () => {
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await wait(30).Ѧ);
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await wait(30).Ѧ);
      // console.log(SimpleAsyncContext.getId());
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER`;
    });

    const value = Ѧ(await total().Ѧ);
    expect(value).toBe("OUTER");
  });

  it("async (scenario 4): should know in which context it is", async () => {
    const innerCallback = async () => {
      // console.log('\t -> Inner Content', SimpleAsyncContext.getStackId());
      expect(asyncContext.get()).toBe("Outer");
      return "INNER";
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      // console.log('Outer Start')

      // console.log('\t -> Inner Start', SimpleAsyncContext.getStackId());
      const value = Ѧ(await innerCallback().Ѧ);

      // console.log('\t -> Inner End', SimpleAsyncContext.getStackId());

      expect(asyncContext.get()).toBe("Outer");
      // console.log('Outer End');
      return `OUTER ${value}`;
    });

    expect(asyncContext.get()).toBe(undefined);

    // console.log('\t -> Before All', SimpleAsyncContext.getStackId());
    const value = Ѧ(await total().Ѧ);

    expect(asyncContext.get()).toBe(undefined);

    // console.log('\t -> After All', SimpleAsyncContext.getStackId());
    expect(value).toBe("OUTER INNER");
  });

  it("async (scenario 5): should know in which context it is", async () => {
    const innerCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await wait(10).Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return "INNER";
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    Ѧ(await total().Ѧ);
    expect(asyncContext.get()).toBe(undefined);
    // expect(value).toBe('OUTER INNER INNER INNER');
  });

  it("async (scenario 6): should know in which context it is", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");
      return "DEEP";
    };

    const innerCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");

      const value = Ѧ(await deepCallback().Ѧ);

      expect(asyncContext.get()).toBe("Outer");

      return `INNER ${value}`;
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    Ѧ(await total().Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 7): should know in which context it is", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");

      Ѧ(await wait(30).Ѧ);

      expect(asyncContext.get()).toBe("Outer");

      return "DEEP";
    };

    const innerCallback = async () => {
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Outer");

      const value = Ѧ(await deepCallback().Ѧ);

      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await wait(30).Ѧ);

      expect(asyncContext.get()).toBe("Outer");

      return `INNER ${value}`;
    };

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    Ѧ(await total().Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 8): should know in which context it is", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      return "DEEP";
    };

    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      const value = Ѧ(await deepCallback().Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      return `INNER ${value}`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    Ѧ(await total().Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 8/run): should know in which context it is", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      return "DEEP";
    };

    const innerCallback = () => asyncContext.run("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      const value = Ѧ(await deepCallback().Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      return `INNER ${value}`;
    });

    const total = () => asyncContext.run("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value} ${value2} ${value3}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    Ѧ(await total().Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9): should know in which context it is", async () => {
    // const debugAsync = createAsyncDebugger('global');
    const track1 = asyncContext.wrap("track1", async () => {
      // debugAsync.debug('track1.1');

      expect(asyncContext.get()).toBe("track1");
      Ѧ(await wait(30).Ѧ);

      // debugAsync.debug('track1.2');
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      // debugAsync.debug('track2.1');
      expect(asyncContext.get()).toBe("track2");
      Ѧ(await wait(30).Ѧ);

      // debugAsync.debug('track2.2');
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    track1();
    track2();

    Ѧ(await wait(100).Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9/bis): should know in which context it is", async () => {
    const track1 = asyncContext.wrap("track1", async () => {
      expect(asyncContext.get()).toBe("track1");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      expect(asyncContext.get()).toBe("track2");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    track1();
    Ѧ(await wait(30).Ѧ);
    track2();

    Ѧ(await wait(100).Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9/bis/bis): should know in which context it is", async () => {
    const track1 = asyncContext.wrap("track1", async () => {
      expect(asyncContext.get()).toBe("track1");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      expect(asyncContext.get()).toBe("track2");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    track1().then(() => {
      expect(asyncContext.get()).toBe(undefined);
    });

    Ѧ(await wait(30).Ѧ);
    track2().then(() => {
      expect(asyncContext.get()).toBe(undefined);
    });

    Ѧ(await wait(100).Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 9/bis/bis/bis): should know in which context it is", async () => {
    const track1 = asyncContext.wrap("track1", async () => {
      expect(asyncContext.get()).toBe("track1");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("track1");
    });

    const track2 = asyncContext.wrap("track2", async () => {
      expect(asyncContext.get()).toBe("track2");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("track2");
    });

    expect(asyncContext.get()).toBe(undefined);

    let trackedAsyncData: any = {};
    asyncContext.run('Random Wrap', async () => {
      track1().then(() => {
        trackedAsyncData = asyncContext.get();
      });
    });

    // await wait(30)

    let trackedAsyncData2: any = {};
    track2().then(() => {
      trackedAsyncData2 = asyncContext.get();
    });

    Ѧ(await wait(100).Ѧ);

    expect(trackedAsyncData).toBe("Random Wrap");
    expect(trackedAsyncData2).toBe(undefined);
    expect(asyncContext.get()).toBe(undefined);
  });

  it("async (scenario 10): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      return `INNER`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    const results = Ѧ(await Promise.all([total(), total()]).Ѧ);

    expect(asyncContext.get()).toBe(undefined);
    expect(results).toEqual(["OUTER INNER", "OUTER INNER"]);
  });

  it("async (scenario 11): should know in which context it is", async () => {
    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      // console.log(SimpleAsyncContext.getStackId())
      Ѧ(await wait(30).Ѧ);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
      return `INNER`;
    });

    const inner2Callback = asyncContext.wrap("Inner2", async () => {
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner2");
      Ѧ(await wait(30).Ѧ);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner2");
      // console.log(SimpleAsyncContext.getStackId())
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner2");
      return `INNER2`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await inner2Callback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      return `OUTER ${value}`;
    });

    const total2 = asyncContext.wrap("Outer2", async () => {
      expect(asyncContext.get()).toBe("Outer2");
      const value = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer2");
      const value2 = Ѧ(await inner2Callback().Ѧ);
      expect(asyncContext.get()).toBe("Outer2");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer2");
      return `OUTER2 ${value2}`;
    });

    expect(asyncContext.get()).toBe(undefined);
    const results = Ѧ(await Promise.all([total(), total2(), total(), total2()]).Ѧ);

    expect(asyncContext.get()).toBe(undefined);
    expect(results).toEqual([
      "OUTER INNER",
      "OUTER2 INNER2",
      "OUTER INNER",
      "OUTER2 INNER2",
    ]);
  });

  it("async (scenario 12): should know in which context it is", async () => {
    const overflowInner = asyncContext.wrap("Overflow", async () => {
      expect(asyncContext.get()).toBe("Overflow");
      Ѧ(await wait(25).Ѧ);
      expect(asyncContext.get()).toBe("Overflow");
    });

    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      overflowInner();
      // console.log(SimpleAsyncContext.getStackId())
      Ѧ(await wait(30).Ѧ);
      overflowInner();
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
      return `INNER`;
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      const value = innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      const value2 = Ѧ(await overflowInner().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      const value3 = Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
    });

    Ѧ(await total().Ѧ);
    Ѧ(await wait(80).Ѧ);
  });


  it("async (scenario 13): should know in which context it is", async () => {
    const overflowInner = asyncContext.wrap("Overflow", async () => {
      setTimeout(async () => {
        expect(asyncContext.get()).toBe("Overflow");
        Ѧ(await wait(25).Ѧ);
        expect(asyncContext.get()).toBe("Overflow");
      }, 100)
    });

    const innerCallback = asyncContext.wrap("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      overflowInner();
      // console.log(SimpleAsyncContext.getStackId())
      Ѧ(await wait(30).Ѧ);
      overflowInner();
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      // console.log(SimpleAsyncContext.getStackId())
      expect(asyncContext.get()).toBe("Inner");
    });

    Ѧ(await asyncContext.run("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      innerCallback();
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await overflowInner().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
    }).Ѧ);
  });



  it("async (scenario 14): should know in which context it is", async () => {
    const value = new Date().toISOString();
    let checkCount = 0;;
    let result;
    Ѧ(await asyncContext.run(value, () => {
      return wait(30)
        .then(() => 1)
        .then(() => { throw 2 })
        .then(() => 3)
        .catch((r) => r)
        .finally(() => { })
        .then((v) => wait(30)
          .then(() => v + 1)
          .finally(() => {
            expect(asyncContext.get()).toBe(value);
            checkCount++;
          }))
        .then((v) => v + 1)
        .then(() => {
          expect(asyncContext.get()).toBe(value)
          result = asyncContext.get();
          checkCount++;
        })
    }).Ѧ);
    expect(checkCount).toBe(2);
    expect(result).toBe(value);
    expect(asyncContext.get()).toBe(undefined);
  });

});
