import { describe, it, expect } from 'vitest';
import { AsyncContext } from 'async-context-tc39';
import { wait } from "./_lib.js";

const Snapshot = AsyncContext.Snapshot;
type Snapshot = AsyncContext.Snapshot;

describe("AsyncContext / Snapshot", () => {
  it("can runs callback", () => {
    const snapshot = new Snapshot();
    const result = snapshot.run(() => "Done");
    expect(result).toBe("Done");
  });

  it("can wraps callback", () => {
    const snapshot = new Snapshot();
    const result = snapshot.wrap(() => "Done");
    expect(result()).toBe("Done");
  });

  it("snapshot (scenario 1): should know in which context it is", async () => {
    const asyncContext = new AsyncContext.Variable();
    let snapshot: Snapshot = null!;

    const total = asyncContext.wrap("Outer", async () => {
      snapshot = new Snapshot();
    });

    expect(asyncContext.get()).toBe(undefined);

    Ѧ(await total().Ѧ);

    expect(asyncContext.get()).toBe(undefined);

    snapshot.run(() => {
      expect(asyncContext.get()).toBe("Outer");
    });

    expect(asyncContext.get()).toBe(undefined);
  });

  it("snapshot (scenario 2): should know in which context it is", async () => {
    const asyncContext = new AsyncContext.Variable();
    let snapshot: Snapshot = null!;

    const total = asyncContext.wrap("Outer", async () => {
      Ѧ(await wait(100).Ѧ);
      snapshot = new Snapshot();
    });

    expect(asyncContext.get()).toBe(undefined);

    Ѧ(await total().Ѧ);

    expect(asyncContext.get()).toBe(undefined);

    snapshot.run(async () => {
      Ѧ(await wait(100).Ѧ);
      expect(asyncContext.get()).toBe("Outer");
    });

    expect(asyncContext.get()).toBe(undefined);
  });

  it("snapshot (scenario 3): should know in which context it is", async () => {
    let snapshot: Snapshot = null!;
    const asyncContext = new AsyncContext.Variable();
    const asyncContext2 = new AsyncContext.Variable();

    const innerCallback = asyncContext.wrap("Inner", async () => {
      return asyncContext2.run("Inner 2", async () => {
        Ѧ(await wait(100).Ѧ);
        snapshot = new Snapshot();
      });
    });

    const total = asyncContext.wrap("Outer", async () => {
      Ѧ(await innerCallback().Ѧ);
    });

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    Ѧ(await total().Ѧ);

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    snapshot.run(() => {
      expect(asyncContext.get()).toBe("Inner");
      expect(asyncContext2.get()).toBe("Inner 2");
    });

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);
  });

  it("snapshot (scenario 4): should know in which context it is", async () => {
    const asyncContext = new AsyncContext.Variable();
    const asyncContext2 = new AsyncContext.Variable();

    let snapshot;
    Ѧ(await asyncContext.run("Outer", () => {
      return asyncContext.run("Middle", async () => {
        asyncContext.get();
        Ѧ(await wait(100).Ѧ);
        return asyncContext2.run("Inner", async () => {
          asyncContext.get();
          Ѧ(await wait(100).Ѧ);
          snapshot = new Snapshot();
        });
      });
    }).Ѧ);

    snapshot!.run(() => {
      expect(asyncContext.get()).toBe("Middle");
      expect(asyncContext2.get()).toBe("Inner");
    });

    Ѧ(await wait(1000).Ѧ);
  });

  it("snapshot (scenario 5): should know in which context it is", async () => {
    const asyncContext = new AsyncContext.Variable();
    const asyncContext2 = new AsyncContext.Variable();

    let snapshot: Snapshot = null!;

    const innerCallback = asyncContext.wrap("Inner", async () => {
      return asyncContext2.run("Inner 2", async () => {
        expect(asyncContext.get()).toBe("Inner");
        asyncContext2.get();
        Ѧ(await wait(100).Ѧ);
        snapshot = new Snapshot();
        expect(asyncContext.get()).toBe("Inner");
      });
    });

    const total = asyncContext.wrap("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
    });

    Ѧ(await total().Ѧ);

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    snapshot.run(async () => {
      expect(asyncContext.get()).toBe("Inner");
      expect(asyncContext2.get()).toBe("Inner 2");
      Ѧ(await wait(100).Ѧ);

      asyncContext.run("Outer:WithinSnapshot", async () => {
        Ѧ(await wait(100).Ѧ);
        expect(asyncContext.get()).toBe("Outer:WithinSnapshot");
        expect(asyncContext2.get()).toBe("Inner 2");
      });
    });

    expect(asyncContext.get()).toBe(undefined);
    expect(asyncContext2.get()).toBe(undefined);

    Ѧ(await wait(1000).Ѧ);
  });

  it("scenario 6: should know in which context it is", () => {
    type Value = { id: number };
    const a = new AsyncContext.Variable<Value>();
    const b = new AsyncContext.Variable<Value>();
    const first = { id: 1 };
    const second = { id: 2 };

    const snapshotCallback = a.run(first, () => {
      const snapshot = new AsyncContext.Snapshot()
      return snapshot.wrap(() => {
        expect(a.get()).toBe(first);
        expect(b.get()).toBe(undefined);
      });
    });

    b.run(second, () => {
      snapshotCallback();
    });

    expect(a.get()).toBe(undefined);
    expect(b.get()).toBe(undefined);
  });
});
