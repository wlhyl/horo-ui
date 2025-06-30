export function deepFreeze<T>(o: T): T {
  if (o === null || typeof o !== 'object') {
    return o;
  }

  Object.getOwnPropertyNames(o).forEach((prop) => {
    const v = (o as Record<string, any>)[prop];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) {
      deepFreeze(v);
    }
  });

  return Object.freeze(o);
}
