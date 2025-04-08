import { Map as ImmutableMap } from 'immutable'

type Context = ImmutableMap<number, unknown>;
const Context = () => ImmutableMap<number, unknown>();

const emptyContext = Context();
let currentContext = emptyContext;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AsyncContext {
    export interface VariableOptions<T> {
        name?: string;
        defaultValue?: T;
    }

    export class Variable<T> {
        static #variableId = 0;
        #id: number;
        #name = '';
        #defaultValue: T | undefined = undefined;

        constructor(options?: VariableOptions<T>) {
            this.#id = Variable.#variableId++;
            if (options) {
                if ("name" in options) {
                    this.#name = options.name as string;
                }
                this.#defaultValue = options.defaultValue;
            }
        }

        get name(): string {
            return this.#name;
        }

        get(): T | undefined {
            const value = currentContext.get(this.#id);
            return value === undefined
                ? this.#defaultValue
                : value as T;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        run<R>(value: T, fn: (...args: any[]) => R, ...args: any[]): R {
            const outerContext = currentContext;

            currentContext = value === undefined || value === this.#defaultValue
                ? currentContext = currentContext.remove(this.#id)
                : currentContext.set(this.#id, value);

            try {
                return fn(...args);
            } finally {
                currentContext = outerContext;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrap<Fn extends (...args: any) => any>(value: T, callback: Fn): Fn {
            return ((...args) => this.run(value, () => callback(...args))) as Fn;
        }
    }

    export class Snapshot {
        #context = currentContext;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        run<R>(fn: (...args: any[]) => R, ...args: any[]): R {
            const outerContext = currentContext;
            currentContext = this.#context;
            try {
                return fn(...args);
            } finally {
                currentContext = outerContext;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrap<Fn extends (...args: any) => any>(callback: Fn): Fn {
            return ((...args) => this.run(() => callback(...args))) as Fn;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        static wrap<T, R>(fn: (this: T, ...args: any[]) => R): (this: T, ...args: any[]) => R {
            const capturedContext = currentContext;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return function (this: T, ...args: any[]): R {
                const outerContext = currentContext;
                currentContext = capturedContext;
                try {
                    return fn.apply(this, args);
                } finally {
                    currentContext = outerContext;
                }
            }
        }
    }
};

export {
    Context,
    emptyContext,
};

export function getCurrentContext() {
    return currentContext;
}

export function setCurrentContext(context: Context) {
    currentContext = context;
}
