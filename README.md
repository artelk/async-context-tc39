# async-context-tc39
[![CI](https://img.shields.io/github/actions/workflow/status/artelk/async-context-tc39/ci.yml?branch=main)](https://github.com/artelk/async-context-tc39/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/async-context-tc39)](https://www.npmjs.com/package/async-context-tc39)

TC39 proposal implementation for AsyncContext.

## Summary

This is an implementation of the proposal https://github.com/tc39/proposal-async-context that works with JavaScript native `await`s in browser.
All the `await`s on the path between where the context value is set and where it is used should be wrapped into Ѧ-functions to capture and restore the current context
(that is required because the `await`s use a native mechanism that is not interceptable/hookable at all).
Use eslint-plugin-async-context-tc39 that will search for all the `await` expressions not wrapped into the Ѧ-functions in your project and fix them.

Most of the tests were copied from the project https://github.com/iliasbhal/simple-async-context (the TC39 implementation that requires the code to be built to ES6).

## Install

```bash
npm install async-context-tc39
```

## Usage:

```ts
import { AsyncContext } from 'async-context-tc39';

const asyncContext = new AsyncContext.Variable<string>();

//...
  it("test", async () => {
    const deepCallback = async () => {
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
    };

    const innerCallback = () => asyncContext.run("Inner", async () => {
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await deepCallback().Ѧ);
      expect(asyncContext.get()).toBe("Inner");
      Ѧ(await wait(30).Ѧ);
      expect(asyncContext.get()).toBe("Inner");
    });

    const total = () => asyncContext.run("Outer", async () => {
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
      Ѧ(await innerCallback().Ѧ);
      expect(asyncContext.get()).toBe("Outer");
    });

    expect(asyncContext.get()).toBe(undefined);
    Ѧ(await total().Ѧ);
    expect(asyncContext.get()).toBe(undefined);
  });
```

## Classes

```ts
namespace AsyncContext {
  class Variable<T> {
    constructor(options: AsyncVariableOptions<T>);
    get name(): string;
    get(): T | undefined;
    run<R>(value: T, fn: (...args: any[])=> R, ...args: any[]): R;
    wrap<Fn extends (...args: any) => any>(value: T, callback: Fn): Fn;
  }

  interface AsyncVariableOptions<T> {
    name?: string;
    defaultValue?: T;
  }

  class Snapshot {
    constructor();
    run<R>(fn: (...args: any[]) => R, ...args: any[]): R;
    static wrap<T, R>(fn: (this: T, ...args: any[]) => R): (this: T, ...args: any[]) => R;
  }
}
```

See README.md on https://github.com/tc39/proposal-async-context for datails
