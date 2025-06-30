export function deepClone(obj: any): any {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  const newObj = new obj.constructor();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepClone(obj[key]);
    }
  }
  return newObj;
}