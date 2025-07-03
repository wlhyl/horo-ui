export function deepFreeze<T>(o: T): T {
  const seen = new Set();

  function _deepFreeze(obj: T): T {
    if (obj === null || typeof obj !== 'object' || seen.has(obj)) {
      return obj;
    }

    seen.add(obj);

    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const v = (obj as Record<string, any>)[prop];
      if (v && typeof v === 'object' && !Object.isFrozen(v)) {
        _deepFreeze(v);
      }
    });

    return Object.freeze(obj);
  }

  return _deepFreeze(o);
}
