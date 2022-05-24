import 'zone.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/proxy';
import 'zone.js/testing';

/**
 * Patch Jest's describe/test/beforeEach/afterEach functions so test code
 * always runs in a testZone (ProxyZone).
 */
/* global Zone */
const Zone = (globalThis as any)['Zone'];

if (Zone === undefined) {
  throw new Error('Missing: Zone (zone.js)');
}

if ((globalThis as any)['__vitest_zone_patch__'] === true) {
  throw new Error("'jest' has already been patched with 'Zone'.");
}

(globalThis as any)['__vitest_zone_patch__'] = true;
const SyncTestZoneSpec = Zone['SyncTestZoneSpec'];
const ProxyZoneSpec = Zone['ProxyZoneSpec'];

if (SyncTestZoneSpec === undefined) {
  throw new Error('Missing: SyncTestZoneSpec (zone.js/dist/sync-test)');
}
if (ProxyZoneSpec === undefined) {
  throw new Error('Missing: ProxyZoneSpec (zone.js/dist/proxy.js)');
}

const env = globalThis;
const ambientZone = Zone.current;

// Create a synchronous-only zone in which to run `describe` blocks in order to
// raise an error if any asynchronous operations are attempted
// inside of a `describe` but outside of a `beforeEach` or `it`.
const syncZone = ambientZone.fork(new SyncTestZoneSpec('jest.describe'));
function wrapDescribeInZone(describeBody: any) {
  return function (...args: any) {
    return syncZone.run(describeBody, null, args);
  };
}

// Create a proxy zone in which to run `test` blocks so that the tests function
// can retroactively install different zones.
const testProxyZone = ambientZone.fork(new ProxyZoneSpec());
function wrapTestInZone(testBody: string | any[] | undefined) {
  if (testBody === undefined) {
    return;
  }

  const wrappedFunc = function () {
    return testProxyZone.run(testBody, null, arguments);
  };
  try {
    Object.defineProperty(wrappedFunc, 'length', {
      configurable: true,
      writable: true,
      enumerable: false,
    });
    wrappedFunc.length = testBody.length;
  } catch (e) {
    return testBody.length === 0
      ? () => testProxyZone.run(testBody, null)
      : (done: any) => testProxyZone.run(testBody, null, [done]);
  }

  return wrappedFunc;
}

/**
 * bind describe method to wrap describe.each function
 */
const bindDescribe = (originalJestFn: {
  apply: (
    arg0: any,
    arg1: any[]
  ) => {
    (): any;
    new (): any;
    apply: { (arg0: any, arg1: any[]): any; new (): any };
  };
}) =>
  function (...eachArgs: any) {
    return function (...args: any[]) {
      args[1] = wrapDescribeInZone(args[1]);

      return originalJestFn.apply(this, eachArgs).apply(this, args);
    };
  };

/**
 * bind test method to wrap test.each function
 */
const bindTest = (originalJestFn: {
  apply: (
    arg0: any,
    arg1: any[]
  ) => {
    (): any;
    new (): any;
    apply: { (arg0: any, arg1: any[]): any; new (): any };
  };
}) =>
  function (...eachArgs: any) {
    return function (...args: any[]) {
      args[1] = wrapTestInZone(args[1]);

      return originalJestFn.apply(this, eachArgs).apply(this, args);
    };
  };

['describe'].forEach((methodName) => {
  const originaljestFn = env[methodName];
  env[methodName] = function (...args: any[]) {
    args[1] = wrapDescribeInZone(args[1]);

    return originaljestFn.apply(this, args);
  };
  env[methodName].each = bindDescribe(originaljestFn.each);
  if (methodName === 'describe') {
    env[methodName].only = env['fdescribe'];
    env[methodName].skip = env['xdescribe'];
  }
});

['test', 'it'].forEach((methodName) => {
  const originaljestFn = env[methodName];
  env[methodName] = function (...args: any[]) {
    args[1] = wrapTestInZone(args[1]);

    return originaljestFn.apply(this, args);
  };
  env[methodName].each = bindTest(originaljestFn.each);

  if (methodName === 'test' || methodName === 'it') {
    env[methodName].todo = function (...args: any) {
      return originaljestFn.todo.apply(this, args);
    };
  }
});

['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
  const originaljestFn = env[methodName];
  env[methodName] = function (...args: any[]) {
    args[0] = wrapTestInZone(args[0]);

    return originaljestFn.apply(this, args);
  };
});
