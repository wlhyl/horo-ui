// Vitest-native spy utilities.
// Provides createSpy, createSpyObj, expectAsync and type aliases (Spy, SpyObj)
// so that spec files can create mocks without relying on the jasmine runtime.

import { vi, expect } from 'vitest';

/** A vitest mock function. Using `any` for maximum compatibility with vitest's MockInstance. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Spy = any;

/**
 * A mock of service type T: all public methods are replaced by `Spy`,
 * while the object remains structurally assignable to T.
 */
export type SpyObj<T> = T & {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? Spy : T[K];
};

/** Create a standalone spy function (jasmine.createSpy equivalent). */
export function createSpy(name?: string): Spy {
  const mock = name ? vi.fn().mockName(name) : vi.fn();
  return mock as unknown as Spy;
}

/**
 * Create a spy object whose methods are vi.fn() mocks.
 *
 * @param baseName   – name prefix for debugging
 * @param methodNames – method names to spy on
 * @param properties  – optional property names (string[]) or key→value
 *                     object (Record<string, any>). When provided, each
 *                     property is installed as a getter/setter pair of spies.
 */
export function createSpyObj<T extends Record<string, any>>(
  baseName: string | string[],
  methodNames: string[],
  properties?: string[] | Record<string, any>,
): SpyObj<T> {
  const obj: any = {};
  const nameStr =
    typeof baseName === 'string' ? baseName : (baseName as string[])[0];

  for (const methodName of methodNames) {
    if (methodName) {
      obj[methodName] = createSpy(`${nameStr}.${methodName}`);
    }
  }

  if (properties) {
    const entries: [string, any][] = Array.isArray(properties)
      ? properties.map((k) => [k, undefined] as [string, any])
      : Object.entries(properties);

    for (const [key, value] of entries) {
      const getter = createSpy(`${nameStr}.${key}.get`);
      getter.mockReturnValue(value);
      const setter = createSpy(`${nameStr}.${key}.set`);
      Object.defineProperty(obj, key, {
        get: getter as any,
        set: setter as any,
        configurable: true,
      });
    }
  }

  return obj as SpyObj<T>;
}

/**
 * Jasmine-style expectAsync wrapper for promise assertions.
 * Usage: await expectAsync(promise).toBeRejected();
 */
export function expectAsync<T>(promise: Promise<T>) {
  return {
    toBeResolved() {
      return expect(promise).resolves.toBeDefined();
    },
    toBeResolvedWith(value: any) {
      return expect(promise).resolves.toBe(value);
    },
    toBeRejected() {
      return expect(promise).rejects.toThrow();
    },
    toBeRejectedWith(value: any) {
      return expect(promise).rejects.toThrow(value);
    },
  };
}

// ---------------------------------------------------------------------------
// Zoneless fakeAsync / tick / flush replacements (backed by vitest timers)
// ---------------------------------------------------------------------------

/**
 * Wraps a test function so that vitest fake timers are active during its
 * execution.  This replaces Angular's `fakeAsync` which requires zone.js.
 */
export function fakeAsync(fn: () => void | Promise<void>): () => Promise<void> {
  return async () => {
    vi.useFakeTimers();
    try {
      await fn();
    } finally {
      vi.useRealTimers();
    }
  };
}

/**
 * Flush pending timers and promise microtasks (zoneless replacement for
 * Angular's `tick`). Must be awaited inside `fakeAsync(async () => {...})`.
 */
export async function tick(millis: number = 0): Promise<void> {
  await vi.advanceTimersByTimeAsync(millis);
  await Promise.resolve();
  await Promise.resolve();
}

/**
 * Flush all pending timers and microtasks (zoneless replacement for
 * Angular's `flush`). Must be awaited inside `fakeAsync(async () => {...})`.
 */
export async function flush(): Promise<void> {
  await Promise.resolve();
  await vi.runAllTimersAsync();
  await Promise.resolve();
  await Promise.resolve();
}

/** Flush pending microtasks (zoneless replacement for `flushMicrotasks`). */
export async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
